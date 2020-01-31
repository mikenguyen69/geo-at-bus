const mongoose = require('mongoose');

const VehiclePositionSchema = new mongoose.Schema({
    id: String,
    vehicle: {
        trip: {
            trip_id: String,
            start_time: String,
            start_date: String,
            schedule_relationship: Number,
            route_id: String,
            direction_id: Number
        },
        position: {
            latitude: Number,
            longitude: Number,
            bearing: String,
            speed: Number
        },
        timestamp: Number,
        vehicle: {
            id: String,
            label: String,
            license_plate: String
        },
        occupancy_status: Number,
        status: Number
    },    
    is_delete: Boolean
},)

module.exports = mongoose.model("VehiclePosition", VehiclePositionSchema);