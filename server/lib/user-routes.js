var express = require("express");
var auth = require("./auth.js");
var mysql = require("./mysql-adapter.js");
var logger = require("./log.js").logger;

var apiRoutes = express.Router();

module.exports = {
    init: function(){
        apiRoutes.use(function(req, res, next){
            //console.log(req);
            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            if(req.body.session_id){
                auth.validateSessionId(req.body.session_id)
                .then((result) => {
                    if(Date.now() - result.session.created < 1000*60*60*24*30){
                        req.decoded = result.user;
                        next();
                    }else{
                        logger.log({
                            level: 'info',
                            message: '"/user/" requested. An error occured. IP: '+ip+" Error: Session expired"
                        });
                        console.log("Session expired");
                        res.status(401).send({"error":"session expired"});
                    }
                })
                .catch((err) => {
                    console.log(err);
                    logger.log({
                        level: 'info',
                        message: '"/user/" requested. An error occured. IP: '+ip+" Error: "+err
                    });
                    res.status(505).send(err);
                })
            }else{
                logger.log({
                    level: 'info',
                    message: '"/user/" requested. An error occured. IP: '+ip+' Error: No session_id'
                });
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
            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            logger.log({
                level: 'info',
                message: '"/user/info" requested. No errors. IP: '+ip
            });
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
            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            mysql.getUsersStations(req.decoded.id)
            .then((result) => {
                logger.log({
                    level: 'info',
                    message: '"/user/stations" requested. No errors. IP: '+ip+' UserID: '+req.decoded.id
                });
                res.send(result);
            })
            .catch((err) => {
                logger.log({
                    level: 'info',
                    message: '"/user/stations" requested. An error occured. IP: '+ip+' Error: '+err
                });
                res.send(err);
            })
        });

        /**
         * @api {post} /stats getStats
         * @apiGroup user
         * @apiDescription Gets the user's stats
         * @apiParam {String} session_id
         */
        apiRoutes.post("/stats", function(req, res){
            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            mysql.getStats(req.body.session_id)
            .then((result) => {
                logger.log({
                    level: 'info',
                    message: '"/user/stats" requested. No errors. IP: '+ip+' UserID: '+req.decoded.id
                });
                res.send(result);
            })
            .catch((err) => {
                logger.log({
                    level: 'info',
                    message: '"/user/stats" requested. An error occured. IP: '+ip+' Error: '+err
                });
                res.send(err);
            })
        });

        return apiRoutes;
    }
}