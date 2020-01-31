const {gql} = require('apollo-server')

module.exports = gql`
    type User {
        _id: ID
        name: String
        email: String
        picture: String
    } 

    type Pin {
        _id: ID
        createdAt: String
        type: String
        color: String
        note: String
        image: String
        latitude: Float
        longitude: Float
        author: User
        comments: [Comment]
    }

    type VehiclePosition {
        _id: ID
        id: String
        vehicle: VehicleObject       
    }

    
    type VehicleObject { 
        trip: TripObject   
        position: Position
        timestamp: Float
        vehicle: Vehicle
        occupancy_status: Float  
    }

    type TripObject {
        trip_id: String,
        start_time: String
        start_date: String
        schedule_relationship: Float
        route_id: String
        direction_id: Float
    }


    type Vehicle {        
        id: String
        label: String
        license_plate: String
    }

    type Position {
        latitude: Float
        longitude: Float
        bearing: String
        speed: Float
    }

    

    type Comment {
        text: String
        createdAt: String
        author: User
    }

    input CreatePinInput {
        type: String
        color: String
        image: String
        note: String
        latitude: Float
        longitude: Float
    }

    type Query {
        me: User
        getPins: [Pin!] 
        getVehiclePositions: [VehiclePosition!]
    }

    type Mutation {
        createPin(input: CreatePinInput!): Pin
    }
`