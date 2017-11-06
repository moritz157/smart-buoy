var socket = io(restEndpoint.substr(0,restEndpoint.length-4)+"9999");

socket.on("newMeasurement", function(station, measurements){
    console.log("newMeasurement", station, measurements);

    for(var i=0;i<measurements.length;i++){
        addMeasurement(measurements[i]);
    }
});