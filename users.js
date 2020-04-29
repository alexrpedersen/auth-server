'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let SECRET = 'appsecret'; // this is used as part of jwt for extra auth layers

// here is where you need to focus your lab assignment requirements -> you need mongoose/mongo

const users = new mongoose.Schema({
  userName: {type: String, unique: true, required: true},
  password: {type: String, required: true}
});

// these will come in handy
// mongoose pre hook -> for hashing a pw before saving it (ex: user.pre('save', doStuff))

users.pre('save', async function(record) {
  if (this.isModified('password')){
    this.password = await bcrypt.hash(this.password, 10)
  }
});

// username:pw -> req.headers.authorization
// decode username:pw
// check that the decoded pw is the same as the hashed one in the db
// if so, give me back the user

users.statics.authenticateBasic = function(user, password) {
  let query = {userName: user}
  return this.find(query)
    .then(async function (dbUser){
      console.log('dbUser password:', dbUser[0].password);
      // dbUser && dbUser.comparePassword(password)
      let isValid = await bcrypt.compare(password, dbUser[0].password);
      console.log('isvalid:', isValid);
      return isValid ? user : Promise.reject();
    })
    .catch(console.error);
}


users.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password)
  .then(valid => valid ? this : null);
}

// if the user has proper login creds
// generate a token that will be used in the future for accessing routes in our app
users.statics.generateToken = function(dbUser) {
  console.log('dbUser:', dbUser);
  return jwt.sign({userName: dbUser},'Whattttttttttttt');
};


module.exports = mongoose.model('users', users);