"use strict";

module.exports = function(sequelize, DataTypes) {
  var GPIO = sequelize.define("GPIO", {
    pin:      DataTypes.INTEGER,
    desc:     DataTypes.STRING,
    sid:     DataTypes.INTEGER,
    color:     DataTypes.STRING
  });

  return GPIO;
};
