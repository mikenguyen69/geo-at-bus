import React, {useState, useEffect, useContext} from "react";
import { withStyles } from "@material-ui/core/styles";
import ReactMapGL, {NavigationControl, Marker, Popup} from 'react-map-gl';
import {useClient} from '../client';
import {GET_PINS_QUERY} from '../graphql/queries';

// import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
// import DeleteIcon from "@material-ui/icons/DeleteTwoTone";

import PinIcon from './PinIcon';
import Context from '../context';
import Blog from './Blog';
import { CREATE_PIN_MUTATION } from "../graphql/mutations";

const INITIAL_VIEWPORT  = {
  latitude: -36.8484597,
  longitude: 174.7633315,
  zoom: 13
}

const Map = ({ classes }) => {
  const client = useClient();
  const {state, dispatch} = useContext(Context);
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);
  const [userPosition, setUserPosition] = useState({latitude: -36.8484597, longitude: 174.7633315});
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    getUserPosition()
  },[]);

  useEffect(() => {
    getPins()
  }, [])

  const getPins = async () => {
    const { getPins} = await client.request(GET_PINS_QUERY);
    dispatch({type: "GET_PINS", payload: getPins})
  }

  const getUserPosition = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        const {latitude, longitude} = position.coords;
        
        setViewport({...viewport, latitude, longitude});
        setUserPosition({latitude, longitude});       
      });
    }
  }

  const handleMapClick = ({lngLat, leftButton}) => {
    console.log("oh here...");
    if (!leftButton) return;
    if (!state.draft) {
      dispatch({type: "CREATE_DRAFT"})
    }

    const [longitude, latitude] = lngLat;
    
    dispatch({
      type: "UPDATE_DRAFT_LOCATION",
      payload: {longitude, latitude}
    });    
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

  return (
  <div className={classes.root}>
    <ReactMapGL
      width="100vw"
      height="calc(100vh - 64px)" 
      mapStyle="mapbox://styles/mapbox/streets-v9" 
      mapboxApiAccessToken="pk.eyJ1IjoibWlrZW5ndXllbiIsImEiOiJjazV4OWsyb24yM29pM21vbm1iOWczcWVuIn0.-bnGQr4bUUFasXDdcRqpZw" 
      onClick={handleMapClick}
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
      {state.pins.map(pin => (
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
      ))}

      {/* Show Popups*/}
      {popup && (
        <Popup anchor="top"
          latitude={popup.latitude}
          longitude={popup.longitude}
          closeOnClick={false}
          onClose={() => setPopup(null)}
        >
          <img 
            className={classes.popupImage}
            src={popup.image} 
            alt={popup.type}
          />
          <div className={classes.popupTab}>
            <Typography>
              <b>{popup.type}</b> {" is "} <font color={popup.color}>{handleShowStatus(popup.color)}</font>
            </Typography>            
            <Typography paragraph> 
              <blockquote>&quot;<i>{popup.note}</i>&quot;</blockquote>
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
