import express from 'express'
import fs from 'fs';
import MapGenerator from '../../mapGenerator/mapGenerator';
import uuidv4 from '../utils/uuidv4';
var router = express.Router();

router.get('/', (req, res, next) => {
  res.send('maps');
});

router.get('/:id', (req, res, next) => {
  // use my orm to retrieve the map by id
  res.send('map by id');
});

router.post('/', async (req, res, next) => {
  const args = { latitude: 39.728958, longitude: -121.838783 };
  const generator = new MapGenerator(args);
  const geojson = fs.readFileSync(__dirname + '/../../mapGenerator/world.geojson');
  const [htmlPath, pdfPath] = await generator.generateMap(geojson);
  const uuid = uuidv4();
  const suffix = `pdfs/${uuid}.pdf`;
  const dest = `${__dirname}/../public/${suffix}`;
  fs.copyFile(pdfPath, dest, () => res.send(suffix));
});

module.exports = router;