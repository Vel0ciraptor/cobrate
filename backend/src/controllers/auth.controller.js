const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const userResult = await db.query(
      'SELECT id, username, password_hash, created_at FROM users WHERE username = $1',
      [username.trim()]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const payload = {
      id: user.id,
      username: user.username,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'cobrate_secret_key_jwt_2026_finance_app',
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error interno en el servidor' });
  }
}

async function getMe(req, res) {
  try {
    return res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener usuario actual' });
  }
}

module.exports = {
  login,
  getMe,
};
