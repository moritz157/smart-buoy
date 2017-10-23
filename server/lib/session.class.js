const crypto = require("crypto");
module.exports = class {

    constructor(user_id, ip, session_id, created) {
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