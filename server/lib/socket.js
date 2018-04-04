var logger = require("./log.js").logger;
var fs = require("fs");
var app = require('express')();

if(process.env.NODE_USE_SSL=='true'){
    var options = {
        key: fs.readFileSync( process.env.SSL_KEY ),
        cert: fs.readFileSync( process.env.SSL_CRT ),
        ca: [
          fs.readFileSync( process.env.SSL_SecureServerCA ),
          fs.readFileSync( process.env.SSL_AddTrustCA ) 
        ]
    };
    var https = require('https').createServer(options, app);
    var io = require('socket.io')(https);
}else{
    var http = require('http').Server(app);
    var io = require('socket.io')(http);
}

var subscriptions = {};

module.exports = {
    start: function(port){
        io.on('connection', function(socket){
            //console.log(io.sockets.connected);
            console.log('a user connected. socket-id: '+socket.id);
            socket.on('subscribeToStation', function(id){
                if(subscriptions[id]==undefined){subscriptions[id]=[];}
                if(subscriptions[id].indexOf(socket.id)==-1){
                    subscriptions[id].push(socket.id);
                    console.log("subscribe to station Nr.: "+id);
                }else{
                    console.log("Already subscribed")
                }
                console.log(subscriptions[id]);
            });

            socket.on('unsubscribeFromStation', function(id){
                if(subscriptions[id]==undefined){subscriptions[id]=[];}
                if(subscriptions[id].indexOf(socket.id)>-1){
                    subscriptions[id].splice(subscriptions[id].indexOf(socket.id), 1);
                    console.log("unsubscribe from station Nr.: "+id);
                }else{
                    console.log("No subscription found");
                }
                console.log(subscriptions[id]);
            });

            socket.on('disconnect', function(){
                console.log("a user disconnected");
            })
        });
        if(process.env.NODE_USE_SSL=='true'){
            https.listen(port, function(){
                logger.log({
                    level: 'info',
                    message: '(HTTPS-) Socket server started on Port: '+port
                });
            });
        }else{      
            http.listen(port, function(){
                logger.log({
                    level: 'info',
                    message: 'Socket server started on Port: '+port
                });
            });
        }
    },

    submitMeasurement: function(station, measurements){
        console.log("Subscriptions:", subscriptions);
        if(subscriptions && subscriptions[station] && subscriptions[station].length>0){
            for(var i=0;i<subscriptions[station].length;i++){
                if(io.sockets.connected[subscriptions[station][i]]){
                    var result = [{}];
                    for(var ii=0;ii<measurements.length;ii++){
                        result[0][measurements[ii].type]=measurements[ii].value;
                    }
                    console.log("Sending new measurements to subscribers");
                    io.sockets.connected[subscriptions[station][i]].emit("newMeasurement", station, result);
                }else{
                    console.log("No subscriptions. Station: "+station);
                }
            }
        }
        
    }
}