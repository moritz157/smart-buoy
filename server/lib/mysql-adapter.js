const mysql = require("mysql");
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "smartbuoy"
});
var connected = false;
module.exports = {
    connect: function(){
        con.connect(function(err){
            if(err) throw err;
            console.log("Connected to database");
            connected=true;
        });
    },

    saveJson: function(table, json){
        if(connected){
            var keys = [];
            var values = [];
            for(var key in json){
                keys.push(key);
                values.push(json[key]);
            }
            var sql = "INSERT INTO "+table+"("+keys.toString()+") VALUES (";
            for(var value in values){
                if(value>0){sql+=", "}
                sql+="'"+values[value]+"'";
            }
            sql+=")";
            con.query(sql, function(err, result){
                if(err) throw err;
                console.log("Session inserted");
            })
        }
    }
}