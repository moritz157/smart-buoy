var stations = [{"id":1,"name":"AuthToken","creator_id":5,"created":"2017-10-23T22:39:01.000Z","last_update":"2017-10-23T22:39:01.000Z","enabled":1,"longitude":10.002596,"latitude":53.574257}];
var mymap = L.map('map').setView([53.574257, 10.002596], 11);
var selected = undefined;

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibW9yaXR6MTU3IiwiYSI6ImNqOTY3dG9kMjAxZzUzMnBrejQzMTRyMXQifQ.2zgL0rmTRGTNWn7cXUEDVQ'
}).addTo(mymap);

for(var i=0;i<stations.length;i++){
    var marker = L.marker([stations[i].latitude, stations[i].longitude])
    .addTo(mymap)
    .bindPopup(i+" | "+stations[i].name)
    .addEventListener("click", function(event){
        console.log("Clicked:", stations[parseInt(event.target._popup._content.split(" | ")[0])]);
        selected=stations[parseInt(event.target._popup._content.split(" | ")[0])];
        updateSelected();
    })
}

function updateSelected(){
    if(selected){
        document.getElementById("selected").innerHTML = selected.name;
    }
}