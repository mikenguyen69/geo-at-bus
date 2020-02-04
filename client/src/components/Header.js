import React, {useContext, useState, useEffect} from "react";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import MapIcon from "@material-ui/icons/Map";
import Typography from "@material-ui/core/Typography";
import Context from '../context';
import Signout from './Auth/Signout';
import axios from 'axios';
import {useClient} from '../client';
import {DELETE_VEHICLE_MUTATION, CREATE_VEHICLE_MUTATION, UPDATE_VEHICLE_MUTATION} from '../graphql/mutations';
 
const Header = ({ classes }) => {
  const client = useClient();
  const {state, dispatch} = useContext(Context)
  const {currentUser} = state
  const [newloaded, setNewloaded] = useState([]);

  useEffect(() => {
    reloadVehicles()
  }, [newloaded])

  const reloadVehicles = async () => {
    // 2. processing the loaded vehicles            
    // Rule 1: if loaded vehicle is not in the list --> DB: Add new | State: Add
    // Rule 2: if loaded vehicle is in the list --> DB: Update | State: Delete + Add
    // Rule 3: if the existing list no longer exist in the loaded --> DB: Delete | State: Delete
    
    if (!newloaded || newloaded.length === 0) return;
    let count = 0;
    let existingVehicles = state.vehicles;
    let deletedList = [];

    existingVehicles.forEach((existingVehicle) => {
      const existingInLoaded = newloaded.find(x => x.id === existingVehicle.id && x.label===existingVehicle.label && x.license_plate === existingVehicle.license_plate);
      if (existingInLoaded === undefined) {
        // Rule 3: delete
        
        if (count++ > 10) return;
        
        deletedList.push(existingVehicle);      
      }
    })

    submitDeleteVehicle(deletedList);

    // newloaded.forEach((loadedVehicle) => {             
    //   const existingVehicle = state.vehicles.find(x => x.id === loadedVehicle.id && x.label===loadedVehicle.label && x.license_plate === loadedVehicle.license_plate);
    //   if (existingVehicle === undefined) {
    //     // Rule 1: new
    //     submitCreateVehicle(loadedVehicle)
    //   }
    //   else {
    //     // Rule 2: update
    //     submitUpdateVehicle(loadedVehicle)
    //   }
    // })
  }

  const handleReloadVehicles = async () => {
    console.log("Reloading the list now....");
    
    axios.defaults.headers.common['Ocp-Apim-Subscription-Key'] = '3cb5e82c66cd47aebd8f5f21f0cef60d';
    axios     
      .get(`https://api.at.govt.nz/v2/public/realtime/vehiclelocations`)
      .then(response => {
        const vehicles = response.data.response.entity;        
        // Get trip updates         
        axios.get(`https://api.at.govt.nz/v2/public/realtime/tripupdates`)
        .then(tripResponse => {
          const trips = tripResponse.data.response.entity;                   
          let loadedVehicles = [];
         
          vehicles.forEach(item => {
            // make sure we got the vehicles working one
            if (!item.vehicle || !item.vehicle.position || !item.vehicle.vehicle) return;
            // filter those vehicle not occupanted as well
            if (item.vehicle.occupancy_status !== 1) return;

            var vehicle = {
              id: item.id,
              label: item.vehicle.vehicle.label,
              license_plate: item.vehicle.vehicle.license_plate,
              latitude: item.vehicle.position.latitude,
              longitude: item.vehicle.position.longitude,
              bearing: item.vehicle.position.bearing === 0 ? "": item.vehicle.position.bearing,
              speed: item.vehicle.position.speed,              
            }
                        
            const trip = trips.find(x => x.trip_update && x.trip_update.vehicle && x.trip_update.vehicle.id === vehicle.id);
            if (trip !== undefined) {
                vehicle.delay = trip.trip_update.delay;
                vehicle.color = handleColorDisplay(trip.trip_update.delay);

                //submitCreateVehicle(vehicle);                   
                loadedVehicles.push(vehicle)
            }            
          });

          setNewloaded(loadedVehicles)
        })
      })
  }

  const handleColorDisplay = (delay) => {
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

    return status;
  }

  const submitCreateVehicle = async (vehicle) => {    
    const {createVehicle} = await client.request(CREATE_VEHICLE_MUTATION, vehicle);    
    dispatch({type: "CREATE_OR_UPDATE_VEHICLE", payload: createVehicle})
  }

  const submitUpdateVehicle = async (vehicle) => {    
    const {updateVehicle} = await client.request(UPDATE_VEHICLE_MUTATION, vehicle);        
    
    dispatch({type: "CREATE_OR_UPDATE_VEHICLE", payload: updateVehicle})
  }

  const submitDeleteVehicle = async (vehicles) => {    
    
    let deletedList1 = vehicles; 
    deletedList1.forEach((vehicle) => {
      //deleteExistingVehicle(vehicle)
    })    
        
    dispatch({type:"DELETE_VEHICLE", payload: vehicles});   
  }

  const deleteExistingVehicle = async (vehicle) => {
    await client.request(DELETE_VEHICLE_MUTATION, vehicle);
  }
  

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          {/* Title / Logo */}
          <div className={classes.grow}>
            <MapIcon className={classes.icon} />
            <Typography 
              component="h1" 
              variant="h6" 
              color="inherit" noWrap>
              GeoVehicles
            </Typography>
          </div>

          {/* Current User info*/}
          {currentUser && (
            <div className={classes.grow}>
              <img  
                className={classes.picture} 
                src={currentUser.picture} 
                alt={currentUser.name}
              />
            
              <Typography 
                variant="h5"
                color="inherit" 
                noWrap 
              >
                {currentUser.name}
              </Typography>
            </div>

          )}
          <button onClick={handleReloadVehicles}>Reload the list</button>        
          {/* Signout Button */}
          <Signout />
        </Toolbar>
      </AppBar>
    </div>
  );
};

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  grow: {
    flexGrow: 1,
    display: "flex",
    alignItems: "center"
  },
  icon: {
    marginRight: theme.spacing.unit,
    color: "green",
    fontSize: 45
  },
  mobile: {
    display: "none"
  },
  picture: {
    height: "50px",
    borderRadius: "90%",
    marginRight: theme.spacing.unit * 2
  }
});

export default withStyles(styles)(Header);
