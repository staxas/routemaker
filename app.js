var MapboxClient = require('mapbox');
var client = new MapboxClient('pk.eyJ1Ijoid3N0YW04OCIsImEiOiJjaWxjOGhobTgwMDZpd3FtMjdtMzg4djJ1In0.HwVJ-OUfE-7_ISGkFI08Gg');
var Hapi = require('hapi');

var Config = require('./config');

var Routes = require('./routes/routes.js');


var Server = new Hapi.Server();

Server.connection({
  host: Config.server.host,
  port: Config.server.port,
  routes: {
    cors: true
  }
});

Server.route(Routes);

// Start the server
Server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', Server.info.uri);
});
