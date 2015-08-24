var models  = require('../models');
var express   = require('express');
var router    = express.Router();
var net = require('net');
// middleware to use for all requests
router.use(function(req, res, next) {
    // Auth stuff so only we can control our house
    //console.log('Something is happening.');
    res.setHeader('Last-Modified', (new Date()).toUTCString());
    next(); // make sure we go to the next routes and don't stop here
});

/* GET welcome */
router.get('/', function(req, res, next) {
  res.json({"message":"Welcome to our api!"});
});

//     ###    ########  ##     ##
//    ## ##   ##     ## ###   ###
//   ##   ##  ##     ## #### ####
//  ##     ## ########  ## ### ##
//  ######### ##   ##   ##     ##
//  ##     ## ##    ##  ##     ##
//  ##     ## ##     ## ##     ##
function arm(res){
  return socket(res,'arm');
}
//  ########  ####  ######     ###    ########  ##     ##
//  ##     ##  ##  ##    ##   ## ##   ##     ## ###   ###
//  ##     ##  ##  ##        ##   ##  ##     ## #### ####
//  ##     ##  ##   ######  ##     ## ########  ## ### ##
//  ##     ##  ##        ## ######### ##   ##   ##     ##
//  ##     ##  ##  ##    ## ##     ## ##    ##  ##     ##
//  ########  ####  ######  ##     ## ##     ## ##     ##
function disarm(res){
  return socket(res,'disarm');
}
//   ######   #######   ######  ##    ## ######## ########
//  ##    ## ##     ## ##    ## ##   ##  ##          ##
//  ##       ##     ## ##       ##  ##   ##          ##
//   ######  ##     ## ##       #####    ######      ##
//        ## ##     ## ##       ##  ##   ##          ##
//  ##    ## ##     ## ##    ## ##   ##  ##          ##
//   ######   #######   ######  ##    ## ########    ##
function socket(res,what){
  var err = '';
  var client = new net.Socket();
  client.connect(50000, '127.0.0.1', function() {
    client.write(what);
  });

  client.on('data', function(data) {
    client.destroy(); // kill client after server's response
  });

  client.on('close', function() {
    res.json({"message":err})
  });

  client.on('error', function() {
    err = 'Error';
  });
}


// GPIO
router.route('/gpio')
  /* GET all zones */
  .get(function(req, res, next) {
    models.GPIO.findAll({order: [['pin', 'ASC']]}).then(function(gpios) {
      res.json(gpios);
    });
  })













//  ########  #######  ##    ## ########  ######
//       ##  ##     ## ###   ## ##       ##    ##
//      ##   ##     ## ####  ## ##       ##
//     ##    ##     ## ## ## ## ######    ######
//    ##     ##     ## ##  #### ##             ##
//   ##      ##     ## ##   ### ##       ##    ##
//  ########  #######  ##    ## ########  ######
/*========================================================================================================================================
      Zone Management
*/
router.route('/zones')
  /* GET all zones */
  .get(function(req, res, next) {
    models.Zone.findAll().then(function(zones) {
      res.json(zones);
    });
  })
  /* POST add a zone */
  .post(function(req, res, next) {
    models.Zone.create(
      {
        name : req.body.name
      }
    ).then(res.json({ message: 'Zone created!' }));
  });

router.route('/zones/:zone_id')
  /* GET one zone */
  .get(function(req, res, next) {
    Zone.findById(req.params.zone_id, function(err, zone) {
      if (err)
        res.send(err);
      res.json(zone);
    });
  })
  /* PUT update one zone */
  .put(function(req, res, next) {// use our bear model to find the bear we want
    Zone.findById(req.params.zone_id, function(err, zone) {
      if (err)
        res.send(err);
      zone.name = req.body.name;  // update the zones info
      // save the zone
      zone.save(function(err) {
        if (err)
          res.send(err);
        res.json({ message: 'Zone updated!' });
      });
    });
  })
  /* DELETE remove one zone */
  .delete(function(req, res, next) {
    Zone.remove(
      {
        _id: req.params.zone_id
      }, function(err, zone) {
        if (err)
          res.send(err);
        res.json({ message: 'Zone deleted' });
      });
  });
  //   ######  ######## ##    ##  ######   #######  ########   ######
  //  ##    ## ##       ###   ## ##    ## ##     ## ##     ## ##    ##
  //  ##       ##       ####  ## ##       ##     ## ##     ## ##
  //   ######  ######   ## ## ##  ######  ##     ## ########   ######
  //        ## ##       ##  ####       ## ##     ## ##   ##         ##
  //  ##    ## ##       ##   ### ##    ## ##     ## ##    ##  ##    ##
  //   ######  ######## ##    ##  ######   #######  ##     ##  ######
/*========================================================================================================================================
      Sensor Management
*/
router.route('/sensors')
  /* GET all sensors */
  .get(function(req, res, next) {
    models.Sensor.findAll().then(function(sensors) {
      res.json(sensors);
    });
  })
  /* POST add a sensor */
  .post(function(req, res, next) {
    models.Sensor.create(
      {
        name : req.body.name,
        zone : req.body.zone,
        type : req.body.type,
        enabled : req.body.enabled,
        normal : parseInt(req.body.normal),
        GPIO : parseInt(req.body.gpio),
        current : null
      }
    ).then(function(err){
      res.json({ message: 'Sensor created!' });
    });
  });

router.route('/sensors/:sensor_id')
  /* GET one sensor */
  .get(function(req, res, next) {
    Sensor.findById(req.params.sensor_id, function(err, sensor) {
      if (err)
        res.send(err);
      res.json(sensor);
    });
  })
  /* PUT update one sensor */
  .put(function(req, res, next) {
    Sensor.findById(req.params.sensor_id, function(err, sensor) {
      if (err)
        res.send(err);
      sensor.name = req.body.name;  // update the sensors info
      // save the sensor
      sensor.save(function(err) {
        if (err)
          res.send(err);
        res.json({ message: 'Sensor updated!' });
      });
    });
  })
  /* DELETE remove one sensor */
  .delete(function(req, res, next) {
    Sensor.remove(
      {
        _id: req.params.sensor_id
      }, function(err, sensor) {
        if (err)
          res.send(err);
        res.json({ message: 'Successfully deleted' });
      });
  });
  //  ######## ##    ## ########  ########
  //     ##     ##  ##  ##     ## ##
  //     ##      ####   ##     ## ##
  //     ##       ##    ########  ######
  //     ##       ##    ##        ##
  //     ##       ##    ##        ##
  //     ##       ##    ##        ########
/*========================================================================================================================================
      Type Management
*/
router.route('/types')
  /* GET all types */
  .get(function(req, res, next) {
    models.SensorType.findAll().then(function(types) {
      res.json(types);
    });
  })
  /* POST add a type */
  .post(function(req, res, next) {
    models.SensorType.create({
      name          : req.body.name
    }).then(res.json({ message: 'Type created!' } ));
  });




  //   ######  ######## ##    ##  ######   #######  ########      ######  ########    ###    ######## ##     ##  ######
  //  ##    ## ##       ###   ## ##    ## ##     ## ##     ##    ##    ##    ##      ## ##      ##    ##     ## ##    ##
  //  ##       ##       ####  ## ##       ##     ## ##     ##    ##          ##     ##   ##     ##    ##     ## ##
  //   ######  ######   ## ## ##  ######  ##     ## ########      ######     ##    ##     ##    ##    ##     ##  ######
  //        ## ##       ##  ####       ## ##     ## ##   ##            ##    ##    #########    ##    ##     ##       ##
  //  ##    ## ##       ##   ### ##    ## ##     ## ##    ##     ##    ##    ##    ##     ##    ##    ##     ## ##    ##
  //   ######  ######## ##    ##  ######   #######  ##     ##     ######     ##    ##     ##    ##     #######   ######
/*========================================================================================================================================
      Sensor Status
*/
// Get all window sensors
router.route('/windows/')
  /* GET one sensor */
  .get(function(req, res, next) {
    models.Sensor.findAll({where: {"type":"window"} }).then(function(sensor) {
      res.json(sensor);
    });
  })

// Get all window sensors that are enabled
router.route('/windows/enabled')
  /* GET one sensor */
  .get(function(req, res, next) {
    models.Sensor.findAll({"enabled": true,"type":"window"}).then(function(sensor) {
      res.json(sensor);
    });
  })

// Get all door sensors
router.route('/doors/')
  /* GET one sensor */
  .get(function(req, res, next) {
    models.Sensor.findAll({where: {"type":"door"} }).then(function( sensor) {
      res.json(sensor);
    });
  })

// Get all door sensors that are enabled
router.route('/doors/enabled')
  /* GET one sensor */
  .get(function(req, res, next) {
    models.Sensor.findAll({"enabled": true,"type":"door"}).then(function(err, sensor) {
      if (err)
        res.send(err);
      res.json(sensor);
    });
  });

// Get all door sensors
router.route('/garage/')
  /* GET one sensor */
  .get(function(req, res, next) {
    models.Sensor.findAll({where: {"type":"overhead_door"} }).then(function( sensors) {
      sensors = JSON.parse(JSON.stringify(sensors)); // change to json
      for ( i=0;i<sensors.length;i++){
        sensors[i].opener = true;
      }
      res.json(sensors);
    });
  });
router.route('/garage/open/:id')
  /* GET one sensor */
  .post(function(req, res, next) {
    models.Sensor.find({where: {"id":req.params.id} }).then(function( sensors) {
      socket(res,"open|" + sensors.gpio);
    });
  });
router.route('/garage/close/:id')
  /* GET one sensor */
  .post(function(req, res, next) {
    models.Sensor.find({where: {"id":req.params.id} }).then(function( sensors) {
      res.json({"message":""});
    });
  });

// Get all door sensors that are enabled
router.route('/garage/enabled')
  /* GET one sensor */
  .get(function(req, res, next) {
    models.Sensor.findAll({"enabled": true,"type":"overhead_door"}).then(function(err, sensors) {
      if (err)
        res.send(err);
      sensors = JSON.parse(sensors);
      for ( i=0;i<sensors.length;i++){
        sensors[i].opener = true;
      }
      res.json(sensors);
    });
  });




  //   ######  ##    ##  ######  ######## ######## ##     ##     ######  ########    ###    ######## ##     ##  ######
  //  ##    ##  ##  ##  ##    ##    ##    ##       ###   ###    ##    ##    ##      ## ##      ##    ##     ## ##    ##
  //  ##         ####   ##          ##    ##       #### ####    ##          ##     ##   ##     ##    ##     ## ##
  //   ######     ##     ######     ##    ######   ## ### ##     ######     ##    ##     ##    ##    ##     ##  ######
  //        ##    ##          ##    ##    ##       ##     ##          ##    ##    #########    ##    ##     ##       ##
  //  ##    ##    ##    ##    ##    ##    ##       ##     ##    ##    ##    ##    ##     ##    ##    ##     ## ##    ##
  //   ######     ##     ######     ##    ######## ##     ##     ######     ##    ##     ##    ##     #######   ######
/*========================================================================================================================================
      System Status
*/
// Get status of the system
router.route('/system')
  /* GET one sensor */
  .get(function(req, res, next) {
    // Get house
    models.House.findOne().then(function(house) {
      //load tripped sensors
      models.Sensor.findAll({ where:  { normal : {$ne : models.Sequelize.col('current')} } }).then(function(sensors) {
        var d = JSON.parse(JSON.stringify(house));
        d.tripped = sensors.length;
        // load users
        models.User.findAll().then(function(users) {
          d.users = users;
          res.json(d);
        });
      });
  });
})

//   ######  ##    ##  ######  ######## ######## ##     ##       ###    ########  ##     ##
//  ##    ##  ##  ##  ##    ##    ##    ##       ###   ###      ## ##   ##     ## ###   ###
//  ##         ####   ##          ##    ##       #### ####     ##   ##  ##     ## #### ####
//   ######     ##     ######     ##    ######   ## ### ##    ##     ## ########  ## ### ##
//        ##    ##          ##    ##    ##       ##     ##    ######### ##   ##   ##     ##
//  ##    ##    ##    ##    ##    ##    ##       ##     ##    ##     ## ##    ##  ##     ##
//   ######     ##     ######     ##    ######## ##     ##    ##     ## ##     ## ##     ##
/*========================================================================================================================================
      System Control
*/
// arm or disarm the system
router.route('/system/arm')
  .post(function(req, res, next) {
    // Get the house
    models.House.findOne().then(function(house) {

      // if we are arming check if sensors are tripped
      if ( !house.armed ){
          models.Sensor.findAll({ where:  { normal : {$ne : models.Sequelize.col('current')} } }).then(function(sensors){
            if ( sensors.length > 0 ){
              res.json({"message":"There are 1 or more Sensors that are currently tripped. Close doors and windows to arm the system.","title":"Unable to arm the system"});
            }else{
              arm(res);
              //res.json({"message":""});
            }
          })
      }else{
        disarm(res);
        //res.json({"message":""});
      }
    });
})
//   ######  ##     ## ##     ## ######## ########   #######  ##      ## ##    ##
//  ##    ## ##     ## ##     ##    ##    ##     ## ##     ## ##  ##  ## ###   ##
//  ##       ##     ## ##     ##    ##    ##     ## ##     ## ##  ##  ## ####  ##
//   ######  ######### ##     ##    ##    ##     ## ##     ## ##  ##  ## ## ## ##
//        ## ##     ## ##     ##    ##    ##     ## ##     ## ##  ##  ## ##  ####
//  ##    ## ##     ## ##     ##    ##    ##     ## ##     ## ##  ##  ## ##   ###
//   ######  ##     ##  #######     ##    ########   #######   ###  ###  ##    ##
router.route('/system/shutdown')
.post(function(req, res, next) {
  socket(res,'shutdown');
})
//  ########  ########  ######  ########    ###    ########  ########
//  ##     ## ##       ##    ##    ##      ## ##   ##     ##    ##
//  ##     ## ##       ##          ##     ##   ##  ##     ##    ##
//  ########  ######    ######     ##    ##     ## ########     ##
//  ##   ##   ##             ##    ##    ######### ##   ##      ##
//  ##    ##  ##       ##    ##    ##    ##     ## ##    ##     ##
//  ##     ## ########  ######     ##    ##     ## ##     ##    ##
router.route('/system/restart')
.post(function(req, res, next) {
  socket(res,'restart');
})
//  ########  ######## ##        #######     ###    ########     ########  ########
//  ##     ## ##       ##       ##     ##   ## ##   ##     ##    ##     ## ##     ##
//  ##     ## ##       ##       ##     ##  ##   ##  ##     ##    ##     ## ##     ##
//  ########  ######   ##       ##     ## ##     ## ##     ##    ##     ## ########
//  ##   ##   ##       ##       ##     ## ######### ##     ##    ##     ## ##     ##
//  ##    ##  ##       ##       ##     ## ##     ## ##     ##    ##     ## ##     ##
//  ##     ## ######## ########  #######  ##     ## ########     ########  ########
router.route('/system/reloaddb')
.post(function(req, res, next) {
  socket(res,'reload');
})


//   ######  ##    ##  ######  ######## ######## ##     ##     ######  ######## ########
//  ##    ##  ##  ##  ##    ##    ##    ##       ###   ###    ##    ## ##          ##
//  ##         ####   ##          ##    ##       #### ####    ##       ##          ##
//   ######     ##     ######     ##    ######   ## ### ##     ######  ######      ##
//        ##    ##          ##    ##    ##       ##     ##          ## ##          ##
//  ##    ##    ##    ##    ##    ##    ##       ##     ##    ##    ## ##          ##
//   ######     ##     ######     ##    ######## ##     ##     ######  ########    ##
router.route('/system/set')
.post(function(req, res, next) {
  models.House.findOne().then(function(house) {
    if (house) { // if the record exists in the db
      attr = {};
      // These are hard coded so nobody can use this to set anything they want to whatever they want.
      switch (req.body.key){

        // Enable/Disable Status Lights
        case 'lights':
          attr['status_light'] = req.body.value
          break;

        // Sets the armed status light pin
        case 'armed_pin':
          attr['status_light_armed_pin'] = req.body.value
          break;

        // Sets the disarmed status light pin
        case 'disarmed_pin':
          attr['status_light_disarmed_pin'] = req.body.value
          break;

        // Enable/Disable Buzzer
        case 'buzzer':
          attr['buzzer'] = req.body.value
          break;

        // Sets the buzzer pin
        case 'buzzer_pin':
          attr['buzzer_pin'] = req.body.value
          break;

        // Sets the buzzer length in seconds
        case 'buzzer_length':
          attr['buzzer_length'] = req.body.value
          break;

        // Enable/Disable Time Arm
        case 'time':
          attr['time_arm'] = req.body.value
          break;

        // Sets the time when the system auto arms
        case 'arm_time':
          attr['time_arm_start'] = req.body.value
          break;

        //  Sets the time when the system auto disarms
        case 'disarm_time':
          attr['time_arm_end'] = req.body.value
          break;

        // Enable/Disable Proximity Arm
        case 'proximity':
          if ( req.body.value == 0 ){
            socket(res,'proximity_shutdown');
          }else{
            socket(res,'proximity_start');
          }
          return;
          break;

        default:
          res.json({"message":"error"})
          return;
      }

      house.updateAttributes(attr).then(function() {
        res.json({"message":"success"})
      });
    }else{
      res.json({"message":"error"})
    }
  })
})

//   ######  ##    ##  ######  ######## ######## ##     ##     ######  ######## ######## ##     ## ########
//  ##    ##  ##  ##  ##    ##    ##    ##       ###   ###    ##    ## ##          ##    ##     ## ##     ##
//  ##         ####   ##          ##    ##       #### ####    ##       ##          ##    ##     ## ##     ##
//   ######     ##     ######     ##    ######   ## ### ##     ######  ######      ##    ##     ## ########
//        ##    ##          ##    ##    ##       ##     ##          ## ##          ##    ##     ## ##
//  ##    ##    ##    ##    ##    ##    ##       ##     ##    ##    ## ##          ##    ##     ## ##
//   ######     ##     ######     ##    ######## ##     ##     ######  ########    ##     #######  ##
/*========================================================================================================================================
      System Setup
*/
// put initial settings
router.route('/system/setup')
.post(function(req, res, next) {
  models.House.create({
    name          : req.body.name
  }).then(res.json({message:""}));
})






// Logs
router.route('/logs')
.get(function(req, res, next) {
  models.Log.findAll(
    {"order":[["id","DESC"]],"limit": 10}).then(function(logs){
    res.json(logs);
  });
})
.post(function(req, res, next) {
  models.Log.findAll(
    {"order":[["id","DESC"]],"limit": req.body.count}).then(function(logs){
    res.json(logs);
  });
})






module.exports = router;
