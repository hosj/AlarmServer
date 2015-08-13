"use strict";

module.exports = function(sequelize, DataTypes) {
  var GCM = sequelize.define("GCM", {
    user_id:          DataTypes.INTEGER,
    reg_key:            DataTypes.STRING
  });
  return GCM;
};
