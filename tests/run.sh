#!/bin/bash

# TODO: use the env var to connect to the redis instance to 
# test that the var is present and that the compose instance 
# was instantiated correctly
if [[ -z "${REPO_SECRET}" ]]; then
	echo "REPO_SECRET is not set"
	exit 1
else
	echo "value ${REPO_SECRET} found"
	exit 0
fi