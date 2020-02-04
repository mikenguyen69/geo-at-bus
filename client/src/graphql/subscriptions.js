import gql from 'graphql-tag'

export const VEHICLE_CREATED_SUBCRIPTION = gql`
    subscription {
        vehicleCreated {
            id
            label
            license_plate
            latitude
            longitude
            bearing
            speed
            delay
            color                        
        }
    }
`

export const VEHICLE_UPDATED_SUBCRIPTION = gql`
    subscription {
        vehicleUpdated {
            id
            label
            license_plate
            latitude
            longitude
            bearing
            speed
            delay
            color
        }
    }
`

export const VEHICLE_DELETED_SUBCRIPTION = gql`
    subscription {
        vehicleDeleted {
            id
            label
            license_plate
            latitude
            longitude
            bearing
            speed
            delay
            color            
        }
    }
`