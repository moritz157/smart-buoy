module.exports = class {
    constructor(station_id, type, value, longitude, latitude, timestamp, id) {
        this.station_id = station_id;
        this.type = type;
        this.value = value;
        this.longitude = longitude;
        this.latitude = latitude;
        this.timestamp = timestamp;
        this.id = id;
    }
}