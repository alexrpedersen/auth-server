const express = require('express');
const authRouter = express.Router();

const User = require('./users-model.js');
const oauth = require('../middleware/oauth-middleware.js');
const basicAuth = require('../middleware/basic-auth-middleware.js');


authRouter.post('/signup', async function(req, res, next){
  // let userExists = await User.find({
  //   userName: req.body.userName
  // });
  //   console.log('If a user exisit', userExists);
  
    let user = new User(req.body);
      user.save()
        .then(dbUser => {
          console.log('** I am a dbUser **',dbUser);
          req.token = user.generateToken();
          req.user = user;
          res.send(req.token);
        })
        .catch(next);
  });
  
  authRouter.post('/signin', basicAuth, (req, res) => {

    res.status(200).send(req.token);
  });
  
  authRouter.get('/users', basicAuth, (req, res) => {
    res.status(200).send(users.list());
  });

  // this is our "redirect_uri"
authRouter.get('/oauth', oauth, (req, res) => {
  res.status(200).send(req.token);
});

  module.exports = authRouter;