"use strict";

module.exports = function(sequelize, DataTypes) {
  var Log = sequelize.define("Log", {
    sid:      DataTypes.INTEGER,
    message:  DataTypes.STRING
  });
  return Log;
};
