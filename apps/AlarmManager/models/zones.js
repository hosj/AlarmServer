"use strict";

module.exports = function(sequelize, DataTypes) {
  var Zone = sequelize.define("Zone", {
    name:         DataTypes.STRING,
    description:  DataTypes.TEXT
  });

  return Zone;
};
