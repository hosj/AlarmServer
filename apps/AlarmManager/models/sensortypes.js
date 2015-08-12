"use strict";

module.exports = function(sequelize, DataTypes) {
  var SensorType = sequelize.define("SensorType", {
    name:         DataTypes.STRING,
    description:  DataTypes.TEXT
  });

  return SensorType;
};
