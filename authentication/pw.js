  
'use strict';

const base64 = require('base-64');
const bcrypt = require('bcrypt'); // if on windows - you need the windows version

let pwString = 'someUser:somePw';

let encoded = base64.encode(pwString);
let decoded = base64.decode(encoded);

// console.log('original pw str:', pwString);
// console.log('encoded pw string:', encoded);
// console.log('decoded pw str:', decoded);

let originalPw = 'somepw';

encrypt(originalPw, 10);

async function encrypt(pw, rounds) {
  let hashed = await bcrypt.hash(pw, rounds);
  console.log('hashed pw:', hashed);

  let valid = await bcrypt.compare(originalPw, hashed);
  console.log('correct password:', valid);

  let invalid = await bcrypt.compare('wrongpw', hashed);
  console.log('wrong password:', invalid);
}