const { AuthenticationError } = require('apollo-server')
const Pin = require('./models/Pin')
const VehiclePosition = require('./models/VehiclePosition')
const TripUpdate = require('./models/TripUpdate')
const Vehicle = require('./models/Vehicle')

const authenticated = next => (root, args, ctx, info) => {
    if (!ctx.currentUser) {
        throw new AuthenticationError('You must be logged in')
    }
    

    return next(root, args, ctx, info)
}

module.exports = {
    Query: {
        me: authenticated((root, args, ctx) => ctx.currentUser),
        getPins: async (root, args, ctx) => {
            const pins = await Pin.find({}).populate('author').populate('comments.author');
            return pins;
        },
        getVehicles: async (root, args, ctx) => {
            const vehicles = await Vehicle.find({});
            return vehicles;
        },
    },
    Mutation: {
        createPin: authenticated(async (root, args, ctx) => {
            const newPin = await new Pin({
                ...args.input,
                author: ctx.currentUser
            }).save()

            const pinAdded = await Pin.populate(newPin, 'author')
            
            return pinAdded;

        }),

        createVehicle: authenticated(async (root, args, ctx) => {
            const newVehicle = await new Vehicle({
                ...args.input               
            }).save()

            // const pinAdded = await Pin.populate(newPin, 'author')        
            // return pinAdded;
        }),
    }
}