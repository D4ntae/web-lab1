const request = require('request');

AUTH0_DOMAIN = "dev-3lxt6450sbc3gc2m.eu.auth0.com"
RESOURCE_SERVER = "http://localhost:3000/generate"
CLIENT_ID = "W1eHftLrJmmic5f9lixlofR33VEi78me"
AUTH0_CLIENT_SECRET = "4U8wvTi4K3gt8tDFd4nKAft6-YT4-33UXqyUr5JoIKYACqRKvNcrgaCiht1fzqbN"

var getAccessToken = function(callback) {
  var options = {
    method: 'POST',
    url: 'https://' + AUTH0_DOMAIN + '/oauth/token',
    headers: {
      'cache-control': 'no-cache',
      'content-type': 'application/json'
    },
    body: {
      audience: RESOURCE_SERVER,
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET
    },
    json: true
  };

  request(options, function(err, res, body) {
    if (err || res.statusCode < 200 || res.statusCode >= 300) {
      return callback(res && res.body || err);
    }

    callback(null, body.access_token);
  });
}

getAccessToken(console.log)
