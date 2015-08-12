
"use strict";

module.exports = function(sequelize, DataTypes) {
  var House = sequelize.define("House", {
    name:                       DataTypes.STRING,
    armed:                      DataTypes.BOOLEAN,
    buzzer:                     DataTypes.BOOLEAN,
    buzzer_pin:                 DataTypes.INTEGER,
    buzzer_length:              DataTypes.INTEGER,
    proximity_arm:              DataTypes.BOOLEAN,
    time_arm:                   DataTypes.BOOLEAN,
    time_arm_start:             DataTypes.STRING,
    time_arm_end:               DataTypes.STRING,
    status_light:               DataTypes.BOOLEAN,
    status_light_armed_pin:     DataTypes.INTEGER,
    status_light_disarmed_pin:  DataTypes.INTEGER
  });

  return House;
};
