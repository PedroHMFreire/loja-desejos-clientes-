const express = require('express');
const router = express.Router();
const desejoController = require('../controllers/desejoController');

router.get('/produtos', desejoController.getProdutos);
router.get('/desejos', desejoController.getDesejos);
router.post('/desejos', desejoController.createDesejo);

module.exports = router;
