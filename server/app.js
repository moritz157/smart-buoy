var express = require("express");
var app = express();

var mysql = require("./lib/mysql-adapter.js");
mysql.connect();

var Session = require("./lib/session.class.js");
var User = require("./lib/user.class.js");
var Measurement = require("./lib/measurement.class.js");
var Station = require("./lib/station.class.js");
const MeasurementTypes = require("./lib/measurement.types.js");

app.get("/", function(req, res){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var newSession = new Session(0, ip);
    //mysql.saveJson("sessions", newSession);
    var newMeasurement = new Measurement(1, MeasurementTypes.AIR_TEMPERATURE, 24.4, 49.921875, -52.482780222078205);
    //mysql.saveJson("measurement_values", newMeasurement);

    var newStation = new Station("Hello", 1);
    //mysql.saveJson("stationen", newStation);

    //var newUser = new User(1);
    mysql.getUser(1).then((result) => {
        res.send(JSON.stringify(result));
    })
    .catch((err) => {
        res.send(err);
    })

    //res.send(JSON.stringify(newSession));
})


app.listen(8888, function(){
    console.log("Server started on Port: 8888");
});