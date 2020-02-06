const { AuthenticationError, PubSub } = require('apollo-server')
const Pin = require('./models/Pin')
const Vehicle = require('./models/Vehicle')

const pubsub = new PubSub()
const VEHICLE_CREATED = "VEHICLE_CREATED"
const VEHICLE_UPDATED = "VEHICLE_UPDATED"
const VEHICLE_DELETED = "VEHICLE_DELETED"

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
            const vehicles = await Vehicle.find({'isUpdated': 1});
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

            const newPosition = {...args.input};

            const vehicleCreated = await new Vehicle(
                {...newPosition})
                .save();
                
            pubsub.publish(VEHICLE_CREATED, {vehicleCreated});   

            return vehicleCreated;
        }),
        
        updateVehicle: authenticated(async (root, args, ctx) => {            

            const newPosition = {...args.input};

            const filter = {
                'id': newPosition.id, 
                'label': newPosition.label,
                'license_plate': newPosition.license_plate
            };

            const vehicleUpdated = await Vehicle.findOneAndUpdate(filter, newPosition, {new: true}).exec();     

            pubsub.publish(VEHICLE_UPDATED, {vehicleUpdated});  
            
            return vehicleUpdated;
                            
        }),

        deleteVehicle: authenticated(async (root, args, ctx) => {            
            const tobeDeleted = {...args.input};
            const filter = {
                'id': tobeDeleted.id, 
                'label': tobeDeleted.label,
                'license_plate': tobeDeleted.license_plate
            };

            const vehicleDeleted = await Vehicle.findOneAndDelete(filter, tobeDeleted).exec();

            pubsub.publish(VEHICLE_DELETED, {vehicleDeleted});     
            
            return vehicleDeleted;
        })
    },
    Subscription: {
        vehicleCreated: {
            subscribe: () => pubsub.asyncIterator(VEHICLE_CREATED)
        },
        vehicleUpdated: {
            subscribe: () => pubsub.asyncIterator(VEHICLE_UPDATED)
        },
        vehicleDeleted: {
            subscribe: () => pubsub.asyncIterator(VEHICLE_DELETED)
        }
    }
}