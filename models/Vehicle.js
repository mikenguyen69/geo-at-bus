const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    id: String,
    label: String,
    license_plate: String,
    latitude: Number,
    longitude: Number,
    bearing: String,
    speed: Number,
    delay: Number
},)

module.exports = mongoose.model("Vehicle", VehicleSchema);