const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clients.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Todas las rutas de clientes requieren autenticación administrativa
router.use(authMiddleware);

router.get('/', clientsController.getClients);
router.get('/:id', clientsController.getClientById);
router.post('/', clientsController.createClient);
router.put('/:id', clientsController.updateClient);
router.delete('/:id', clientsController.deleteClient);

module.exports = router;
