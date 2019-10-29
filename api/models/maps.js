const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');

class Map extends Model { }

Map.init({
  name: DataTypes.STRING,
  mapDir: DataTypes.STRING,
}, { sequelize, modelName: 'map' });

sequelize.sync()
  .then(() => Map.create({
    name: 'Map #1',
    mapDir: '/Users/erikmellum/projects/CSCI620/api/artifacts/maps/1.pdf'
  }))
  .then(map => {
    console.log(map.toJSON());
  });