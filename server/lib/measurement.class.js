module.exports = class {
    constructor(station_id, type, value, timestamp, id) {
        this.station_id = station_id;
        this.type = type;
        this.value = value;
        this.timestamp = timestamp;
        this.id = id;
    }
}