"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    name:             DataTypes.STRING,
    email:            DataTypes.STRING,
    sms:              DataTypes.STRING,
    proximity_arm:    DataTypes.BOOLEAN,
    notify_email:     DataTypes.BOOLEAN,
    notify_sms:       DataTypes.BOOLEAN,
    notify_gcm:       DataTypes.BOOLEAN,
    ip:               DataTypes.STRING,
    mac:              DataTypes.STRING,
    location:         DataTypes.INTEGER,
    last_seen:        DataTypes.DATE
  });
  return User;
};
