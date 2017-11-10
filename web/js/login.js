var restEndpoint = "";
if(location.origin == "http://localhost:7777"){
    restEndpoint = "http://localhost:8888";
}else if(location.origin.substr(0, 14) == "http://192.168"){
    restEndpoint = "http://192.168.2.105:8888";
}else{
    restEndpoint = "http://localhost:8888";
}

function login(){
    var username = $("#username")[0].value;
    var password = md5($("#password")[0].value+"smartbuoy");
    if(username && password){
        console.log(username, password);
        $.ajax(restEndpoint+"/login", {
            method: 'POST',
            data: JSON.stringify({username: username, password: password}), 
            complete: loginResponseHandler, 
            headers: {
                "Content-Type": "application/json"
            }
        });
    }else{
        alert("Please fill out all fields");
    }
}

function loginResponseHandler(data, status){
    console.log("Status:", status, "Data:", data);
    if(status=="success" && data.responseJSON){
        window.localStorage.setItem("session_id", data.responseJSON.session_id);
        console.log(data.responseJSON.session_id);
        window.location = "index.html";
    }
}

