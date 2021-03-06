var mysql = require("./mysql-adapter.js");
module.exports = class {
    constructor(username, password, salt, permission_level, activated, registered, id) {
        this.id = id;
        this.username = username || "";
        this.password = password || "";
        this.salt = salt || "";
        this.permission_level = permission_level || 0;
        this.activated = activated || true;
        this.registered = registered || 0;
    }

    hasPermission(permission){
        return (this.permission_level & (1 << permission))>0;
    }

    addPermission(permission){
        this.permission_level = this.permission_level | (1 << permission);
    }

    removePermission(permission){
        this.permission_level = this.permission_level ^ (1 << permission);
    }

    /*load(id) {
        console.log(this.constructor);
        var self = new this.constructor(id);
        return new Promise(function(resolve, reject){
            console.log("Ja moin");
            console.log(self);
            if(self.id){
                console.log("Id");
                mysql.getUser(self.id)
                .then((result) => {
                    if(result){
                        console.log("Result:", result);
                        result = result[0];
                        self.username = result.username;
                        self.password = result.password;
                        self.salt = result.salt;
                        self.permission_level = result.permission_level;
                        self.activated = result.activated;
                        resolve(self);
                    }else{
                        console.log("No user");
                        reject("No user found");
                    }
                })
                .catch(err => {
                    console.log("Err:", err);
                    reject(err);
                });
            }else{
                console.log("No id");
                reject("No id");
            }
        })
    }*/
}