const crypto = require("crypto");
const mysql = require("./mysql-adapter.js");
module.exports = class {

    constructor(user_id, ip, session_id, created) {
        if(user_id && !ip){
            this.session_id = user_id;
        }else{
            const hash = crypto.createHash('sha256');
            this.user_id = user_id;
            this.ip = ip;
            if(session_id){this.session_id = session_id};
            if(created){this.created = created};
    
            var random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + user_id;
            hash.update(random);
            this.session_id = hash.digest('hex');
        }
    }

    delete(){
        mysql.deleteSession(this.id);
    }

    load(){
        var that = this;
        return new Promise(function(resolve, reject){
            const mysql = require("./mysql-adapter.js");
            mysql.getSession(this.session_id)
            .then((result) => {
                that = result;
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            })
        })
        
    }
}