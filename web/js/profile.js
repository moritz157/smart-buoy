var restEndpoint = "";
if(location.origin == "http://localhost:7777"){
    restEndpoint = "http://localhost:8888";
}else if(location.origin.substr(0, 14) == "http://192.168"){
    restEndpoint = "http://192.168.2.105:8888";
}else{
    restEndpoint = "http://localhost:8888";
}

var user = undefined;

loadInfo();
getStations();

function loadInfo(){
    if(window.localStorage.getItem("session_id")==undefined){return;}
    var session_id = window.localStorage.getItem("session_id");
    /**$.ajax(restEndpoint+"/user/info", {
        method: 'POST',
        data: JSON.stringify({
            session_id: session_id
        }),
        headers: {
            "Content-Type": "application/json"
        }
    });*/
    $.ajax(restEndpoint+"/user/info", {
        method: 'POST',
        data: JSON.stringify({session_id: session_id}), 
        complete: infoResponse, 
        headers: {
            "Content-Type": "application/json"
        }
    });
}

function infoResponse(data, status){
    if(status=="success"){
        user=data.responseJSON;
        console.log(user.username);
        $("#username").html(user.username);
        var registered = new Date(user.registered);
        $("#registered").html(registered.getDate()+"."+(registered.getMonth()+1)+"."+registered.getFullYear());
    }
    console.log(data, status);
}

var stations;
function getStations(){
    $.get(restEndpoint+"/stations", function(data, status){
        if(status=="success"){
            console.log("Got stations:", data);
            stations = data;
            for(var i=0;i<stations.length;i++){
                addStation(stations[i]);
            }
        }
    });
}

function addStation(station){
    var created = new Date(station.created);
    $("#cards-wrapper").html($("#cards-wrapper").html()+ `
    <div class="card">
        <h2 class="card-header">`+station.name+`</h2>
        <p id="station-created">Erstellt am: `+created.getDate()+"."+(created.getMonth()+1)+"."+created.getFullYear()+`</p>
        <p id="station-latitude">Breitengrad: `+station.latitude+`</p>
        <p id="station-longitude">Längengrad: `+station.longitude+`</p>
        <a href="index.html?station=`+station.id+`">Auf Karte ansehen</a>
    </div>
    `);
}

getStats();
function getStats(){
    if(window.localStorage.getItem("session_id")==undefined){return;}
    var session_id = window.localStorage.getItem("session_id");
    $.ajax(restEndpoint+"/user/stats", {
        method: 'POST',
        data: JSON.stringify({session_id: session_id}), 
        complete: statsResponseHandler, 
        headers: {
            "Content-Type": "application/json"
        }
    });
}
var stats;
function statsResponseHandler(data, status){
    if(status=="success"){
        stats=data.responseJSON;
        buildMeasurementsPerStationChart(stats);
        //$("#stats").html(JSON.stringify(stats));
        //var registered = new Date(user.registered);
        //$("#registered").html(registered.getDate()+"."+(registered.getMonth()+1)+"."+registered.getFullYear());
    }
    console.log(data, status);
}

function buildMeasurementsPerStationChart(stats){
    var data = {
        labels: [],
        datasets: [{
            label: "Messungen pro Station",
            data: [],
            backgroundColor: [],
            borderColor: [],
            hoverBackgroundColor: []
        }]
    };

    var options = {
        backgroundColor: []
    }

    for(var i=0;i<stats.length;i++){
        data.labels.push(stats[i].station_name);
        data.datasets[0].data.push(stats[i].measurement_count);
        var bgColor = utils.getRandomColor();
        data.datasets[0].backgroundColor.push(utils.hexToRgba(bgColor, 0.5));
        data.datasets[0].hoverBackgroundColor.push(utils.hexToRgba(bgColor, 0.7));
        data.datasets[0].borderColor.push(utils.hexToRgba(bgColor, 0.9));
    }

    var ctx = $("#measurementsPerStationChart");
    var mpsChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: options
    });
    console.log(mpsChart);
}