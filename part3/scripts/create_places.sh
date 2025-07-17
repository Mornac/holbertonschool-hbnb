#!/bin/bash

# USER CREATION
echo -e "\n> Create New User:"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/users/ -H "Content-Type: application/json" -d '{
	"first_name": "Janet",
	"last_name": "Doe",
	"email": "janet.doe@example.com",
	"password": "abcd1234"
}')
export OWNER="$(echo "$RESPONSE" | jq -r '.id')"
echo "User ID: $OWNER"

# USER TOKEN
echo -e "\n> Create Token:"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/auth/login -H "Content-Type: application/json" -d '{
	"email": "janet.doe@example.com",
	"password": "abcd1234"
}')
export JWT="$(echo "$RESPONSE" | jq -r '.access_token')"
echo "Access Token: $JWT"

# PLACE CREATION
echo -e "\n> Create New Places:"
curl -X POST http://localhost:5000/api/v1/places/ -H "Content-Type: application/json" -H "Authorization: Bearer $JWT" -d '{"title": "Californian Apartment", "description": "Beautiful place with a view on the beach.", "price": 550.0, "latitude": 65.5, "longitude": -172.5, "owner_id": "'"$OWNER"'", "rooms": 6, "capacity": 8, "surface": 85.5, "amenities": []}'
curl -X POST http://localhost:5000/api/v1/places/ -H "Content-Type: application/json" -H "Authorization: Bearer $JWT" -d '{"title": "Nice French Apartment", "description": "Cozy apartment in the center of Toulouse", "price": 225.0, "latitude": 85, "longitude": 125, "owner_id": "'"$OWNER"'", "rooms": 3, "capacity": 4, "surface": 55.5, "amenities": []}'
