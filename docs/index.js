function startWelcomeAnimation(){
    $("#project_name").animate({"opacity":1}, 800);
    setTimeout(function(){
        $("#slogan").animate({"opacity":1}, 700);
    }, 200);
    setTimeout(function(){
        $("#more").animate({"opacity":1}, 900);
    }, 500);
}

startWelcomeAnimation();