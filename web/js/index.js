checkAuthOnIndex();

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

var url = new URL(location.href);
var preSelectedStation;
if(url.searchParams.has("station")){
    console.log("Selected station: "+url.searchParams.get("station"));
    preSelectedStation=url.searchParams.get("station");
}

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
                updateSelected(getMeasurementQuery());
            });
            console.log(marker);
            if(preSelectedStation==stations[i].id){
                marker.openPopup();
                console.log("Clicked:", stations[i]);
                selected=stations[i];
                $("#sidebar").addClass("open");
                updateSelected(getMeasurementQuery());
                mymap.setView([stations[i].latitude, stations[i].longitude], 11)
            }
        }
    }
});

function getTypes(measurements, callback){
    $.get(restEndpoint+"/types", function(t_data, t_status){
        if(t_status=="success"){
            console.log("[getTypes]", t_status, t_data)
            var allTypes = t_data;
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

function updateSelected(query){
    if(selected){
        clearCards(false);
        charts = {};
        //document.getElementById("selected").innerHTML = selected.name;
        var restPath = restEndpoint+"/measurementsByTime/"+selected.id;
        if(query){
            restPath = restEndpoint+"/measurementsByTime/"+selected.id+"?"+query;
        }
        $.get(restPath, function(data, status){
            console.log("Data:", data, "Status:", status);
            if(status=="success"){
                measurements=data;
                getTypes(data, function(types){
                    updateFullscreenMeasurements(measurements, types);
                    for(var i=0;i<types.length;i++){
                        addCard(types[i].name, measurements, types[i]);
                    }
                });
            }else {
                console.log("Error getting measurements");
            }
        });
    }
}

function updateData(){
    if(selected){
        $.get(restEndpoint+"/measurementsByTime/"+selected.id, function(data, status){
            console.log("Data:", data, "Status:", status);
            if(status=="success"){
                console.log("New Measurements:", data.length-measurements.length, data.slice(measurements.length));
                var toInsert = data.slice(measurements.length)
                for(var i=0;i<toInsert.length;i++){
                    addMeasurement(toInsert[i]);
                }
                /*measurements=data;
                getTypes(data, function(types){
                    for(var i=0;i<types.length;i++){
                        addCard(types[i].name, measurements, types[i]);
                    }
                });*/
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
        $("#sidebar-main").html("<span id='noSelection'>Keine Station ausgewählt</span>");
        $("#noSelection").hide();
        setTimeout(function(){
            $("#noSelection").show();
        }, 50);
    }else{
        $("#sidebar-main").html("");
    }
}

function toggleFullscreen() {
    $("#fullscreen-data").toggleClass("active");
}

function toggleRealtime(){
    $("#realtime").toggleClass("active");
    if($("#realtime").hasClass("active")){
        updateData();
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
    $("#sidebar-main").append(card);

    var lineColor = utils.getRandomColor();
    var backgroundColor = utils.hexToRgba(lineColor, 0.5);
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

var fullscreenChart;

function buildFullscreenChart(){
    var data = {
        labels: [],
        datasets:[]
    };
    /*
    for(var i = 0;i < measurements.length;i++){
        if(measurements[i].hasOwnProperty(type.id)){
            data.labels.push("");
            data.datasets[0].data.push(measurements[i][type.id]);
        }
    }
    console.log(data);*/
    
    var options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            xAxes: [{
                type:"time",
                time: {
                    tooltipFormat: "DD.MM.YYYY  HH:mm:ss",
                },
                /*ticks: {
                    // Include a dollar sign in the ticks
                    callback: function(value, index, values) {
                        return new Date(parseInt(value)).toLocaleString();
                    }
                }*/
            }]
        }
    };
    
    var ctx = $("#fullscreen-chart-canvas");
    fullscreenChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    });
    //charts[type.id]=myLineChart;
}
buildFullscreenChart();

function updateFullscreenMeasurements(measurements, types){
    if(types){
        console.log("[full] ", types);
        var usedColors = [];
        for(var i=0;i<types.length;i++){
            var lineColor;
            while(usedColors.indexOf(lineColor)>-1){lineColor = utils.getRandomColor();}

            usedColors.push(lineColor);
            //var backgroundColor = hexToRgba(lineColor, 0.5);

            var title = types[i].name + " in " + types[i].unit;
            //fullscreenChart.data.labels.push("");
            fullscreenChart.data.datasets[types[i].id]={
                "label":title, 
                borderColor:lineColor,
                backgroundColor: "rgba(0, 0, 0, 0)",
                data: [],
                xAxisID: "x-axis-0"
            };
            fullscreenChart.data.labels=[];

            /*fullscreenChart.options.scales.yAxes.push({
                display: true,
                labelString: title,
                ticks: {
                    // Include a dollar sign in the ticks
                    callback: function(value, index, values) {
                        return value.toFixed(2)+" "+types[i].unit;
                    }
                }
            });*/
        }
    }
    fullscreenChart.update();
    if(measurements){
        console.log("[fullscreen] Measurements:", measurements);
        //return;
        for(var i=0;i<measurements.length;i++){
            //if(new Date(measurements[i].timestamp).getTime()+7*24*3600000>Date.now()){
                for(var obj in measurements[i]){
                    //console.log(obj);
                    if((obj != "timestamp") && (measurements[i].hasOwnProperty(obj))){
                        fullscreenChart.data.labels.push(measurements[i].timestamp);
                        fullscreenChart.data.datasets[obj].data.push({x: new Date(measurements[i].timestamp).getTime(), y: measurements[i][obj]});
                    }
                }
            //}
            
            
        }
        fullscreenChart.update();
    }
}

bindSelects();
function bindSelects() {
    $("#side-from-select").bind("change", function(){
        $("#from-select").val($(this).val());
        updateSelected(getMeasurementQuery());
    });

    $("#from-select").bind("change", function(){
        $("#side-from-select").val($(this).val());
        updateSelected(getMeasurementQuery());
    });

    $("#interval-select").bind("change", function(){
        $("#side-interval-select").val($(this).val());
        updateSelected(getMeasurementQuery());
    });

    $("#side-interval-select").bind("change", function(){
        $("#interval-select").val($(this).val());
        updateSelected(getMeasurementQuery());
    });
}

function getMeasurementQuery(){
    var queryString = "";
    var fromDate = new Date(Date.now() - parseInt($("#from-select").val()));
    var fromDateString = fromDate.toJSON().replace("T", "%20");
    queryString+="from="+fromDateString;
    var interval = $("#interval-select").val();
    if(interval!="0"){
        queryString+="&interval="+interval;
    }
    return queryString;
}