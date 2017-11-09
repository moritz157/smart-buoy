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
    }
    console.log(data, status);
}