export default function reducer(state, {type, payload}) {    
    switch(type) {
        case "LOGIN_USER": 
            return {
                ...state,
                currentUser: payload
            }

        case "IS_LOGGED_IN": 
            
            return {
                ...state,
                isAuth: payload
            }

        case "SIGNOUT_USER": 
            return {
                ...state,
                isAuth: false,
                currentUser: null
            }

        case "CREATE_DRAFT": 
            return {
                ...state,
                currentPin: null,
                draft: {
                    latitude: 0,
                    longitude: 0
                }
            }
        
        case "UPDATE_DRAFT_LOCATION": 
            return {
                ...state,
                draft: payload
            }

        case "DELETE_DRAFT": 
            return {
                ...state,
                draft: null
            }

        case "GET_PINS": 
            return {
                ...state,
                pins: payload
            }
         
        case "CREATE_PIN": 
            const newPin = payload
            const prevPins = state.pins.filter(pin => pin._id !== newPin._id)

            return {
                ...state,
                pins: [...prevPins, newPin]
            }

        case "SET_PIN": 
            return {
                ...state,
                currentPin: payload,
                draft: null
            }
        
        case 'CREATE_VEHICLE': {
            const newVehicle = payload
            const previousVehicles = state.vehicles.filter(v => v._id !== newVehicle._id)

            return {
                ...state,
                vehicles: [...previousVehicles, newVehicle]
            } 
        }

        case "GET_VEHICLES":             
            return {
                ...state,
                vehicles: payload
            }

        case "GET_TRIPS":           
            const trips = payload;
            const updatedVehicles = state.vehicles.map(obj => {
                let newObj = obj;                
                const trip = trips.find(x => x.id === obj.vehicle.trip.trip_id);
                if (trip !== undefined) {
                    const delay = trip.trip_update.delay;
                    let status = "";
                    if (delay > 200) {
                        status = "red"
                    }
                    else if (delay > 0) {
                        status = "blue"
                    }
                    else {
                        status = "green"
                    }

                    newObj.status = status;
                }
                return newObj;
            });
            
            return {
                ...state,
                trips: payload,
                vehicles: updatedVehicles
            }

        default: 
            return state;        
    }
}