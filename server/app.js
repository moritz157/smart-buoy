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

app.use(function(req, res, next){
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:7777");
    next();
})

/**
 * @api {get} / root
 * @apiGroup main
 * 
 */
app.get("/", function(req, res){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    res.send("smart-buoy<br>Status: Online");
});

/**
 * @api {get} /stations getStations
 * @apiGroup main
 * @apiDescription Get all stations
 * 
 * @apiGroup main
 */
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

/**
 * @api {post} /stationAuthToken getAuthToken
 * @apiGroup main
 * @apiDescription Get the auth token of a specified station you own
 * 
 * @apiParam {String} session_id Your session_id
 * @apiParam {Number} station The station's id
 */
app.post("/stationAuthToken", function(req, res){
    if(req.body.session_id && req.body.station){
        mysql.getStationAuthToken(req.body.station, req.body.session_id)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            throw err;
            res.send("Error found:" + err);
        })
    }else{
        res.send("Bad request");
    }
});

/**
 * @api {get} /measurements/:station getMeasurements
 * @apiGroup main
 * @apiDescription Get all measurements of a specified station
 * 
 * @apiParam {Number} station The station's id
 */
app.get("/measurements/:station", function(req, res){
    if(req.params.station){
        console.log("Station:", req.params.station)
        mysql.listMeasurements(req.params.station)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.send("Error:", err);
        })
    }else{
        res.send("Bad request");
    }
});

//Auth endpoints
const auth = require("./lib/auth.js");

/**
 * @api {post} /login login
 * @apiGroup auth
 * 
 * @apiParam {String} username Your username
 * @apiParam {String} password Your password (Note: If you build your own client, please use encryption when transmitting the credentials)
 */
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

/**
 * @api {post} /register register
 * @apiGroup auth
 * 
 * @apiParam {String} username Your username
 * @apiParam {String} password Your password
 */
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

/**
 * @api {post} /logout logout
 * @apiGroup auth
 * 
 * @apiParam {String} session_id Your session id
 */
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
});

//Endpoints for stations

/**
 * @api {post} /submitMeasurement submitMeasurement
 * @apiGroup stations
 * 
 * @apiParam {String} token The station's auth token
 * @apiParam {Object[]} measurements The measurements
 */
app.post("/submitMeasurement", function(req, res){
    if(req.body.token && req.body.measurements){
        auth.validateAuthToken(req.body.token)
        .then((result) => {
            mysql.insertMeasurements(result.id, req.body.measurements)
            .then(() => {
                res.send("Inserted");
            })
            .catch((err) => {
                console.log(err);
                res.send("Error:"+err);
            });
        })
        .catch((err) => {
            res.send("Error:"+err);

        })
    }else{
        res.send("Bad request");
    }
});

app.listen(8888, function(){
    console.log("Server started on Port: 8888");
});

var web = express();
web.use('/',express.static("../web/"));
web.listen(7777, function(){
    console.log("Webserver started on Port: 7777");
})