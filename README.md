# routemaker
API for calculating the shortest route using multiple waypoints

Install dependencies with
```bash
npm install --save
```

Server and database URLs and ports: edit *config.js* accordingly.

###Endpoints and their methods

#### User endpoints

##### POST /api/route

Expects a payload containing at least a property called *locations* containing an array of objects consisting of properties *lat* and *lng* (latitude and longitude coordinates respectively).
A payload is returned containing a *fastestRouteCoordinates* property, containing the coordinate sets in order of the shortest possible route.
Also included is a *fastestRouteIndexes* property containing the indexes of the *locations*, and a *routeDistances* property containing the travel duration times in seconds between the waypoints, both in the fastest route order.
Last the property *routeTotalDistance* is included, which is the total travelling time of the complete route in seconds.

The following queries may be added to the URL:

*travelMethod*: may be either *driving*, *cycling* or *walking*. If none of these are selected, *driving* is presumed

*fixedOrigin*: if *true*, the first lat/lng set is always the start location, fastest route is calculated FROM here.

*fixedDestination*: if *true*, the last lat/lng set is always the end location, fastest route is calculated TO here.

*mapBoxClient*: a key to be used to access the [MapBox API](https://www.mapbox.com/api-documentation/#distance), this is used for calculating the distances between waypoint sets ( a -> b, b-> c, etcetera )
