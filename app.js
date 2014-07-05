var express = require('express'),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy;

// Tmp - authenticate against single hard coded user
function authenticate(username, password, done) {
  if(!username) {
    done(null, false);
  } else if(username === 'user' && password === 'password') {
    done(null, { username: 'user' });
  } else {
    done(null, null);
  }
}

var app = express();

app.set('port', process.env.PORT || 3000);

app.use(express.logger('dev'));
app.use(express.json());
app.use(passport.initialize());
app.use(app.router);
app.use(express.errorHandler());

passport.use(new BasicStrategy({}, authenticate));

// curl -i --user user:password localhost:3000
app.get('/',
  passport.authenticate('basic', { session: false }),
  function(req, res) {
   res.json(req.user);
  });


http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
