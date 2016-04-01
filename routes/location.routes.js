var LocationRequests = require('../lib/location.requests');

module.exports = [{
    method: 'POST',
    path: '/api/route',
    handler: LocationRequests.getShortestRoute
}]
