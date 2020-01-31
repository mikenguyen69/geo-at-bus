import React, {useState, useEffect, useContext} from "react";
import { withStyles } from "@material-ui/core/styles";
import ReactMapGL, {NavigationControl, Marker, Popup} from 'react-map-gl';
import {useClient} from '../client';
import {GET_PINS_QUERY, GET_VEHICLE_POSITION_QUERY, GET_TRIP_UPDATE_QUERY} from '../graphql/queries';
import Typography from "@material-ui/core/Typography";
import PinIcon from './PinIcon';
import Context from '../context';


const INITIAL_VIEWPORT  = {
  latitude: -36.8484597,
  longitude: 174.7633315,
  zoom: 13
}

const Map = ({ classes }) => {
  const client = useClient();
  const {state, dispatch} = useContext(Context);
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);
  const [popup, setPopup] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    getUserPosition()
  },[]);

  useEffect(() => {
    getPins()
  }, [])

  useEffect(() => {
    getVehicles()     
  },[])

  const getTripUpdates = async (vehicleList) => {
    const {getTripUpdates} = await client.request(GET_TRIP_UPDATE_QUERY);
    //dispatch({type: "GET_TRIPS", payload: getTripUpdates});
    const newVehicles = vehicleList.map(obj => {
      let newObj = obj;                
      const trip = getTripUpdates.find(x => x.trip_update.vehicle.id === obj.vehicle.vehicle.id);
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

          newObj.vehicle.status = status;
      }

      return newObj;
    });
    
    
    console.log(vehicleList);
    setVehicles(vehicleList.filter(x => x.vehicle.status !== null));
  }

  const getVehicles = async () => {
    const {getVehiclePositions} = await client.request(GET_VEHICLE_POSITION_QUERY);
    //dispatch({type: "GET_VEHICLES", payload: getVehiclePositions})
    
    // setVehicles(getVehiclePositions);

    console.log(getVehiclePositions.length);

    getTripUpdates(getVehiclePositions);
  }

  const getPins = async () => {
    const { getPins} = await client.request(GET_PINS_QUERY);
    dispatch({type: "GET_PINS", payload: getPins})
  }

  const getUserPosition = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        const {latitude, longitude} = position.coords;
        
        setViewport({...viewport, latitude, longitude});
        
      });
    }
  }

  const handleViewPortChange = newViewport => {
    setViewport(newViewport);
  }

  const handleSelectPin = pin => {
    console.log("handleSelectPin: ", pin);
    setPopup(pin);    
    dispatch({
      type: "SET_PIN",
      payload: pin
    })
  }

  const handleShowStatus = color => {
    if (color === 'green') {
      return " on time"
    } else if (color === 'blue') {
      return " slightly delayed. "
    }
    else {
      return " late!!!!"
    }
  }

  const handleShowSpeed = speed => {
    if (speed > 0) return `It is moving at speed of ${speed.toFixed(2)} km/h`;
    else return 'It is not moving at all !!!'
  }

  return (
  <div className={classes.root}>
    <ReactMapGL
      width="100vw"
      height="calc(100vh - 64px)" 
      mapStyle="mapbox://styles/mapbox/streets-v9" 
      mapboxApiAccessToken="pk.eyJ1IjoibWlrZW5ndXllbiIsImEiOiJjazV4OWsyb24yM29pM21vbm1iOWczcWVuIn0.-bnGQr4bUUFasXDdcRqpZw"       
      onViewStateChange={handleViewPortChange}
      {...viewport}
    >
      {/* Naviation control*/}
      <div className={classes.navigationControl}>
        <NavigationControl onViewStateChange={handleViewPortChange} />
      </div>

      {/* For current user location */}
      {/* {userPosition && (        
          <Marker
            latitude={userPosition.latitude}
            longitude={userPosition.longitude}
            offsetLeft={-19}
            offsetTop={-37}
            >
            <PinIcon color="darkorange" />
          </Marker>          
      )} */}

      {/* Draft Pin */}
      {/* {state.draft && (
        <Marker
        latitude={state.draft.latitude}
        longitude={state.draft.longitude}
        offsetLeft={-19}
        offsetTop={-37}
        >
        <PinIcon color="hotpink" />
      </Marker>
      )} */}

      {/* Created Pins*/}
      {/* {state.pins.map(pin => (
        <Marker
          key={pin._id}
          latitude={pin.latitude}
          longitude={pin.longitude}
          offsetLeft={-19}
          offsetTop={-37}           
          >
          <PinIcon 
            color={pin.color} 
            type={pin.type} 
            onClick={() => handleSelectPin(pin)}
          />
        </Marker>
      ))} */}

      {/* Create vehicle*/}
      {vehicles.map(({_id, vehicle, status}) => (
        <Marker
          key={_id}
          latitude={vehicle.position.latitude}
          longitude={vehicle.position.longitude}
          offsetLeft={-19}
          offsetTop={-37}           
          >
          <div className={classes.popupTab}>
            <PinIcon 
              color={vehicle.status}
              type="bus"         
              onClick={() => handleSelectPin(vehicle)}
            />
            {/* <Typography>{vehicle.vehicle.license_plate}</Typography> */}
          </div>
          
        </Marker>
      ))}

      {/* Show Popups*/}
      {popup && (
        <Popup anchor="top"
          latitude={popup.position.latitude}
          longitude={popup.position.longitude}
          closeOnClick={false}
          onClose={() => setPopup(null)}
        >
          {/* <img 
            className={classes.popupImage}
            src={popup.image} 
            alt={popup.type}
          /> */}
          <div className={classes.popupTab}>
            <Typography>
              <b>{popup.vehicle.label} (Plate No of {popup.vehicle.license_plate})</b> {" is "} <font color={popup.status}>{handleShowStatus(popup.status)}</font>
            </Typography>            
            <Typography> 
              <br />
              <i>{handleShowSpeed(popup.position.speed)}</i>
            </Typography>
          </div>
        </Popup>
      )

      }
    </ReactMapGL>

    {/* Blog area to add Pin content */}
    {/* <Blog /> */}
  </div>)
};

const styles = {
  root: {
    display: "flex"
  },
  rootMobile: {
    display: "flex",
    flexDirection: "column-reverse"
  },
  navigationControl: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: "1em"
  },
  deleteIcon: {
    color: "red"
  },
  popupImage: {
    padding: "0.4em",
    height: 200,
    width: 200,
    objectFit: "cover"
  },
  popupTab: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column"
  }
};

export default withStyles(styles)(Map);
