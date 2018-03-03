function checkAuthOnIndex() {
    var loggedIn = window.localStorage.getItem("session_id")!=null;
    console.log("Logged in:", loggedIn);
    $("#login").toggleClass("hide", loggedIn);
    $("#profile").toggleClass("hide", !loggedIn);
}

function logout(){
    $.ajax(restEndpoint+"/logout", {
        method: 'POST',
        data: JSON.stringify({session_id: window.localStorage.getItem("session_id")}), 
        complete: logoutResponseHandler, 
        headers: {
            "Content-Type": "application/json"
        }
    });
}

function logoutResponseHandler(){
    window.localStorage.removeItem("session_id");
    location.reload();
}