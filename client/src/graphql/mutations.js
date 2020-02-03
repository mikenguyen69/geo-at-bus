export const CREATE_PIN_MUTATION = `
    mutation($type: String!, $color: String!, $image: String!, $note: String!, $latitude: Float!, $longitude: Float!) {
        createPin(input: {
            type: $type,
            color: $color,
            image: $image,
            note: $note,
            latitude: $latitude,
            longitude: $longitude
        }) {
            _id
            createdAt
            type
            color
            image
            note,
            latitude
            longitude
            author {
                _id
                name
                email
                picture
            }
        }
    }
`

export const CREATE_VEHICLE_MUTATION = `
    mutation($id: String!, $label: String!, $license_plate: String!,$latitude: Float!, $longitude: Float!, $bearing: String!, $speed: Float!, $delay: Float) {
    createVehicle(input: {
        id: $id,
        label: $label,
        license_plate: $license_plate,    
        latitude: $latitude,
        longitude: $longitude,
        bearing: $bearing,
        speed: $speed,
        delay: $delay        
    }) {
        id
        label
        license_plate
        latitude
        longitude
        bearing
        speed
        delay
    }
}
`