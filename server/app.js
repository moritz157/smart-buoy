var express = require("express");
var app = express();

var mysql = require("./lib/mysql-adapter.js");
mysql.connect();

var Session = require("./lib/session.class.js");

app.get("/", function(req, res){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var newSession = new Session(0, ip);
    mysql.saveJson("sessions", newSession);

    res.send(JSON.stringify(newSession));
})


app.listen(8888, function(){
    console.log("Server started on Port: 8888");
});