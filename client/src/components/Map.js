import React, {useState, useEffect, useContext} from "react";
import { withStyles } from "@material-ui/core/styles";
import ReactMapGL, {NavigationControl, Marker, Popup} from 'react-map-gl';
import {useClient} from '../client';
import {GET_PINS_QUERY, GET_VEHICLE_QUERY} from '../graphql/queries';
import Typography from "@material-ui/core/Typography";
import PinIcon from './PinIcon';
import Context from '../context';
import {Subscription} from 'react-apollo';
import {VEHICLE_UPDATED_SUBCRIPTION, VEHICLE_CREATED_SUBCRIPTION, VEHICLE_DELETED_SUBCRIPTION} from '../graphql/subscriptions';
import {unstable_useMediaQuery as useMediaQuery} from '@material-ui/core/useMediaQuery'

const INITIAL_VIEWPORT  = {
  latitude: -36.8484597,
  longitude: 174.7633315,
  zoom: 13
}

const Map = ({ classes }) => {
  const client = useClient();
  const mobileSize = useMediaQuery("(max-width: 650px)");
  const {state, dispatch} = useContext(Context);
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);
  const [popup, setPopup] = useState(null);
 
  useEffect(() => {
    getUserPosition()
  },[]);

  useEffect(() => {
    getPins()
  }, [])

  useEffect(() => {
    getVehicles()     
  },[])

  const getVehicles = async () => {
    let {getVehicles} = await client.request(GET_VEHICLE_QUERY);    
    
    dispatch({type: "GET_VEHICLES", payload: getVehicles});
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
  <div className={mobileSize ? classes.rootMobiles : classes.root}>
    <ReactMapGL
      width="100vw"
      height="calc(100vh - 64px)" 
      mapStyle="mapbox://styles/mapbox/streets-v9?optimize=true" 
      mapboxApiAccessToken="pk.eyJ1IjoibWlrZW5ndXllbiIsImEiOiJjazV4OWsyb24yM29pM21vbm1iOWczcWVuIn0.-bnGQr4bUUFasXDdcRqpZw"       
      onViewStateChange={handleViewPortChange}
      {...viewport}
      scrollZoom={mobileSize}
    >
      {/* Naviation control*/}
      <div className={classes.navigationControl}>
        <NavigationControl onViewStateChange={handleViewPortChange} />
      </div>

      {/* Create vehicle*/}
      {state.vehicles.map((vehicle) => (
        <Marker
          key={vehicle.id}
          latitude={vehicle.latitude}
          longitude={vehicle.longitude}
          offsetLeft={-19}
          offsetTop={-37}           
          >
          <div className={classes.popupTab}>
            <PinIcon 
              color={vehicle.color}
              type="bus"         
              onClick={() => handleSelectPin(vehicle)}
            />

          </div>
          
        </Marker>
      ))}

      {/* Show Popups*/}
      {popup && (
        <Popup anchor="top"
          latitude={popup.latitude}
          longitude={popup.longitude}
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
              <b>{popup.label} (Plate No of {popup.license_plate})</b> {" is "} <font color={popup.color}>{handleShowStatus(popup.color)}</font>
            </Typography>            
            <Typography> 
              <br />
              <i>{handleShowSpeed(popup.speed)}</i>
            </Typography>
          </div>
        </Popup>
      )

      }
    </ReactMapGL>

    {/* Subscriptions for vehicle updates */}
    <Subscription 
      subscription={VEHICLE_CREATED_SUBCRIPTION} 
      onSubscriptionData={({ subscriptionData}) => {
        const {vehicleCreated} = subscriptionData.data              
        dispatch({type: "CREATE_OR_UPDATE_VEHICLE", payload: vehicleCreated})
      }}
    />

    <Subscription 
      subscription={VEHICLE_UPDATED_SUBCRIPTION} 
      onSubscriptionData={({ subscriptionData}) => {
        const {vehicleUpdated} = subscriptionData.data              
        dispatch({type: "CREATE_OR_UPDATE_VEHICLE", payload: vehicleUpdated})
      }}
    />

    <Subscription 
      subscription={VEHICLE_DELETED_SUBCRIPTION} 
      onSubscriptionData={({ subscriptionData}) => {
        const {vehicleDeleted} = subscriptionData.data              
        dispatch({type: "DELETE_VEHICLE", payload: vehicleDeleted})
      }}
    />

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
