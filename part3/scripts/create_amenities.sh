#!/bin/bash

# ADMIN TOKEN
echo -e "\n> Create Token:"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/auth/login -H "Content-Type: application/json" -d '{
	"email": "admin@hbnb.io",
	"password": "admin1234"
}')
export JWT="$(echo "$RESPONSE" | jq -r '.access_token')"
echo "Access Token: $JWT"

# AMENITIES CREATION
echo -e "\n> Create New Amenities:"
curl -X POST http://localhost:5000/api/v1/amenities/ -H "Content-Type: application/json" -H "Authorization: Bearer $JWT" -d '{"name": "TV"}'
curl -X POST http://localhost:5000/api/v1/amenities/ -H "Content-Type: application/json" -H "Authorization: Bearer $JWT" -d '{"name": "Parking"}'
