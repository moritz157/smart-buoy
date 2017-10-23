const User = require("./user.class.js");
const Session = require("./session.class.js");
const Measurement = require("./measurement.class.js");
const Station = require("./station.class.js");
const mysql = require("mysql");
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "smartbuoy"
});
var connected = false;
const auth = require("./auth.js");

module.exports = {
    connect: function(){
        con.connect(function(err){
            if(err) throw err;
            console.log("Connected to database");
            connected=true;
        });
    },

    //Saves any JSON Object to the specified table as long as there are the required fields in the JSON object
    saveJson: function(table, json){
        return new Promise(function(resolve, reject){
            if(connected){
                var keys = [];
                var values = [];
                for(var key in json){
                    if(json[key]!=undefined){
                        keys.push(key);
                        values.push(json[key]);
                    }
                }
                var sql = "INSERT INTO "+table+"("+keys.toString()+") VALUES (";
                for(var value in values){
                    if(value>0){sql+=", "}
                    sql+="'"+values[value]+"'";
                }
                sql+=")";
                con.query(sql, function(err, result){
                    if(err) {
                        reject(err);
                    }else{
                        resolve(result);
                    }
                    console.log("Record inserted:", result);
                })
            }
        });
    },

    //Getters
    getUser: function(id){
        return new Promise(function(resolve, reject){
            var sql = "SELECT * FROM users WHERE id = '"+id+"' OR username = '"+id+"'";
            con.query(sql, function(err, result){
                if(err) {reject(err);}
                else {
                    result = result[0];
                    var user = new User(result.username, result.password, result.salt, result.permission_level, result.activated, result.id)
                    resolve(user);
                }
            })
        });
    },
    getSession: function(id){
        return new Promise(function(resolve, reject){
            var sql = "SELECT * FROM sessions WHERE session_id = '"+id+"'";
            con.query(sql, function(err, result){
                if(err) {console.log("Err:",err);reject(err);}
                else {
                    result = result[0];
                    var session = new Session(result.user_id, result.ip, result.session_id, result.created);
                    resolve(session);
                }
            })
        });
    },
    getMeasurement: function(id){
        return new Promise(function(resolve, reject){
            var sql = "SELECT * FROM measurement_values WHERE id = '"+id+"'";
            con.query(sql, function(err, result){
                if(err) {reject(err);}
                else {
                    result = result[0];
                    var measurement = new Measurement(result.station_id, result.type, result.value, result.timestatmp, result.id)
                    resolve(measurement);
                }
            })
        });
    },
    getStation: function(id){
        return new Promise(function(resolve, reject){
            var sql = "SELECT id, name, creator_id, created, last_update, enabled, longitude, latitude FROM stationen WHERE id = '"+id+"'";
            con.query(sql, function(err, result){
                if(err) {reject(err);}
                else {
                    result = result[0];
                    var station = new Station(result.name, result.creator_id, result.id, result.created, result.last_updated, result.enabled, result.longitude, result.latitude);
                    resolve(station);
                }
            })
        });
    },
    getAllStations: function(){
        return new Promise(function(resolve, reject){
            con.query("SELECT id, name, creator_id, created, last_update, enabled, longitude, latitude FROM stationen", function(err, result){
                if(err){reject(err)}
                else{resolve(result)}
            })
        });
    },
    getStationAuthToken: function(station_id, session_id){
        return new Promise(function(resolve, reject){
            auth.validateSessionId(session_id)
            .then((result) => {
                con.query("SELECT creator_id, token FROM stationen WHERE id = '"+station_id+"'", function(err, result){
                    if(err){reject(err)}
                    else{resolve({"token":result[0].token});}
                });
            })
            .catch((err) => {
                reject(err);
            });
        });
    },

    deleteSession: function(id){
        return new Promise(function(resolve, reject){
            var sql = "DELETE FROM `sessions` WHERE `sessions`.`session_id` = '"+id+"'";
            con.query(sql, function(err, result){
                if(err) {reject(err)}
                else{
                    resolve(result);
                }
            })
        });
    }
}