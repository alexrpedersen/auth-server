const superagent = require('superagent');
const users = require('../auth/users-model');
require('dotenv').config();

// these are the required creds (some private - some public) for login/signup with a 3rd party service - OAuth
const tokenServerUrl = 'https://github.com/login/oauth/access_token';
const remoteAPI = 'https://api.github.com/user';
const CLIENT_ID = '3f00e402acac7af982ea'; // process.env.CLIENT_ID goes here - this lives in the associated .env file
const CLIENT_SECRET = process.env.CLIENT_SECRET; // process.env.CLIENT_SECRET goes here - this lives in the associated .env file
const API_SERVER = 'http://localhost:3000/oauth';

module.exports = async function authorize(req, res, next) {
  // in here we will do the handshake
  // 1 - pop up a login/signup screen from github
  // 2 - make a request to github with a "code" that comes from that popup
  // 3 - github will respond with a token
  // 4 - send that token back to github (remoteAPI) and github will respond with user details
  // 5 - save the user and generate a user token

  try {
    let code = req.query.code;
    console.log('__CODE__:', code);

    let remoteToken = await exchangeCodeForToken(code);
    console.log('__GH TOKEN__:', remoteToken);

    let remoteUser = await getRemoteUserInfo(remoteToken);
    console.log('__GH USER__:', remoteUser);

    let [user, token] = await getUser(remoteUser);
    req.token = token;
    req.user = user;

    console.log('__LOCAL USER__:', user);
    next();
  } catch(err) {
    next(`Error: ${err}`);
  }
}

// this will use the access_token github api endpoint
async function exchangeCodeForToken(code) {
  let tokenResponse = await superagent.post(tokenServerUrl)
    .send({
      code: code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: API_SERVER,
      grant_type: 'authorization_code'
    })
  
  let access_token = tokenResponse.body.access_token;
  return access_token;
}

// this will use the user api endpoint to get user info/repo info
async function getRemoteUserInfo(token) {
  // this will use the access token to get user details
  let userResponse = await superagent.get(remoteAPI)
    .set('user-agent', 'express-app')
    .set('Authorization', `token ${token}`).catch(e => console.log(e));

  let user = userResponse.body;
  return user;
}

async function getUser(remoteUser) {
  // this will actually save the user to the db and return user details from the db
  let userRecord = {
    userName: remoteUser.login,
    password: 'alexppassword'
  }
  let newUser = new users(userRecord);

  let user = await newUser.save().catch(e => console.log(e));
  // this is meant for us to generate a final user token to access routes in our app
  // tomorrow: this is will be used in the format of a Bearer Authentication Token
  let token = users.generateToken(user);
 
  return [user, token];
}