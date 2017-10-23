var express = require("express");
var app = express();

const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

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

    /*var newStation = new Station("AuthToken", 5);
    mysql.saveJson("stationen", newStation)
    .then((result)=>{
        console.log(result);
    })
    .catch((err) => {
        console.log(err);
    });*/

    //var newUser = new User(1);
    /*mysql.getUser(1).then((result) => {
        res.send(JSON.stringify(result));
    })
    .catch((err) => {
        res.send(err);
    })*/
    res.send("a")
    //res.send(JSON.stringify(newSession));
});

app.get("/stations", function(req, res){
    mysql.getAllStations()
    .then((result) => {
        res.send(result);
    })
    .catch((err) => {
        console.log(err);
        res.send(err);
    })
});

//Auth endpoints
const auth = require("./lib/auth.js");

app.post("/login", function(req, res){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if(req.body.username && req.body.password){
        auth.login(req.body.username, req.body.password, ip)
        .then((result) => {
            res.send({"session_id":result});
        })
        .catch((err) => {
            res.status(505).send(err)
        })
    }else{
        res.status(400).send("Bad request");
    }
});

app.post("/register", function(req, res){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log("Register request. IP:", ip);
    if(req.body.username && req.body.password){
        auth.register(req.body.username, req.body.password)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.status(505).send(err)
        })
    }else{
        res.status(400).send("Bad request");
    }
});

app.post("/logout", function(req, res){
    if(req.body.session_id){
        auth.logout(req.body.session_id)
        .then(() => {
            res.send("Deleted");
        })
        .catch((err) => {
            res.send(err)
        })
    }else{
        res.send("No session_id")
    }
})

app.listen(8888, function(){
    console.log("Server started on Port: 8888");
});