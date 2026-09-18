const app = require('./app');
const db = require('./db');
const { seedData } = require('./db/seed');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('🔄 Inicializando base de datos...');
    await db.initDb();
    console.log(`📦 Modo de base de datos en uso: ${db.getDbMode().toUpperCase()}`);

    // Semillas demostrativas
    await seedData();

    app.listen(PORT, () => {
      console.log(`\n=================================================`);
      console.log(`🚀 Cobrate Backend API escuchando en el puerto ${PORT}`);
      console.log(`🌐 URL base: http://localhost:${PORT}/api`);
      console.log(`🔐 Admin inicial: "${process.env.ADMIN_USERNAME || 'admin'}" / "${process.env.ADMIN_PASSWORD || 'admin123'}"`);
      console.log(`=================================================\n`);
    });
  } catch (err) {
    console.error('❌ Error fatal al iniciar el servidor:', err);
    process.exit(1);
  }
}

startServer();
