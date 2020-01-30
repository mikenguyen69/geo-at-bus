import React, {useContext} from "react";
import {GoogleLogin} from 'react-google-login';
import { withStyles } from "@material-ui/core/styles";
import {GraphQLClient} from 'graphql-request';
import Typography from "@material-ui/core/Typography";
import {ME_QUERY} from '../../graphql/queries';

import Context from '../../context';
import {BASE_URL} from '../../client';


const Login =  ({ classes }) => {

  const {dispatch} = useContext(Context)

  const onSuccess = async googleUser => {
   
    try {
      const idToken = googleUser.getAuthResponse().id_token;
    
      const client = new GraphQLClient(BASE_URL, {
        headers: {authorization: idToken}
      })
      const {me} = await client.request(ME_QUERY);

      dispatch({type: "LOGIN_USER", payload: me});
      dispatch({type: "IS_LOGGED_IN", payload: googleUser.isSignedIn()})
    } catch(err) {
      onFailure(err);
    }
  }

  const onFailure = err => {
    console.error("Error logging in", err);
  }

  return (
    <div className={classes.root}>
      <Typography 
        component="h1" 
        variant="h3"
        gutterBottom noWrap
        style={{color: "rgb(66,133,244)"}}>
        Welcome
      </Typography>
      <GoogleLogin clientId="356546691800-bchs3s6p3ddhv62shjk665ncsnl02ntc.apps.googleusercontent.com" 
        onSuccess={onSuccess} 
        isSignedIn="true"
        onFailure={onFailure}
        buttonText="Login with Google"
      />
    </div>
    
  );
};

const styles = {
  root: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center"
  }
};

export default withStyles(styles)(Login);
