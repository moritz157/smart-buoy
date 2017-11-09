var express = require("express");
var auth = require("./auth.js");
var mysql = require("./mysql-adapter.js");

var apiRoutes = express.Router();

module.exports = {
    init: function(){
        apiRoutes.use(function(req, res, next){
            console.log(req);
            if(req.body.session_id){
                auth.validateSessionId(req.body.session_id)
                .then((result) => {
                    if(Date.now() - result.session.created < 1000*60*60*24*30){
                        req.decoded = result.user;
                        console.log(result.user);
                        next();
                    }else{
                        console.log("Session expired");
                        res.send({"error":"session expired"});
                    }
                })
                .catch((err) => {
                    console.log(err);
                    res.send(err);
                })
            }else{
                res.send({"error":"No session_id"});
            }
        });

        /**
         * @api {post} /user/info info
         * @apiGroup user
         * @apiDescription Returns the user object
         * @apiParam {String} session_id
         */
        apiRoutes.post("/info", function(req, res){
            res.send(req.decoded)
            //res.send(req.decoded);
        });

        /**
         * @api {post} /user/stations userStations
         * @apiGroup user
         * @apiDescription Returns the user's stations
         * @apiParam {String} session_id
         */
        apiRoutes.post("/stations", function(req, res){
            mysql.getUsersStations(req.decoded.id)
            .then((result) => {
                res.send(result);
            })
            .catch((err) => {
                res.send(err);
            })
        });

        return apiRoutes;
    }
}