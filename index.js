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

app.get('/all', (req, res) => {
    res.send(locations);
});

const isValidString = (str) => {
    return (typeof str === 'string' && str.length > 0);
}

const isValidLatitude = (lat) => {
    if (isNaN(lat)) {
        return false;
    } else {
        lat = parseFloat(lat);
        return (lat >= -90 && lat <= 90);
    }
};

const isValidLongitude = (lon) => {
    if (isNaN(lon)) {
        return false;
    } else {
        lon = parseFloat(lon);
        return (lon >= -180 && lon <= 180);
    }
}


// Accepts name, address, latitude, and longitude, adds a new coffee shop to the data set, and returns the id of the new coffee shop.
app.post('/create', (req, res) => {
    if (!isValidString(req.body.name)) {
        res.send({ error: 'invalid value given for Name' });
    } else if (!isValidString(req.body.address)) {
        res.send({ error: 'invalid value given for Address' });
    } else if (!isValidLatitude(req.body.latitude)) {
        res.send({ error: 'invalid value given for Latitude' });
    } else if (!isValidLongitude(req.body.longitude)) {
        res.send({ error: 'invalid value given for Longitude' });
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
app.post('/update', (req, res) => {
    const id = req.query.id;
    if (!id || !locations[id]) {
        res.status(404).send({ error: 'invalid/missing id' });
    } else {
        const updated = req.body;
        if (updated.name !== undefined && !isValidString(updated.name)) {
            res.status(400).send({ error: 'invalid value given for Name' });
        } else if (updated.address !== undefined && !isValidString(updated.address)) {
            res.status(400).send({ error: 'invalid value given for Address' });
        } else if (updated.latitude && !isValidLatitude(updated.latitude)) {
            res.status(400).send({ error: 'invalid value given for Latitude' });
        } else if (updated.longitude && !isValidLongitude(updated.longitude)) {
            res.status(400).send({ error: 'invalid value given for Longitude' });
        } else {
            locations[id].name = updated.name || locations[id].name;
            locations[id].address = updated.address || locations[id].address;
            locations[id].latitude = updated.latitude || locations[id].latitude;
            locations[id].longitude = updated.longitude || locations[id].longitude;
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
    res.sendStatus(501);
});

// 404 for all other routes
app.get('*', (req, res) => {
    res.status(404).send({ error: 'invalid route' });
});


// Load locations into memory
const locations = {
    nextID: 1
};
rl.on('line', (line) => {
    shop = line.split(', ');
    let id = parseInt(shop[0]);
    locations[id] = {
        name: shop[1],
        address: shop[2],
        latitude: shop[3],
        longitude: shop[4]
    };
    locations.nextID = (id >= locations.nextID) ? id + 1 : locations.nextID;
});
rl.on('close', () => {
    app.listen(3000, () => {
        'Listening for requests...'
    });
});


// Exports for testing
module.exports = app;