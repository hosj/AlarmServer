"use strict";

module.exports = function(sequelize, DataTypes) {
  var Sensor = sequelize.define("Sensor", {
    name:     DataTypes.STRING,
    zone:     DataTypes.STRING,
    type:     DataTypes.STRING,
    pin:     DataTypes.INTEGER,
    GPIO:     DataTypes.INTEGER,
    enabled:  DataTypes.BOOLEAN,
    normal:   DataTypes.INTEGER,
    current:  DataTypes.INTEGER
  });
  return Sensor;
};
