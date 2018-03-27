#! /bin/bash

#NODE_VERSION=5.6
NODE_VERSION=5.4.0

# Default path to the rhythm server directory
RHYTHM_SERVER_PATH=~/Projects/riff/rhythm-server/
RHYTHM_MONGO_DATA_PATH=~/Projects/riff/rhythm-server/data/
DOCKER_ENGINE_IP=127.0.0.1

# include .rhythmdevrc if it exists to redefine the variables w/ values of locations of
# working directories for any components
if [ -f "$HOME/.rhythmdevrc" ]
then
    . "$HOME/.riffdevrc"
fi


# It attaches to my rhythm-server repo working directory so whatever I have there is what will run
#docker run -d --net rhythm -p ${DOCKER_ENGINE_IP}:27017:27017 -v ${RHYTHM_MONGO_DATA_PATH}:/data/db --name rhythm-mongo-server mongo
docker start rhythm-mongo-server
docker run --rm -it --net rhythm -p ${DOCKER_ENGINE_IP}:3000:3000 -v ${RHYTHM_SERVER_PATH}:/app -w /app --name rs-shell local/rhythm-server bash
