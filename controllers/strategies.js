const secrets = require('../config/secrets');
const LocalStrategy = require('passport-local').Strategy;
const CoinbaseStrategy = require('passport-coinbase').Strategy;
// const VenmoStrategy = require('passport-venmo').Strategy;

//Function which accepts a passport and then allows it to use different strategies
const configure = (passport) => {
  //Local Strategy only returns username which is actually the email
  passport.use(new LocalStrategy(
    {
      usernameField: 'email'
    },
    (username, password, done) => done(null, username))
  );

  // scope options: https://developers.coinbase.com/docs/wallet/permissions
  // Coinbase Strategy uses the access token, and allows users to create checkouts, refund orders, and allows us access
  // To their profile and wallet
  passport.use(new CoinbaseStrategy({
    clientID: secrets.coinbaseClient,
    clientSecret: secrets.coinbaseSecret,
    callbackURL: 'http://localhost:9009/auth/login/coinbase/callback',
    scope: ['user', 'wallet:accounts:read', 'wallet:orders:refund', 'wallet:checkouts:create']
  },
   (accessToken, refreshToken, profile, done) => done(null, { profile, accessToken, refreshToken }))
  );
  // Was planning on using venmo but escrowing us $ requires a special license
 // passport.use(new VenmoStrategy({
  //   clientID:
  //   clientSecret:
  //   callbackURL:
  //   },
  //   (accessToken, refreshToken, profile, done) => {
  //     return done(null, { profile, accessToken, refreshToken });
  //   })
  // );
};

module.exports = configure;
