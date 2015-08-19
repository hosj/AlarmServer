"use strict";

module.exports = function(sequelize, DataTypes) {
  var GPIO = sequelize.define("GPIO", {
    pin:     DataTypes.INTEGER,
    gpio:    DataTypes.INTEGER,
    name:    DataTypes.STRING,
    alt:    DataTypes.STRING,
    sid:     DataTypes.INTEGER,
    color:   DataTypes.STRING
  });
  return GPIO;
};
