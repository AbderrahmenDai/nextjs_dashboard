const express = require('express');
const router = express.Router();
const {
    getCandidatures,
    createCandidature,
    updateCandidature,
    deleteCandidature
} = require('../controllers/candidatureController');

router.get('/', getCandidatures);
router.post('/', createCandidature);
router.put('/:id', updateCandidature);
router.delete('/:id', deleteCandidature);

module.exports = router;
