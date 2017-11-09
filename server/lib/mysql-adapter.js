const User = require("./user.class.js");
const Session = require("./session.class.js");
const Measurement = require("./measurement.class.js");
const Station = require("./station.class.js");
const mysql = require("mysql");
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "smartbuoy",
    multipleStatements: true
});
var connected = false;
const auth = require("./auth.js");

module.exports = {
    connect: function(){
        return new Promise(function(resolve, reject){
            con.connect(function(err){
                if(err) {
                    reject(err);
                }else{
                    resolve();
                    connected=true;
                }
            });
        });
    },

    //Saves any JSON Object to the specified table as long as there are the required fields in the JSON object
    saveJson: function(table, json){
        return new Promise(function(resolve, reject){
            if(connected){
                /*var keys = [];
                var values = [];
                for(var key in json){
                    if(json[key]!=undefined){
                        keys.push(key);
                        values.push(json[key]);
                    }
                }*/
                var sql = "INSERT INTO "+table+" SET ?";
                con.query(sql, json, function(err, result){
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
            var sql = "SELECT * FROM users WHERE id = "+con.escape(id)+" OR username = "+con.escape(id);
            con.query(sql, function(err, result){
                if(err) {reject(err);}
                else {
                    result = result[0];
                    if(result){
                        var user = new User(result.username, result.password, result.salt, result.permission_level, result.activated, result.id)
                        resolve(user);
                    }else{
                        reject(undefined);
                    }
                }
            })
        });
    },
    getSession: function(id){
        return new Promise(function(resolve, reject){
            var sql = "SELECT * FROM sessions, users WHERE session_id = "+con.escape(id)+"  AND sessions.user_id = users.id";
            con.query(sql, function(err, result){
                if(err) {console.log("Err:",err);reject(err);}
                else {
                    result = result[0];
                    var session = new Session(result.user_id, result.ip, result.session_id, result.created);
                    var user = new User(result.username, result.passord, result.salt, result.permission_level, result.activated, result.id);
                    resolve({session: session, user: user});
                }
            })
        });
    },
    getMeasurement: function(id){
        return new Promise(function(resolve, reject){
            var sql = "SELECT * FROM measurement_values WHERE id = "+con.escape(id)+"";
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
            var sql = "SELECT id, name, creator_id, created, last_update, enabled, longitude, latitude FROM stationen WHERE id = "+con.escape(id)+"";
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
    getUsersStations: function(user){
        return new Promise(function(resolve, reject){
            con.query("SELECT id, name, creator_id, created, last_update, enabled, longitude, latitude FROM stationen WHERE creator_id = "+con.escape(user), function(err, result){
                if(err){reject(err)}
                else{resolve(result)}
            })
        });
    },
    getStationAuthToken: function(station_id, session_id){
        return new Promise(function(resolve, reject){
            auth.validateSessionId(session_id)
            .then((result) => {
                con.query("SELECT creator_id, token FROM stationen WHERE id = "+con.escape(station_id), function(err, result){
                    if(err){reject(err)}
                    else{resolve({"token":result[0].token});}
                });
            })
            .catch((err) => {
                reject(err);
            });
        });
    },
    getStationFromToken: function(token){
        return new Promise(function(resolve, reject){
            con.query("SELECT * FROM stationen WHERE token = "+con.escape(token), function(err, result){
                if(err){reject(err)}
                else{
                    if(result.length==0){
                        reject("Invalid")
                    }else{
                        resolve(result[0]);
                    }
                }
            });
        });
    },
    insertMeasurements: function(station_id, measurements){
        return new Promise(function(resolve, reject){
            var sql = "";
            for(var i=0;i<measurements.length;i++){
                var keys = [];
                var values = [];
                for(var key in measurements[i]){
                    if(measurements[i][key]!=undefined){
                        keys.push(key);
                        values.push(measurements[i][key]);
                    }
                }
                keys.push("station_id");
                values.push(con.escape(station_id));
                sql += "INSERT INTO measurement_values ("+keys.toString()+") VALUES (";
                for(var value in values){
                    if(value>0){sql+=", "}
                    sql+=con.escape(values[value]);
                }
                sql+=");";
            }
            console.log(sql);
            con.query(sql, function(err, result){
                if(err) {reject(err)}
                else{
                    resolve(result);
                }
            });
        });
    },
    listMeasurements: function(station_id){
        return new Promise(function(resolve, reject){
            if(station_id){
                var sql = "SELECT * FROM `measurement_values` WHERE station_id="+con.escape(station_id)+" ORDER BY timestamp ASC";
                console.log("SQL: "+sql)
                con.query(sql, function(err, result){
                    if(err){
                        reject(err);
                    }else{
                        console.log("Result:", result);
                        var measurements=[];
                        for(var i=0;i<result.length;i++){
                            if(measurements.length==0 || new Date(measurements[measurements.length-1].timestamp).getTime()!=new Date(result[i].timestamp).getTime()){
                                if(measurements.length>0){
                                    console.log(measurements[measurements.length-1].timestamp, " != ", result[i].timestamp);
                                    console.log(measurements[measurements.length-1].timestamp!==result[i].timestamp);
                                }
                                measurements.push({"timestamp":result[i].timestamp});
                            }
                            measurements[measurements.length-1][result[i].type]=result[i].value;
                        }
                        resolve(measurements);
                    }
                });
            }else{
                reject("No station id");
            }
        });
    },

    deleteSession: function(id){
        return new Promise(function(resolve, reject){
            var sql = "DELETE FROM `sessions` WHERE `sessions`.`session_id` = "+con.escape(id);
            con.query(sql, function(err, result){
                if(err) {reject(err)}
                else{
                    resolve(result);
                }
            })
        });
    },

    listTypes: function(){
        return new Promise(function(resolve, reject){
            var sql="SELECT * FROM `types`";
            con.query(sql, function(err, result){
                if(err) {reject(err)}
                else{
                    resolve(result);
                }
            })
        })
    }
}