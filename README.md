# Setup

## Installation and running the server
```
npm i
npm run start
```
The Google geocode API key must be placed in `config.json`. My key is not included in this repo.

## Running tests
```
npm run test
```
The tests are located in `index.spec.js`. Postman was also used for testing.

# How to use this API
| Entry Point | Parameters | Method | Description |
| --- | --- | --- | --- |
| `/read` | **id**: Integer ID of a stored shop | GET | Returns the shop info with given ID, or an error if there is no matching ID. |
| `/create` | None | POST | Stores a new shop with an automatically assigned ID. You must supply these fields:<br>**name**: Name of the new shop (string)<br>**address**: Street address of the new shop (string)<br>**latitude**: Valid latitude number of the address (float)<br>**longitude**: Valid longitude number of the address (float) |
| `/update` | **id**: Integer ID of a stored shop | PUT | Updates a stored shop with new values. You can supply any of these fields:<br>**name**: New name of the shop (string)<br>**address**: New street address of the shop (string)<br>**latitude**: New latitude number of the address (float)<br>**longitude**: New longitude number of the address (float) |
| `/delete` | **id**: Integer ID of a stored shop | DELETE | Deletes the shop with the given ID, or an error if there is no matching ID. |
| `/nearest` | **address**: Street address of your desired location | GET | Finds the nearest (in a straight line) stored shop and returns its info. If the address is invalid/non-existant, an error will be returned. |

# Examples (using CURL)

## Get shop info from an ID
```
curl localhost:3000/read?id=10

{
    "name": "Blue Bottle Coffee",
    "address": "1 Ferry Building Ste 7",
    "latitude": 37.79590475625579,
    "longitude": -122.39393759555746
}
```

## Create a new shop
```
curl -XPOST localhost:3000/create -H "Content-Type: application/json" -d '{ "name": "Cool Place", "address": "Somewhere", "latitude": 1.2345, "longitude": 6.7890 }'

{
    "created": 57
}

curl localhost:3000/read?id=57

{
    "name": "Cool Place",
    "address": "Somewhere",
    "latitude": 1.2345,
    "longitude": 6.789
}

```

## Update a stored shop
```
curl -XPUT localhost:3000/update?id=10 -H "Content-Type: application/json" -d '{ "name": "Cool Place", "address": "Somewhere", "latitude": 1.2345, "longitude": 6.7890 }'

{
    "status": "updated"
}

curl localhost:3000/read?id=10

{
    "name": "Updated Name",
    "address": "1 Ferry Building Ste 7",
    "latitude": 37.79590475625579,
    "longitude": -122.39393759555746
}
```

## Delete a stored shop
```
curl -XDELETE localhost:3000/delete?id=10

{
    "status": "deleted"
}
```

## Nearest shop from an address
```
curl localhost:3000/nearest?address=535%20Mission%20St.,%20San%20Francisco,%20CA

{
    "name": "Red Door Coffee",
    "address": "111 Minna St",
    "latitude": 37.78746242830388,
    "longitude": -122.39933341741562
}
```