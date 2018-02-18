# OAuth Proxy

## Local Setup
- `$ git clone https://github.com/rveitch/oauth-proxy.git`
- `$ npm install`
- Copy `template.env.txt` and rename it to `.env`
- Add your local environment variable keys to the `.env` file and save it.
- Run `$ npm start` or `$ node app` to initialize the app.
- Visit http://localhost:3000 in your browser.

## Local Development & Testing
- Setup a dnsmasq for https://proxy.coschedule.test
  - dnsmasq.conf: `address=/proxy.coschedule.test/127.0.0.1`
- Create a resolver configuration at `/etc/resolver/proxy.coschedule.test`
  - Settings: `nameserver 127.0.0.1`

#### Reference
- https://passingcuriosity.com/2013/dnsmasq-dev-osx/
- http://harold.internal.org/using-dnsmasq-on-osx-sierra-for-local-dev-domain-wildcards/