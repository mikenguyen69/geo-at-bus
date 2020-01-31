const { AuthenticationError } = require('apollo-server')
const Pin = require('./models/Pin')
const VehiclePosition = require('./models/VehiclePosition')
const TripUpdate = require('./models/TripUpdate')

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
        getVehiclePositions: async (root, args, ctx) => {
            const vehiclePositions = await VehiclePosition.find({ 
                "vehicle.trip": { $exists: true} ,
                "vehicle.occupancy_status": 1
            });
            return vehiclePositions;
        },
        getTripUpdates: async (root, args, ctx) => {
            const tripUpdates = await TripUpdate.find({ 
                
            });
            return tripUpdates;
        }
    },
    Mutation: {
        createPin: authenticated(async (root, args, ctx) => {
            const newPin = await new Pin({
                ...args.input,
                author: ctx.currentUser
            }).save()

            const pinAdded = await Pin.populate(newPin, 'author')
            
            return pinAdded;

        })
    }
}