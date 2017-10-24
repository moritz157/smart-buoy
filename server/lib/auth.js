const mysql = require("./mysql-adapter.js");
const Session = require("./session.class.js");
const User = require("./user.class.js");
const crypto = require("crypto");
module.exports = {
    login: function(user, password, ip){
        return new Promise(function(resolve, reject){
            mysql.getUser(user)
            .then((result) => {
                const hash = crypto.createHash('sha256');               
                hash.update(password+result.salt); 
                var enteredPass = hash.digest('hex');
                console.log("Result:",result, "Entered pass:", enteredPass)
                if(enteredPass==result.password && user == result.username){
                    var newSession = new Session(result.id, ip);
                    mysql.saveJson("sessions", newSession);
                    resolve(newSession.session_id);
                }else{
                    reject("Wrong pass");
                }
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            })
        })
    },
    register: function(user, password){
        var salt = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const hash = crypto.createHash('sha256');               
        hash.update(password+salt); 

        var newUser = new User(user, hash.digest('hex'), salt, 0, true);
        return mysql.saveJson("users", newUser);
    },
    logout: function(session_id){
        return mysql.deleteSession(session_id);
    },
    validateSessionId: function(session_id){
        return new Promise(function(resolve, reject){
            const mysql = require("./mysql-adapter.js"); // <-- Weird thing: the outer mysql-constant is not injected here so I have to declare it again inside the promise
            if(session_id){
                //console.log(mysql.getAllStations);
                mysql.getSession(session_id).then((result) => {
                    resolve(result);
                })
                .catch((err) => {
                    reject(err);
                })
            }else{
                reject("No session_id")
            }
        });
    },
    validateAuthToken: function(token){
        return new Promise(function(resolve, reject){
            const mysql = require("./mysql-adapter.js"); 
            if(token){
                mysql.getStationFromToken(token)
                .then((result) => {resolve(result)})
                .catch((err) => reject(err));
            }else{
                reject("No token or station_id");
            }
        });
    }
}