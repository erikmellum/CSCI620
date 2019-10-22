const Promise = require('bluebird');
const EventEmitter = require('events');
const pdf = Promise.promisifyAll(require('html-pdf'));
const tmp = Promise.promisifyAll(require('tmp'));
const fs = require('fs');
const execAsync = Promise.promisify(require('child_process').exec);
const spawn = require('child_process').spawn;
const pdfOptions = require('./options');
const log = require('loglevel');
// CONSTANTS
const SOURCE_GEOJSON_PATH = `${__dirname}/world.geojson`;
const DESTINATION_GEOJSON_PATH = `${__dirname}/output.geojson`;

export default class MapGenerator extends EventEmitter {
  constructor({ latitude, longitude, tolerance = 20, loglevel }) {
    super();
    log.setLevel(loglevel || `DEBUG`);
    Object.assign(this, { latitude, longitude, tolerance, SOURCE_GEOJSON_PATH, DESTINATION_GEOJSON_PATH });
  }

  async generateMap(geojson) {
    log.debug('Generating map', this);
    const transformedGeojson = await this.transformGeojson(geojson);
    const mapHtml = this.generateMapHTML();
    const mapScript = this.generateMapScript(transformedGeojson);
    const css = this.generateCSS();
    const dir = await tmp.dirAsync();
    const html = `
      <head>
        <style>${css}</style>
      </head>
      <body>
        ${mapHtml}
        ${mapScript}
      </body>
    `;
    const pdfPath = await this.writePdf(html, dir);
    log.debug('pdfPath', pdfPath);
    return pdfPath;
  }

  async writePdf(html, dir) {
    log.debug('Writing PDF');
    // const htmlPath = `${dir}/output.html`;
    // fs.writeFileSync(htmlPath, html);
    const pdfResult = await pdf.createAsync(html, pdfOptions);
    const pdfPath = pdfResult.filename;
    await execAsync(`cp ${pdfPath} ${dir}`);
    return pdfPath;
  }

  generateCSS() {
    log.debug('Generating map css');
    return '';
  }

  generateMapScript(geojson) {
    log.debug('Generating map scripts');
    const script = `(function map() {
        var coords = {lat: ${this.latitude}, lng: ${this.longitude}};
        window.map = new google.maps.Map(document.getElementById('map'), {
          center: coords,
          zoom: 12,
        });
        var geojson = ${JSON.stringify(geojson)};
        var layer = new google.maps.Data();

        layer.addGeoJson(geojson);
        layer.setStyle({
          
        });
        layer.setMap(window.map);
        new google.maps.Marker({
          position: coords,
          map: window.map
        });
        window.map.setCenter(new google.maps.LatLng(window.map.getCenter().lat(), window.map.getCenter().lng() + .000000001));
      }());
      `;
    return script;
  }

  generateMapHTML() {
    log.debug('Generating map html');
    const html = `
      <div class="container">
        <div id="map" class="map"></div>
      </div>
    `;
    return html;
  }

  base64Encode(filepath) {
    // read binary data
    var bitmap = fs.readFileSync(filepath);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
  }

  async transformGeojson(geojson) {
    
    log.debug('Transforming geojson');
    const x_min   = this.longitude - this.tolerance,
          y_min   = this.latitude - this.tolerance,
          x_max   = this.longitude + this.tolerance,
          y_max   = this.latitude + this.tolerance;
    const options = ['-f', 'GeoJSON', DESTINATION_GEOJSON_PATH, SOURCE_GEOJSON_PATH, '-clipdst', x_min, y_min, x_max, y_max];
    const transformedGeojson = await this.ogr2ogr(options);
    return transformedGeojson;
  }

  ogr2ogr(options) {
    log.debug('ogr2ogr args:', options.join(" "));
    const ogr2ogr = spawn('ogr2ogr', options);
    return new Promise(resolve => {
      ogr2ogr.on('close', code => this.ogr2ogrClose(code, resolve));
    });
  }

  ogr2ogrClose(code, resolve) {
    if (code == 0) {
      const rawGeojson = fs.readFileSync(this.DESTINATION_GEOJSON_PATH, 'utf-8')
      let geojson = JSON.parse(rawGeojson);
      return resolve(geojson);
    } else {
      log.trace(`Error reading JSON from: ${this.DESTINATION_GEOJSON_PATH}`);
      throw(new Error(code));
    }
  }
}