var express = require('express');

import mapGenerator from '../../mapGenerator/mapGenerator';

var router = express.Router();

router.get('/', (req, res, next) => {
  res.send('maps');
});

router.get('/:id', (req, res, next) => {
  res.send('map by id');
});

router.post('/', (req, res, next) => {
  const args = { latitude: 39.728958, longitude: -121.838783 };
  const generator = new MapGenerator(args);
  const geojson = fs.readFileSync('../../mapGenerator/world.geojson');
  const [htmlPath, pdfPath] = await generator.generateMap(geojson);
  res.sendFile(pdfPath);
});

module.exports = router;