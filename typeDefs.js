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

    type Comment {
        text: String
        createdAt: String
        author: User
    }

    type Vehicle {
        id: String
        label: String
        license_plate: String
        latitude: Float
        longitude: Float
        bearing: String
        speed: Float
        delay: Float
        color: String
        isUpdated: Float
    }

    input CreatePinInput {
        type: String
        color: String
        image: String
        note: String
        latitude: Float
        longitude: Float
    }

    input CreateOrUpdateVehicle {
        id: String
        label: String
        license_plate: String
        latitude: Float
        longitude: Float
        bearing: String
        speed: Float
        delay: Float
        color: String        
    }

    input DeleteVehicle {
        id: String
        label: String
        license_plate: String
    }

    type Query {
        me: User
        getPins: [Pin!] 
        getVehicles: [Vehicle!]
       
    }

    type Mutation {
        createPin(input: CreatePinInput!): Pin
        createVehicle(input: CreateOrUpdateVehicle!): Vehicle
        updateVehicle(input: CreateOrUpdateVehicle!): Vehicle
        deleteVehicle(input: DeleteVehicle!): Vehicle
    }

    type Subscription {
        vehicleCreated: Vehicle
        vehicleUpdated: Vehicle
        vehicleDeleted: Vehicle
    }
`