const { AuthenticationError } = require('apollo-server')
const Pin = require('./models/Pin')
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

            const newPosition = {...args.input, 'isUpdated': 1};

            const filter = {
                'id': newPosition.id, 
                'label': newPosition.label,
                'license_plate': newPosition.license_plate
            };
            const existVehicle = (await Vehicle.find( filter ))[0];

            if (!existVehicle || existVehicle === undefined) {
                const newVehicle = await new Vehicle(
                    {...newPosition})
                    .save();
            } 
            else {                               
                if (newPosition.latitude !== existVehicle.latitude 
                    && newPosition.longitude !== existVehicle.longitude) {
                    
                    const updatedPosition = await Vehicle.findOneAndUpdate(filter, newPosition, {new: true});                                    
                    console.log("Updated", updatedPosition);
                } 
                else {
                    const updatedPosition = await Vehicle.findOneAndUpdate(filter, {'isUpdated': 0}, {new: true}); 
                    console.log("No updated", updatedPosition);
                }               
            }                
        }),
    }
}