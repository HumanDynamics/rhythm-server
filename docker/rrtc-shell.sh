#! /bin/bash

# Default path to the rhythm server directory
RHYTHM_RTC_PATH=~/Projects/riff/rhythm-rtc
RHYTHM_MONGO_DATA_PATH=~/Projects/riff/rhythm-server/data
DOCKER_ENGINE_IP=127.0.0.1

# include .rhythmdevrc if it exists to redefine the variables w/ values of locations of
# working directories for any components
if [ -f "$HOME/.rhythmdevrc" ]
then
    . "$HOME/.rhythmdevrc"
fi


# It attaches to my rhythm-rtc repo working directory so whatever I have there is what will run
docker run --rm -it --net rhythm -p ${DOCKER_ENGINE_IP}:3001:3001 -v ${RHYTHM_RTC_PATH}:/app --name rrtc-shell local/rhythm-rtc bash
