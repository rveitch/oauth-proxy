/* eslint-disable new-cap, no-console, arrow-body-style, prefer-destructuring */
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const path = require('path');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const request = require('request');
const _ = require('lodash');

dotenv.load();
const rootUrl = process.env.ROOT_URL || 'http://localhost';
const port = Number(process.env.PORT || 3000);
const subdomainOffset = process.env.SUBDOMAIN_OFFSET || 2; // Express default is 2, but 3 may be needed.

/* ****************************** EXPRESS SETUP ***************************** */

const app = express();
app.set('json spaces', 2);
app.set('subdomain offset', subdomainOffset);
app.use(cors());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.enable('trust proxy');

/* ****************************** MIDDLEWARE **************************** */

function validateSubdomain(req, res, next) {
  const subdomains = req.subdomains;
  if (!subdomains.length) {
    return res.status(401).json({ error: 'No subdomain in request url.' });
  }

  // Parse and validate the subdomain
  const subdomain = req.subdomains[0];
  const subdomainIsNumber = (_.toInteger(subdomain) !== 0) && _.isInteger(_.toInteger(subdomain));
  const subdomainIsString = _.isString(subdomain);
  if (!subdomainIsNumber && !subdomainIsString) {
    return res.status(401).json({ error: 'Unknown or unsupported subdomain format.' });
  }

  // Build the request url //
  const reviewAppUrl = `https://coschedule-staging-pr-${subdomain}.herokuapp.com`;
  const ngrokUrl = `http://${subdomain}.api.coschedule.ngrok.io`;
  const proxyBaseAddress = (subdomainIsNumber) ? reviewAppUrl : ngrokUrl;
  const urlPath = req.params[0] || '';
  const proxyUrl = `${proxyBaseAddress}${urlPath}`;

  req.proxyUrl = proxyUrl;
  return next();
}

/* ****************************** EXPRESS ROUTES **************************** */

app.all('*', validateSubdomain, (req, res) => {
  const requestParams = {
    uri: req.proxyUrl,
    method: req.method,
    qs: req.query,
  };

  if (!_.isEmpty(req.body)) {
    requestParams.body = req.body;
  }

  if (process.env.TEST_MODE) {
    return res.json(requestParams);
  }

  return request(requestParams).pipe(res);
});

/* ******************************* SERVER LISTEN **************************** */

// Server Listen
app.listen(port, () => {
  console.log(`\nApp server is running on ${rootUrl}:${port}\n`);
});
