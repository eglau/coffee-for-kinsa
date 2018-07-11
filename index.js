const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const readline = require('readline');
const fs = require('fs');
const rl = readline.createInterface({
    input: fs.createReadStream('locations.csv')
});

const axios = require('axios');

const GAPI_KEY = require('./config.json').GAPI_KEY;

// Simple validation check for non-empty strings
const isValidString = (str) => {
    return (typeof str === 'string' && str.length > 0);
}

// Simple validation check for latitude numbers
const isValidLatitude = (lat) => {
    if (isNaN(lat)) {
        return false;
    } else {
        lat = parseFloat(lat);
        return (lat >= -90 && lat <= 90);
    }
};

// Simple validation check for longitude numbers
const isValidLongitude = (lon) => {
    if (isNaN(lon)) {
        return false;
    } else {
        lon = parseFloat(lon);
        return (lon >= -180 && lon <= 180);
    }
}

// Calculate distance between two lat/lon points using Haversine formula
// Credit: https://stackoverflow.com/a/1502821
const rad = (x) => {
    return x * Math.PI / 180; 
}
const calculateDistance = (x1, y1, x2, y2) => {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = rad(x2 - x1);
    var dLong = rad(y2 - y1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(x1)) * Math.cos(rad(x2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; // returns the distance in meter
}

// Accepts name, address, latitude, and longitude, adds a new coffee shop to the data set, and returns the id of the new coffee shop.
app.post('/create', (req, res) => {
    if (!isValidString(req.body.name)) {
        res.status(400).send({ error: 'invalid value given for Name' });
    } else if (!isValidString(req.body.address)) {
        res.status(400).send({ error: 'invalid value given for Address' });
    } else if (!isValidLatitude(req.body.latitude)) {
        res.status(400).send({ error: 'invalid value given for Latitude' });
    } else if (!isValidLongitude(req.body.longitude)) {
        res.status(400).send({ error: 'invalid value given for Longitude' });
    } else {
        locations[locations.nextID] = {
            name: req.body.name,
            address: req.body.address,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
        }
        locations.nextID++;
        res.send({ created: locations.nextID - 1 });
    }
});

// Accepts an id and returns the id, name, address, latitude, and longitude of the coffee shop with that id, or an appropriate error if it is not found.
app.get('/read', (req, res) => {
    const id = req.query.id;
    if (!id || !locations[id]) {
        res.status(404).send({ error: 'invalid/missing id' });
    } else {
        res.send(locations[id]);
    }
});

// Accepts an id and new values for the name, address, latitude, or longitude fields, updates the coffee shop with that id, or returns an appropriate error if it is not found.
app.put('/update', (req, res) => {
    const id = req.query.id;
    if (!id || !locations[id]) {
        res.status(404).send({ error: 'invalid/missing id' });
    } else {
        const updated = req.body;
        if (updated.name !== undefined && !isValidString(updated.name)) {
            res.status(400).send({ error: 'invalid value given for Name' });
        } else if (updated.address !== undefined && !isValidString(updated.address)) {
            res.status(400).send({ error: 'invalid value given for Address' });
        } else if (updated.latitude !== undefined && !isValidLatitude(updated.latitude)) {
            res.status(400).send({ error: 'invalid value given for Latitude' });
        } else if (updated.longitude !== undefined && !isValidLongitude(updated.longitude)) {
            res.status(400).send({ error: 'invalid value given for Longitude' });
        } else {
            locations[id].name = updated.name || locations[id].name;
            locations[id].address = updated.address || locations[id].address;
            locations[id].latitude = (updated.latitude !== undefined) ? parseFloat(updated.latitude) : locations[id].latitude;
            locations[id].longitude = (updated.longitude !== undefined) ? parseFloat(updated.longitude) : locations[id].longitude;
            res.send({ status: 'updated' });
        }
    }
});

// Accepts an id and deletes the coffee shop with that id, or returns an error if it is not found
app.delete('/delete', (req, res) => {
    const id = req.query.id;
    if (!id || !locations[id]) {
        res.status(404).send({ error: 'invalid/missing id' });
    } else {
        delete locations[id];
        res.send({ status: 'deleted' });
    }
});

// Accepts an address and returns the closest coffee shop by straight line distance.
app.get('/nearest', (req, res) => {
    const address = req.query.address;
    axios.get(`https://maps.googleapis.com/maps/api/geocode/json?key=${GAPI_KEY}&address=${address}`).then((response) => {
        const coords = response.data.results[0].geometry.location;

        let shortest = {
            id: null,
            distance: null
        };
        const locs = Object.keys(locations);
        locs.map((id) => {
            if (id !== 'nextID') {
                const loc = locations[id];
                let distance = calculateDistance(coords.lat, coords.lng, loc.latitude, loc.longitude);
                if (!shortest.id || distance < shortest.distance) {
                    shortest.id = id;
                    shortest.distance = distance;
                }
            }
        });
        res.send(locations[shortest.id]);
    }).catch(() => {
        res.status(500).send({ error: `could not get nearest coffee shop for location: ${address}` });
    });
});

// 404 for all other routes
app.all('*', (req, res) => {
    res.status(404).send({ error: 'invalid route' });
});


// Load locations from csv into memory
const locations = {
    nextID: 1
};
rl.on('line', (line) => {
    shop = line.split(', ');
    let id = parseInt(shop[0]);
    locations[id] = {
        name: shop[1],
        address: shop[2],
        latitude: parseFloat(shop[3]),
        longitude: parseFloat(shop[4])
    };
    locations.nextID = (id >= locations.nextID) ? id + 1 : locations.nextID;
});
rl.on('close', () => {
    app.listen(3000, () => {
        console.log('Listening for requests...');
    });
});


// Exports for testing
module.exports = app;