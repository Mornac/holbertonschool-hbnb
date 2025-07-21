#!/bin/bash

# ADMIN TOKEN
echo -e "\n> Create Admin Token:"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/auth/login -H "Content-Type: application/json" -d '{
	"email": "admin@hbnb.io",
	"password": "admin1234"
}')
export JWT_ADMIN="$(echo "$RESPONSE" | jq -r '.access_token')"
echo "Access Token: $JWT_ADMIN"

# AMENITY CREATION
echo -e "\n> Create New Amenity:"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/amenities/ -H "Content-Type: application/json" -H "Authorization: Bearer $JWT_ADMIN" -d '{"name": "Wi-Fi"}')
export AMENITY="$(echo "$RESPONSE" | jq -r '.id')"
echo "Amenity ID: $AMENITY"

# AMENITY RETRIEVAL
echo -e "\n> Get Amenity Details:"
curl -X GET http://localhost:5000/api/v1/amenities/$AMENITY

# AMENITY UPDATE
echo -e "\n> Update Amenity:"
curl -X PUT http://localhost:5000/api/v1/amenities/$AMENITY -H "Content-Type: application/json" -H "Authorization: Bearer $JWT_ADMIN" -d '{"name": "WIFI"}'

# AMENITY RETRIEVAL
echo -e "\n> Get New Amenity Details:"
curl -X GET http://localhost:5000/api/v1/amenities/$AMENITY
