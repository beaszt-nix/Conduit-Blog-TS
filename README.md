# Conduit-Blog TS

This project implements a clone of Medium, using the [GoThinkster Realworld API Specification](https://github.com/gothinkster/realworld/tree/master/spec)

# Setup

To quickly deploy a database for testing, this sets up a postgresDB with the credentials given in .env file
`sudo docker-compose docker-compose.yaml -d`

To use another postgresDB, without the docker instance, change the fields in .env file

# Start

`yarn start:dev`

The defaults in make will start server at http://localhost:4000/api/

# Test

This project uses newman to implement end to end testing, this is also provided from the RealWorld API Spec

`./run-api-tests.sh`
