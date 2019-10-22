var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
  res.send('maps');
});

router.get('/:id', (req, res, next) => {
  res.send('map by id');
});

router.post('/', (req, res, next) => {
  res.send('create map', req.body);
});

module.exports = router;