#!/bin/bash

# USER CREATION
echo -e "\n> Create New User:"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/users/ -H "Content-Type: application/json" -d '{
	"first_name": "Hugo",
	"last_name": "Chilemme",
	"email": "hugo.chilemme@example.com",
	"password": "ABCD1234"
}')
export USER="$(echo "$RESPONSE" | jq -r '.id')"
echo "User ID: $USER"

# USER TOKEN
echo -e "\n> Create Token:"
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/auth/login -H "Content-Type: application/json" -d '{
	"email": "hugo.chilemme@example.com",
	"password": "ABCD1234"
}')
export JWT="$(echo "$RESPONSE" | jq -r '.access_token')"
echo "Access Token: $JWT"

# USER RETRIEVAL
echo -e "\n> Get User Details:"
curl -X GET http://localhost:5000/api/v1/users/$USER

# USER UPDATE
echo -e "\n> Update User:"
curl -X PUT http://localhost:5000/api/v1/users/$USER -H "Content-Type: application/json" -H "Authorization: Bearer $JWT" -d '{"first_name": "Fabien", "last_name": "Chavonet", "email": "hugo.chilemme@example.com", "password": "ABCD1234"}'

# USER RETRIEVAL
echo -e "\n> Get New User Details:"
curl -X GET http://localhost:5000/api/v1/users/$USER
