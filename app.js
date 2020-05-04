'use strict';

const basicAuth = require('./middleware/basic-auth-middleware.js');
const users = require('./auth/users-model.js');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

//middleware routes
const router = require('./auth/routes.js');

const app = express();
app.use(cors());
app.use(morgan('dev'));

// will parse the req body on post and put request
app.use(router);
app.use(express.json());
app.use(express.static('./public'));
app.use(express.urlencoded({extended: true}));


module.exports = {
  server: app,
  start: port => {
    app.listen(port, () => console.log(`server up: ${port}`));
  }
};

app.post('/signup', (req, res) => {
  users.save(req.body)
    .then(user => {
      let token = users.generateToken(user);
      res.status(200).send(token);
    })
    .catch( err => res.status(403).send('error creating user'));
});

app.post('/signin', basicAuth, (req, res) => {
  // req.token only exists because of our basic auth middleware
  res.status(200).send(req.token);
});

// this is our "redirect_uri"
app.get('/oauth', oauth, (req, res) => {
  res.status(200).send(req.token);
});

app.get('/secured-route', bearerAuth, (req, res) => {
  res.json({ msg: 'success!'});
});

app.post('/secured-route/post', bearerAuth, (req, res) => {
  res.json(req.body);
});

app.get('/list', bearerAuth, (req, res) => {
  res.json({ list: users.list()});
});

app.post('/create', bearerAuth, acl('create'), (req, res) => {
  res.json({ msg: '/create worked'});
});

app.put('/update', bearerAuth, acl('update'), (req, res) => {
  res.send('ok');
});

app.delete('/delete', bearerAuth, acl('delete'), (req, res) => {
  res.json({ msg: '/delete worked'});
});

app.listen(3000, () => { console.log('listening on 3000')});