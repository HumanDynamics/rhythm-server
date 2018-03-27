#! /bin/bash

# Default paths to the rhythm working directories
RHYTHM_SERVER_PATH=~/Projects/riff/rhythm-server
RHYTHM_MONGO_DATA_PATH=~/Projects/riff/rhythm-server/data
DOCKER_ENGINE_IP=127.0.0.1

# include .rhythmdevrc if it exists to redefine the variables w/ values of locations of
# working directories for any components
if [ -f "$HOME/.rhythmdevrc" ]
then
    . "$HOME/.rhythmdevrc"
fi

function echosyntax() {
    echo ''
	echo 'testenv.sh provides an interface to create and use the containers needed to run the rhythm system locally.'
	echo 'The containers are:'
	echo '  rhythm-mongo-server: The mongo instance where the rhythm data is stored'
	echo '  rhythm-server:       The rhythm server instance'
    echo ''
	echo "If the file $HOME/.rhythmdevrc exists it will be sourced, allowing local paths to the working directories to be specified."
    echo ''
    echo 'usage:'
	echo 'build the docker rhythm image(s):            testenv.sh make-images'
    echo 'run the needed docker containers:            testenv.sh initial-start'
    echo 'start the docker containers:                 testenv.sh start'
    echo 'stop the docker containers:                  testenv.sh stop'
    echo 'remove the docker containers:                testenv.sh remove-containers'
    echo 'create the docker rhythm bridge network:     testenv.sh create-network'
    echo 'this help:                                   testenv.sh --help'
}

if [ $# -ne 1 ]
then
    echo 'Wrong number of arguments'
    echosyntax
    exit 1
fi

case $1 in
    make-images)
		# Create the docker images
		docker build -t local/rhythm-server docker/rhythm-server
		# docker build -t local/rhythm-rtc docker/rhythm-rtc
		;;
    initial-start)
		# run the webserver for accessing the testpage at localhost/tests/integration/testpage-divs.html
		#docker run -d -p ${DOCKER_ENGINE_IP}:80:80 -v ${BRIXCLIENT_PATH}:/usr/share/nginx/html:ro --name brixclient nginx

        # run the rhythm mongo server
		[ -d ${RHYTHM_MONGO_DATA_PATH} ] || mkdir ${RHYTHM_MONGO_DATA_PATH}
		docker run -d --net rhythm -p ${DOCKER_ENGINE_IP}:27017:27017 -v ${RHYTHM_MONGO_DATA_PATH}:/data/db --name rhythm-mongo-server mongo

		# run the rhythm-server
		docker run -d --net rhythm -p ${DOCKER_ENGINE_IP}:3000:3000 -v ${RHYTHM_SERVER_PATH}:/app -w /app --name rhythm-server local/rhythm-server
		;;
    start)
		# start the containers once they've been created using initial-start
		docker start rhythm-mongo-server rhythm-server
		;;
    stop)
		# stop the running containers
		docker stop rhythm-server rhythm-mongo-server
		;;
    remove-containers)
		# remove the containers requiring that they be restarted using initial-start
		docker rm rhythm-server rhythm-mongo-server
		;;

	create-network)
		# create a bridge network for the various rhythm servers
		docker network create --driver bridge rhythm
		;;
    --help)
		# show help
		echosyntax
		;;
esac
