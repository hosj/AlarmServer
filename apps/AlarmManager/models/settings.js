
"use strict";

module.exports = function(sequelize, DataTypes) {
  var Setting = sequelize.define("Setting", {
    name:                     DataTypes.STRING,
    value_bool:               DataTypes.BOOLEAN,
    value_int:                DataTypes.INTEGER,
    value_float:              DataTypes.FLOAT,
    value_string:             DataTypes.STRING,
    value_time:             DataTypes.TIME,
  });

  return Setting;
};
