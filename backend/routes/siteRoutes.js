const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');

router.get('/', siteController.getSites);
router.put('/:id', siteController.updateSite);

module.exports = router;
