export const ME_QUERY = `
{
  me {
    _id
    name
    email
    picture
  }
}
`

export const GET_PINS_QUERY = `
{
    getPins {
        _id
        type
        color
        image
        note
        latitude
        longitude
        author {
            _id
            name
            email
            picture
        }
        comments {
            text
            createdAt
            author {
                _id
                name
                picture
            }
        }
    }
}
`

export const GET_VEHICLE_POSITION_QUERY = `{
    getVehiclePositions {
        _id 
        vehicle {
            trip {
                trip_id
                start_time
                start_date
                route_id
            }
            position {
                latitude
                longitude
                bearing
                speed
            }
            timestamp
            vehicle {
                id
                label
                license_plate
            }
            occupancy_status
        }       
    }
}
`