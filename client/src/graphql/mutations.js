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