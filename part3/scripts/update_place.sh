#!/bin/bash

# ADMIN TOKEN
echo -e "\n> Create Admin Token:"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/auth/login -H "Content-Type: application/json" -d '{
	"email": "admin@hbnb.io",
	"password": "admin1234"
}')
export JWT_ADMIN="$(echo "$RESPONSE" | jq -r '.access_token')"
echo "Access Token: $JWT_ADMIN"

# AMENITIES CREATION
echo -e "\n> Create New Amenities:"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/amenities/ -H "Content-Type: application/json" -H "Authorization: Bearer $JWT" -d '{"name": "Pool"}')
export AMENITY_1="$(echo "$RESPONSE" | jq -r '.id')"
echo "Amenity ID: $AMENITY_1"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/amenities/ -H "Content-Type: application/json" -H "Authorization: Bearer $JWT" -d '{"name": "Garden"}')
export AMENITY_2="$(echo "$RESPONSE" | jq -r '.id')"
echo "Amenity ID: $AMENITY_2"

# OWNER CREATION
echo -e "\n> Create New User:"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/users/ -H "Content-Type: application/json" -d '{
	"first_name": "John",
	"last_name": "Doe",
	"email": "john.doe@example.com",
	"password": "ABCD1234"
}')
export OWNER="$(echo "$RESPONSE" | jq -r '.id')"
echo "User ID: $OWNER"

# OWNER TOKEN
echo -e "\n> Create Token:"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/auth/login -H "Content-Type: application/json" -d '{
	"email": "john.doe@example.com",
	"password": "ABCD1234"
}')
export JWT="$(echo "$RESPONSE" | jq -r '.access_token')"
echo "Access Token: $JWT"

# PLACE CREATION
echo -e "\n> Create New Place:"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/places/ -H "Content-Type: application/json" -H "Authorization: Bearer $JWT" -d '{"title": "Californian Apartment", "description": "Beautiful place with a view on the beach.", "price": 550.0, "latitude": 65.5, "longitude": -172.5, "owner_id": "'"$OWNER"'", "rooms": 6, "capacity": 8, "surface": 85.5, "amenities": [{"id": "'"$AMENITY_1"'"}]}')
export PLACE="$(echo "$RESPONSE" | jq -r '.id')"
echo "Place ID: $PLACE"

# PLACE RETRIEVAL
echo -e "\n> Get Place Details:"
curl -X GET http://localhost:5000/api/v1/places/$PLACE

# PLACE UPDATE
echo -e "\n> Update Place:"
curl -X PUT http://localhost:5000/api/v1/places/$PLACE -H "Content-Type: application/json" -H "Authorization: Bearer $JWT" -d '{"title": "Los Angeles Loft", "description": "Beautiful place with a view on the beach.", "price": 850.0, "latitude": 65.5, "longitude": -172.5, "owner_id": "'"$OWNER"'", "rooms": 6, "capacity": 8, "surface": 185.5, "amenities": [{"id": "'"$AMENITY_2"'"}]}'

# PLACE RETRIEVAL
echo -e "\n> Get New Place Details:"
curl -X GET http://localhost:5000/api/v1/places/$PLACE
