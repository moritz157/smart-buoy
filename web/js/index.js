var stations;
var measurements = [{"0":44.082,"timestamp":"2017-10-24T18:11:04.000Z"},{"0":44.082,"timestamp":"2017-10-24T18:14:14.000Z"},{"0":44.082,"timestamp":"2017-10-24T18:14:46.000Z"},{"0":44.082,"1":13.253,"2":83.235,"timestamp":"2017-10-24T19:00:17.000Z"}];
var mymap = L.map('map').setView([53.574257, 10.002596], 11);
var selected = undefined;
var colors = ["#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#66bb6a", "#9ccc65", "#d4e157", "#ffee58", "#ffca28", "#ffa726", "#ff7043"];
var charts = {};

var restEndpoint = "";
if(location.origin == "http://localhost:7777"){
    restEndpoint = "http://localhost:8888";
}else if(location.origin.substr(0, 14) == "http://192.168"){
    restEndpoint = "http://192.168.2.105:8888";
}else{
    restEndpoint = "http://localhost:8888";
}

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibW9yaXR6MTU3IiwiYSI6ImNqOTY3dG9kMjAxZzUzMnBrejQzMTRyMXQifQ.2zgL0rmTRGTNWn7cXUEDVQ'
}).addTo(mymap);

$.get(restEndpoint+"/stations", function(data, status){
    if(status=="success"){
        console.log("Got stations:", data);
        stations = data;
        for(var i=0;i<stations.length;i++){
            var marker = L.marker([stations[i].latitude, stations[i].longitude])
            .addTo(mymap)
            .bindPopup(i+" | "+stations[i].name)
            .addEventListener("click", function(event){
                console.log("Clicked:", stations[parseInt(event.target._popup._content.split(" | ")[0])]);
                selected=stations[parseInt(event.target._popup._content.split(" | ")[0])];
                $("#sidebar").addClass("open");
                updateSelected();
            })
        }
    }
});

function getTypes(measurements, callback){
    $.get(restEndpoint+"/types", function(data, status){
        if(status=="success"){
            console.log(status, data)
            var allTypes = data;
            var types = [];
            for(var i=0;i<measurements.length;i++){
                for(var obj in measurements[i]){
                    if((obj != "timestamp") && ($.grep(types, function(e){ return e == obj; }).length == 0)){
                        types.push(obj);
                    }
                }
            }
            console.log(types);
            var result = [];
            for(var i=0;i<types.length;i++){
                var completeType = $.grep(allTypes, function(e){ return e.id == types[i]; })[0];
                if(completeType){
                    result.push(completeType);
                }
            }
            console.log("Types:", result);
            callback(result);
        }
    });
}

function updateSelected(){
    if(selected){
        clearCards(false);
        charts = {};
        //document.getElementById("selected").innerHTML = selected.name;
        $.get(restEndpoint+"/measurements/"+selected.id, function(data, status){
            console.log("Data:", data, "Status:", status);
            if(status=="success"){
                measurements=data;
                getTypes(data, function(types){
                    for(var i=0;i<types.length;i++){
                        addCard(types[i].name, measurements, types[i]);
                    }
                });
            }
        });
    }
}


function toggleCard(event){
    console.log($(event.target).parent().parent());
    $(event.target).parent().parent().toggleClass("closed");
}

function clearCards(showText){
    if(showText){
        $("#sidebar").removeClass("open");
        $("#sidebar").html("<span id='noSelection'>Keine Station ausgewählt</span>");
        $("#noSelection").hide();
        setTimeout(function(){
            $("#noSelection").show();
        }, 50);
    }else{
        $("#sidebar").html("<div id='close-wrapper'><i id='realtime' class='material-icons' onclick='toggleRealtime()'>timeline</i> Echtzeitaktualisierungen aktivieren<i id='closeSidebar' class='material-icons' onclick='clearCards(true)'>close</i></div>");
    }
}

function toggleRealtime(){
    $("#realtime").toggleClass("active");
    if($("#realtime").hasClass("active")){
        console.log("Realtime activated")
        socket.emit("subscribeToStation", selected.id);
    }else{
        socket.emit("unsubscribeFromStation", selected.id);
        console.log("Realtime deactivated");
    }
}

function addCard(title, measurements, type){
    var card = document.createElement("div");
    card.setAttribute("class", "card closed");

    var inner = `
    <div class="card-header">
        <span>`+title+`</span>
        <i class="material-icons" onclick="toggleCard(event)">expand_more</i>
    </div>
    <div class="card-content">
        <canvas id="`+type.id+`" width="400" height="400"></canvas>
    </div>
    `;
    
    card.innerHTML = inner;
    $("#sidebar").append(card);

    var lineColor = getRandomColor();
    var backgroundColor = hexToRgba(lineColor, 0.5);
    console.log(backgroundColor);
    var data = {
        labels: [],
        datasets:[
            {
                "label":title, 
                borderColor:lineColor,
                backgroundColor: backgroundColor,
                data: []
            }
        ]
    };
    
    for(var i = 0;i < measurements.length;i++){
        if(measurements[i].hasOwnProperty(type.id)){
            data.labels.push("");
            data.datasets[0].data.push(measurements[i][type.id]);
        }
    }
    console.log(data);
    
    var options = {
        scales: {
            yAxes: [
                {
                    display: true,
                    labelString: type.name+' in '+type.unit,
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function(value, index, values) {
                            return value.toFixed(2)+" "+type.unit;
                        }
                    }
                }
            ]
        }
    };
    
    var ctx = $("#"+type.id);
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    });
    charts[type.id]=myLineChart;
}

function getRandomColor(){
    return colors[getRandomInt(0, colors.length-1)]
}

function getRandomInt(min, max) {
min = Math.ceil(min);
max = Math.floor(max);
return Math.floor(Math.random() * (max - min)) + min;
}

function hexToRgba(hex, opacity) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `
        rgba(`+parseInt(result[1], 16)+`,
        `+parseInt(result[2], 16)+`,
        `+parseInt(result[3], 16)+`,
        `+opacity+`)` : null;
}

function addMeasurement(measurement){
    for(var obj in measurement){
        console.log(obj);
        if((obj != "timestamp") && (charts.hasOwnProperty(obj))){
            charts[obj].data.labels.push("");
            charts[obj].data.datasets[0].data.push(measurement[obj]);
            charts[obj].update();
        }
    }
}