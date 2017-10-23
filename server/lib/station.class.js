module.exports = class {
    constructor(name, creator_id, id, created, last_updated, enabled, longitude, latitude) {
        this.name = name;
        this.creator_id = creator_id;
        if(id){this.id = id}
        if(created){this.created = created}
        if(last_updated){this.last_updated = last_updated}
        if(enabled){this.enabled = enabled}
    }
}