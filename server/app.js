var https = require('https');
var fs = require('fs');
var express = require("express");
var app = express();

const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var logger = require("./lib/log.js").logger;

const config = require("./lib/config.js");

var mysql = require("./lib/mysql-adapter.js");
mysql.connect()
.then(() => {
    logger.log({
        level: 'info',
        message: 'Connected to mysql-database'
    });
})
.catch((err) => {
    logger.log({
        level: 'error',
        message: 'An error occured while connecting to mysql-database. Error: '+err
    });
});

var Session = require("./lib/session.class.js");
var User = require("./lib/user.class.js");
var Measurement = require("./lib/measurement.class.js");
var Station = require("./lib/station.class.js");
const MeasurementTypes = require("./lib/measurement.types.js");

app.use(function(req, res, next){
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    next();
});

var userRouteProvider = require("./lib/user-routes.js");
var userRoutes = userRouteProvider.init();
app.use("/user", userRoutes);

/**
 * @api {get} / root
 * @apiGroup main
 * 
 */
app.get("/", function(req, res){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    logger.log({
        level: 'info',
        message: '"/" Requested. IP: '+ip
    });
    res.send("smart-buoy<br>Status: Online");
});

/**
 * @api {get} /stations getStations
 * @apiGroup main
 * @apiDescription Get all stations
 */
app.get("/stations", function(req, res){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    mysql.getAllStations()
    .then((result) => {
        logger.log({
            level: 'info',
            message: '"/stations" requested. No errors. IP: '+ip
        });
        res.send(result);
    })
    .catch((err) => {
        logger.log({
            level: 'error',
            message: '"/stations" requested. An error occured. IP: '+ip+" Error: "+err
        });
        console.log(err);
        res.send(err);
    })
});

/**
 * @api {get} /types getTypes
 * @apiGroup main
 * @apiDescription Get all measurement-types
 */
app.get("/types", function(req, res){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    mysql.listTypes()
    .then((result) => {
        logger.log({
            level: 'info',
            message: '"/types" requested. No errors. IP: '+ip
        });
        res.send(result);
    })
    .catch((err) => {
        logger.log({
            level: 'error',
            message: '"/types" requested. An error occured. IP: '+ip+" Error: "+err
        });
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
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if(req.body.session_id && req.body.station){
        mysql.getStationAuthToken(req.body.station, req.body.session_id)
        .then((result) => {
            logger.log({
                level: 'info',
                message: '"/stationAuthToken" requested. No errors. IP: '+ip
            });
            res.send(result);
        })
        .catch((err) => {
            logger.log({
                level: 'error',
                message: '"/stationAuthToken" requested. An error occured. IP: '+ip+" Error: "+err
            });
            throw err;
            res.send("Error found:" + err);
        })
    }else{
        logger.log({
            level: 'error',
            message: '"/stations" requested. An error occured. IP: '+ip+" Error: Bad request"
        });
        res.send("Bad request");
    }
});

/**
 * @api {get} /measurementsOld/:station getMeasurementsOld
 * @apiGroup main
 * @apiDescription Get all measurements of a specified station
 * 
 * @apiParam {Number} station The station's id
 */
app.get("/measurementsOld/:station", function(req, res){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if(req.params.station){
        console.log("Station:", req.params.station)
        mysql.listMeasurements(req.params.station)
        .then((result) => {
            logger.log({
                level: 'info',
                message: '"/measurementsOld/'+req.params.station+'" requested. No errors. IP: '+ip
            });
            res.send(result);
        })
        .catch((err) => {
            logger.log({
                level: 'error',
                message: '"/measurementsOld/'+req.params.station+'" requested. An error occured. IP: '+ip+" Error: "+err
            });
            res.send("Error:", err);
        })
    }else{
        logger.log({
            level: 'error',
            message: '"/measurementsOld/:station" requested. An error occured. IP: '+ip+" Error: Bad request"
        });
        res.send("Bad request");
    }
});

/**
 * @api {get} /measurements/:station getMeasurements
 * @apiGroup main
 * @apiDescription All measurements of a specified station in a specified timespan and grouped by a specified time interval
 * 
 * @apiParam (URL-Parameters) {Number} station The station's id
 * 
 * @apiParam (Query-Parameters) {Date} from The start of the selected timespan
 * @apiParam (Query-Parameters) {Date} until The end of the selected timespan
 * @apiParam (Query-Parameters) {Number} interval The grouping interval in seconds
 * @apiParam (Query-Parameters) {String} format The format in which the response is served. Supported alternative formats: csv
 */
app.get("/measurements/:station", function(req, res){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if(req.params.station){
        /*console.log("Station:", req.params.station);
        console.log("From:", req.query.from);
        console.log("Until:", req.query.until);
        console.log("Interval:", req.query.interval);*/
        mysql.listMeasurements(req.params.station, {from: req.query.from, until: req.query.until, interval: req.query.interval})
        .then((result) => {
            logger.log({
                level: 'info',
                message: '"/measurements/'+req.params.station+'" requested. No errors. IP: '+ip
            });
            if(req.query.format && req.query.format=="csv"){
                console.log("Format=csv");
                mysql.listTypes()
                .then((types) => {
                    res.setHeader("Content-Type", "application/csv");
                    res.setHeader('Content-disposition', 'attachment; filename=smart-buoy-data.csv');
                    res.write("timestamp;");
                    console.log("Got types", types);
                    for(var i=0;i<types.length;i++){
                        res.write(types[i].name+" in "+types[i].unit+";");
                    }
                    res.write("\n");
                    for(var i=0;i<result.length;i++){
                        res.write(new Date(result[i].timestamp).toJSON());
                        for(var ii=0;ii<types.length;ii++){
                            if(result[i][types[ii].id]){
                                res.write(result[i][types[ii].id].toString());
                            }
                            res.write(";");
                        }
                        res.write("\n");
                    }
                    res.end();
                })
                .catch((err) => {
                    console.log("Error", err);
                    res.send(err);
                })
            }else{
                res.send(result);
            }
        })
        .catch((err) => {
            logger.log({
                level: 'error',
                message: '"/measurements/'+req.params.station+'" requested. An error occured. IP: '+ip+" Error: "+err
            });
            res.send("Error:", err);
        });
    }else{
        console.log("No station");
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
        console.log("Req:",req);
        auth.login(req.body.username, req.body.password, ip)
        .then((result) => {
            logger.log({
                level: 'info',
                message: '"/login" requested. No errors. IP: '+ip
            });
            res.send({"session_id":result});
        })
        .catch((err) => {
            logger.log({
                level: 'error',
                message: '"/login" requested. An error occured. IP: '+ip+" Error: "+err
            });
            res.status(505).send(err)
        })
    }else{
        logger.log({
            level: 'error',
            message: '"/login" requested. An error occured. IP: '+ip+" Error: Bad request"
        });
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
            logger.log({
                level: 'info',
                message: '"/stations" requested. No errors. IP: '+ip
            });
            res.send(result);
        })
        .catch((err) => {
            logger.log({
                level: 'error',
                message: '"/stations" requested. An error occured. IP: '+ip+" Error: "+err
            });
            res.status(505).send(err)
        })
    }else{
        logger.log({
            level: 'error',
            message: '"/stations" requested. An error occured. IP: '+ip+" Error: Bad request"
        });
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
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if(req.body.session_id){
        auth.logout(req.body.session_id)
        .then(() => {
            logger.log({
                level: 'info',
                message: '"/logout" requested. No errors. IP: '+ip
            });
            res.send("Deleted");
        })
        .catch((err) => {
            logger.log({
                level: 'error',
                message: '"/logout" requested. An error occured. IP: '+ip+" Error: "+err
            });
            res.send(err)
        })
    }else{
        logger.log({
            level: 'error',
            message: '"/logout" requested. An error occured. IP: '+ip+" Error: No session_id"
        });
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
    console.log("Req:", req.body);
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if(req.body.token && req.body.measurements){
        auth.validateAuthToken(req.body.token)
        .then((result) => {
            mysql.insertMeasurements(result.id, req.body.measurements)
            .then(() => {
                logger.log({
                    level: 'info',
                    message: '"/submitMeasurement" requested. No errors. IP: '+ip
                });
                socket.submitMeasurement(result.id, req.body.measurements);
                res.send("Inserted");
            })
            .catch((err) => {
                logger.log({
                    level: 'error',
                    message: '"/submitMeasurement" requested. An error occured. IP: '+ip+" Error: "+err
                });
                console.log(err);
                res.send("Error:"+err);
            });
        })
        .catch((err) => {
            logger.log({
                level: 'error',
                message: '"/submitMeasurement" requested. An error occured. IP: '+ip+" Error: "+err
            });
            res.send("Error:"+err);

        })
    }else{
        logger.log({
            level: 'error',
            message: '"/submitMeasurement" requested. An error occured. IP: '+ip+" Error: Bad request"
        });
        res.send("Bad request");
    }
});

if(process.env.NODE_USE_SSL=='true'){

    var options = {
        key: fs.readFileSync( process.env.SSL_KEY ),
        cert: fs.readFileSync( process.env.SSL_CRT ),
        ca: [
          fs.readFileSync( process.env.SSL_SecureServerCA ),
          fs.readFileSync( process.env.SSL_AddTrustCA ) 
        ]
    };
    var server = https.createServer( options, app );
    server.listen(config.restPort+1, function(){
        logger.log({
            level: 'info',
            message: '(HTTPS-) Server started on Port: '+config.restPort
        });
    });
    app.listen(config.restPort, function(){
        logger.log({
            level: 'info',
            message: 'Server started on Port: '+config.restPort
        });
    });

    var web = express();
    web.use('/',express.static("../web/"));

    var webServer = https.createServer( options, web );
    webServer.listen(config.webPort, function(){
        logger.log({
            level: 'info',
            message: '(HTTPS-) Webserver started on Port: '+config.webPort
        });
    });
}else{
    app.listen(config.restPort, function(){
        logger.log({
            level: 'info',
            message: 'Server started on Port: '+config.restPort
        });
    });

    var web = express();
    web.use('/',express.static("../web/"));
    web.listen(config.webPort, function(){
        logger.log({
            level: 'info',
            message: 'Webserver started on Port: '+config.webPort
        });
    });

}


var socket = require("./lib/socket.js");
socket.start(config.socketPort);

//ON EXIT
process.stdin.resume();//so the program will not close instantly

function exitHandler(options, err) {
    if (options.cleanup) {
        console.log('clean');
        logger.log({
            level: 'info',
            message: 'Doing clean up'
        });
    }
    if (err) {
        console.log(err.stack);
        logger.log({
            level: 'error',
            message: 'An error occured. The app is going do die now :( Error: '+err.stack
        });
    }
    if (options.exit){
        logger.log({
            level: 'info',
            message: 'Application has been shut down'
        });
        process.exit();
    } 
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));