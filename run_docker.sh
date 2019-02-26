#!/bin/bash

# bash wrappers for docker run commands
# should work on linux, perhaps on OSX


#
# Environment vars
#


# # useful for connecting GUI to container
# SOCK=/tmp/.X11-unix
# XAUTH=/tmp/.docker.xauth
# xauth nlist $DISPLAY | sed -e 's/^..../ffff/' | xauth -f $XAUTH nmerge -
# chmod 755 $XAUTH

#
# Helper Functions
#
dcleanup(){
	local containers
	mapfile -t containers < <(docker ps -aq 2>/dev/null)
	docker rm "${containers[@]}" 2>/dev/null
	local volumes
	mapfile -t volumes < <(docker ps --filter status=exited -q 2>/dev/null)
	docker rm -v "${volumes[@]}" 2>/dev/null
	local images
	mapfile -t images < <(docker images --filter dangling=true -q 2>/dev/null)
	docker rmi "${images[@]}" 2>/dev/null
}
del_stopped(){
	local name=$1
	local state
	state=$(docker inspect --format "{{.State.Running}}" "$name" 2>/dev/null)

	if [[ "$state" == "false" ]]; then
		docker rm "$name"
	fi
}
relies_on(){
	for container in "$@"; do
		local state
		state=$(docker inspect --format "{{.State.Running}}" "$container" 2>/dev/null)

		if [[ "$state" == "false" ]] || [[ "$state" == "" ]]; then
			echo "$container is not running, starting it for you."
			$container
		fi
	done
}

relies_on_network(){
    for network in "$@"; do
        local state
        state=$(docker network inspect --format "{{.Created}}" "$network" 2>/dev/null)

        if [[ "$state" == "false" ]] || [[ "$state" == "" ]]; then
            echo "$network is not up, starting it for you."
            $network
        fi
    done
}

postgres_nw(){
    # create the network for communicating
    docker network create --driver bridge postgres_nw
}

postgres(){
    relies_on_network postgres_nw

    docker run -d --rm \
           -v /etc/localtime:/etc/localtime:ro \
           --network=postgres_nw \
           --name postgres \
           postgres:alpine

}

postgres_test_setup(){
    relies_on postgres
    sleep 1
    docker exec postgres psql -h postgres -U postgres -c "CREATE USER testu WITH LOGIN CREATEDB PASSWORD 'my secret password';"
    docker exec postgres psql -c 'create database atestdb;' -U testu -d postgres
    docker exec postgres mkdir /var/log/logdb2
    docker exec postgres mkdir /second
    docker exec postgres chown -R postgres /second
    docker exec postgres chown -R postgres /var/log/logdb2
    docker exec postgres su-exec postgres initdb -D /second
    sleep 1
    docker exec postgres sh -c "echo 'host all all all trust' >> /second/pg_hba.conf"
    docker exec postgres su-exec postgres pg_ctl -w -D /second -o "-p 5434" -l /var/log/logdb2/log start
    docker exec postgres psql -p 5434 -U postgres -c "CREATE USER testu WITH LOGIN CREATEDB PASSWORD 'my secret password';"
    docker exec postgres psql -p 5434 -c 'create database atestdb;' -U testu -d postgres

    echo "{\"postgresql\":{\"host\":\"postgres\",\"port\":5432,\"username\":\"testu\",\"db\":\"atestdb\"}}" > test.config.json && chmod 0600 test.config.json


}



psql_pooler_test(){
    del_stopped "psql_pooler"
    docker run --rm -it -v ${PWD}:/usr/src/dev  -w /usr/src/dev --network=postgres_nw --name psql_pooler jmarca/psql_pooler sh
}
