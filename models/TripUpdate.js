const mongoose = require('mongoose');

const TripUpdateSchema = new mongoose.Schema({
    id: String,
    trip_update: {
        trip: {
            trip_id: String,
            start_time: String,
            start_date: String,
            schedule_relationship: Number,
            route_id: String,
            direction_id: Number
        },
        stop_time_update: {
            stop_sequence: Number,
            departure: {
                delay: Number,
                time: Number,
                uncertainty: Number
            },
            stop_id: String,
            schedule_relationship: Number
        },        
        vehicle: {
            id: String,
            label: String,
            license_plate: String
        },
        timestamp: Number,
        delay: Number,
    },    
    is_delete: Boolean
},)

module.exports = mongoose.model("TripUpdate", TripUpdateSchema);