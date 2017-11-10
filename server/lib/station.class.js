const mysql = require("./mysql-adapter.js");
module.exports = class {
    constructor(name, creator_id, id, created, last_updated, enabled, longitude, latitude) {
        if(name && !creator_id){
            this.id = name;
        }else{
            this.name = name;
            this.creator_id = creator_id;
            if(id){this.id = id}
            if(created){this.created = created}
            if(last_updated){this.last_updated = last_updated}
            if(enabled){this.enabled = enabled}
            this.token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        }
    }

    getAuthToken(session_id){
        return mysql.getStationAuthToken(this.id, session_id);
    }

    generateNewAuthToken(){
        this.token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    load(){
        var that = this;
        return new Promise(function(resolve, reject){
            const mysql = require("./mysql-adapter.js");
            
            mysql.getStation(that.id)
            .then(result => {
                that = result;
                resolve(result);
            })
            .catch(err => {
                reject(err);
            });
        });
    }
}