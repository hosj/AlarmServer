"use strict";

module.exports = function(sequelize, DataTypes) {
  var GPIO = sequelize.define("GPIO", {
    pin:      DataTypes.INTEGER,
    gpio:     DataTypes.INTEGER,
    name:     DataTypes.STRING,
    function: DataTypes.STRING,
    inuse:    DataTypes.BOOLEAN
  });

  return GPIO;
};
