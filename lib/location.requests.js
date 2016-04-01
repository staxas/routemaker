var MapboxClient = require('mapbox');
var client = new MapboxClient('pk.eyJ1Ijoid3N0YW04OCIsImEiOiJjaWxjOGhobTgwMDZpd3FtMjdtMzg4djJ1In0.HwVJ-OUfE-7_ISGkFI08Gg');

var Boom = require('boom');

module.exports.getShortestRoute = function(request, reply) {
  var q = request.query;
  var pay = request.payload;
  var location = [];
  var locations = [];
  var placeIndexes = [];
  var travelMethod = 'driving';
  var fixedOriginIndex;
  var fixedDestinationIndex;
  if (pay.mapBoxClient) {
    client = new MapBoxClient(q.mapBoxClient);
  }
  if (pay.locations) {
    for (var i = 0; i < pay.locations.length; i++) {
      if (pay.locations[i].hasOwnProperty('lat') && pay.locations[i].hasOwnProperty('lng')) {
        location = [];
        location.push(pay.locations[i].lng);
        location.push(pay.locations[i].lat);
        locations.push(location);
        placeIndexes.push(i);
      }
    }
    if (q.fixedOrigin == 'true' && placeIndexes.length > 0) {
      fixedOriginIndex = placeIndexes.shift();
    }
    if (q.fixedDestination == 'true' && placeIndexes.length > 0) {
      fixedDestinationIndex = placeIndexes.pop();
    }

    if (q.travelMethod) {
      if (q.travelMethod == 'walking') {
        travelMethod = 'walking';
      } else if (q.travelMethod == 'cycling') {
        travelMethod = 'cycling';
      } else {
        travelMethod = 'driving';
      }
    }
    // get all permutations of routes (minus fixedOrigin/fixedDestination if applicable)
    var routeSets = permutator(placeIndexes);
    // get distances between all locations (a -> b, b -> c, etc) and...
    client.getDistances(locations, {
      profile: travelMethod
    }, function(err, results) {
      // ...run a callback with the results
      var durations = results.durations;
      var allRouteDistances = [];
      var allRouteTotalDistances = [];
      // iterate through all possible routes:
      for (var routeSetIndex = 0; routeSetIndex < routeSets.length; routeSetIndex++) {
        var currRouteSet = routeSets[routeSetIndex];
        // if fixed origin, add to route set to calculate
        if (typeof fixedOriginIndex == 'number') {
          currRouteSet.unshift(fixedOriginIndex);
        }
        // if fixed destination, add to route set to calculate
        if (fixedDestinationIndex) {
          currRouteSet.push(fixedDestinationIndex);
        }
        // only perform calculation if different routeSet than previous, dupes possible because of fixedOrigin/ fixedDestination
        if (currRouteSet != prevRouteSet) {
          var distanceSet = [];
          var firstPlace = 0;
          for (var secondPlace = 1; secondPlace < currRouteSet.length; secondPlace++) {
            var distance = durations[currRouteSet[firstPlace]][currRouteSet[secondPlace]];
            distanceSet.push(distance);
            firstPlace = secondPlace;
          }
          allRouteDistances.push(distanceSet);
          allRouteTotalDistances.push(distanceSet.reduce(function(a, b) {
            return a + b;
          }));
        } // end if (currRouteSet != prevRouteSet)
        var prevRouteSet = currRouteSet;
      }

      var fastestRouteIndex = getMinIndex(allRouteTotalDistances);
      // var fastestRoute = routeSets[fastestRouteIndex];
      // console.log(allRouteDistances[fastestRouteIndex]);
      // console.log(allRouteTotalDistances[fastestRouteIndex]);
      var replyData = {};
      var fastestRouteCoordinates = []
      var routeLocation = {};
      for(var i = 0; i < routeSets[fastestRouteIndex].length; i ++) {
        routeLocation = {};
        routeLocation.lat = locations[routeSets[fastestRouteIndex][i]][1];
        routeLocation.lng = locations[routeSets[fastestRouteIndex][i]][0];
        fastestRouteCoordinates.push(routeLocation);
      }
      replyData.fastestRouteCoordinates = fastestRouteCoordinates;
      replyData.fastestRouteIndexes = routeSets[fastestRouteIndex];
      replyData.routeDistances = allRouteDistances[fastestRouteIndex];
      replyData.routeTotalDistance = allRouteTotalDistances[fastestRouteIndex]
      return reply(replyData);
      // var fastestRouteLocations = [];
      // for (var i = 0; i < routeSets[fastestRouteIndex].length; i++) {
      //   fastestRouteLocations.push(data[fastestRoute[i]]);
      // }
      // console.log(fastestRouteLocations);
    });


  } else {
    return reply(Boom.badRequest('not enough data'));
  }
}

function permutator(inputArr) {
  var results = [];

  function permute(arr, memo) {
    var cur, memo = memo || [];

    for (var i = 0; i < arr.length; i++) {
      cur = arr.splice(i, 1);
      if (arr.length === 0) {
        results.push(memo.concat(cur));
      }
      permute(arr.slice(), memo.concat(cur));
      arr.splice(i, 0, cur[0]);
    }

    return results;
  }

  return permute(inputArr);
}

function getMinIndex(arr) {
  var min = arr[0];
  var minIndex = 0;
  for (var i = 1; i < arr.length; i++) {
    if (arr[i] < min) {
      minIndex = i;
      min = arr[i];
    }
  }
  return minIndex;
}
