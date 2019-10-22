import MapGenerator from './mapGenerator';
import fs from 'fs';
import opn from 'opn';

const args = { latitude: 39.728958, longitude: -121.838783 };
const generator = new MapGenerator(args);
const geojson = fs.readFileSync('./world.geojson');
(async () => {
  const [htmlPath, pdfPath] = await generator.generateMap(geojson);
  opn(pdfPath);
  opn(htmlPath);
})();