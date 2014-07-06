var express = require('express'),
    https = require('https'),
    path = require('path'),
    fs = require('fs');

var Store = require('jfs'),
    colors = require('colors'),
    passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    ConnectRoles = require('connect-roles');

var db = new Store('data/users.json', { pretty: true }),
    user = new ConnectRoles();

db.saveSync('joe', { id: 'joe', password: 'joepw', actions: ['get a', 'get b'] });
db.saveSync('bob', { id: 'bob', password: 'bobpw', actions: ['get b'] });

// Authenticate
function authenticate(username, password, done) {
  db.get(username, function(err, user) {
    var msg = 'Authenticating ' +  username + ' with password';

    if(!user) {
      console.log(msg + ' ✘ - no such user'.red);
      done(null, false);
    } else if(user.password !== password) {
      console.log(msg + ' ✘ - bad password'.red);
      done(null, null);
    } else {
      console.log(msg + ' - ✔'.green);
      delete user.password;
      done(null, user);
    }
  });
}

// Authorise
user.use(function(req, action) {
  var ok = req.user.actions.indexOf(action) >= 0,
      msg = ok ? '✔'.green : '✘'.red;

  console.log('Is %s authorised to %s? - %s', req.user.id, action, msg);
  return ok;
});

var options = {
  key: fs.readFileSync("ssl/server.key"),
  cert: fs.readFileSync("ssl/server.crt"),
  ca: fs.readFileSync("ssl/ca.crt"),
  requestCert: true,
  rejectUnauthorized: true
};


var app = express();

app.set('port', process.env.PORT || 3443);

app.use(express.logger('dev'));
app.use(express.json());
app.use(passport.initialize());
app.use(user.middleware());
app.use(app.router);
app.use(express.errorHandler());

passport.use(new BasicStrategy({}, authenticate));

// curl -ki --user user:password https://localhost:3443/a
// url -ki --key ssl/client.key --cert ssl/client.crt https://localhost:3443/b
app.get('/a',
  passport.authenticate('basic', { session: false }),
  user.can('get a'),
  function(req, res) {
   res.json(req.user);
  });

// curl does not work with PKI authentication, though browser and wget work as expected
// curl -i --user user:password localhost:3000/b
// wget -q -O - --no-check-certificate --certificate=ssl/client.crt --private-key=ssl/client.key --ca-directory=ssl https://localhost:3443/b
app.get('/b',
  passport.authenticate('basic', { session: false }),
  // user.can('get b'),
  function(req, res) {
    console.log(req.connection.getPeerCertificate());
    console.log(req.client.authorizationError);
   res.json(req.user);
  });


https.createServer(options, app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
