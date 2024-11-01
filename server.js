const dotenv = require('dotenv');
const express = require('express');
const logger = require('morgan');
const path = require('path');
const router = require('./routes/index');
const { auth } = require('express-openid-connect');
const reload = require("reload");
const db = require("./routes/db");
const fs = require("fs");
const https = require("https");


const options = {
  key: fs.readFileSync('server.key'), 
  cert: fs.readFileSync('server.cert')
};

dotenv.load();

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: "https://web-lab1-w9i3.onrender.com"
};

const port = process.env.PORT || 10000;
if (!config.baseURL && !process.env.BASE_URL && process.env.PORT && process.env.NODE_ENV !== 'production') {
  config.baseURL = `http://localhost:${port}`;
}


app.use(auth(config));

// Middleware to make the `user` object available for all views
app.use(function (req, res, next) {
  res.locals.user = req.oidc.user;
  next();
});

app.use('/', router);


reload(app).then((reloadReturn) => {
    https.createServer(options, app).listen(port, "0.0.0.0", () => {
        console.log(`Listening on 0.0.0.0:${port}`);
    })
}).catch((err) => {
    console.error("Coulnd start reload", err);
})

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handlers
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: process.env.NODE_ENV !== 'production' ? err : {}
  });
});

