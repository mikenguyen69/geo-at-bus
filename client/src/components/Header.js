import React, {useContext} from "react";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import MapIcon from "@material-ui/icons/Map";
import Typography from "@material-ui/core/Typography";
import Context from '../context';
import Signout from './Auth/Signout';
import axios from 'axios';
import {useClient} from '../client';
import {CREATE_VEHICLE_MUTATION} from '../graphql/mutations';
 
const Header = ({ classes }) => {
  const client = useClient();
  const {state, dispatch} = useContext(Context)
  const {currentUser} = state

  const handleReloadVehicles = async () => {
    console.log("Reloading the list now....");
    axios.defaults.headers.common['Ocp-Apim-Subscription-Key'] = '3cb5e82c66cd47aebd8f5f21f0cef60d';
    axios     
      .get(`https://api.at.govt.nz/v2/public/realtime/vehiclelocations`)
      .then(response => {
        const vehicles = response.data.response.entity;
        console.log('Number of vehicles loaded: ', vehicles.length);
        console.log(vehicles);

        // Get trip updates         
        axios.get(`https://api.at.govt.nz/v2/public/realtime/tripupdates`)
        .then(tripResponse => {
          const trips = tripResponse.data.response.entity;
          console.log('Number of trips loaded: ', trips.length);
          console.log(trips);
          let count = 1;

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

            console.log(`${count}: ${vehicles}`);

            const trip = trips.find(x => x.trip_update && x.trip_update.vehicle && x.trip_update.vehicle.id === vehicle.id);
            if (trip !== undefined) {
                vehicle.delay = trip.trip_update.delay;

                submitCreateVehicle(vehicle);
           
                count++;
            }
            console.log('total vehicle created: ', count);
          });

        })
      })

  }

  const submitCreateVehicle = async (vehicle) => {
    const {createVehicle} = await client.request(CREATE_VEHICLE_MUTATION, vehicle);
    
    dispatch('CREATE_VEHICLE', createVehicle)
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
