const crypto = require("crypto");
module.exports = class {

    constructor(user_id, ip) {
        const hash = crypto.createHash('sha256');
        this.user_id = user_id;
        this.ip = ip;

        var random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + user_id;
        hash.update(random);
        this.session_id = hash.digest('hex');
    }
}