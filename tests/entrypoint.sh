#!/bin/sh

if [ "${REPO_SECRET}" != "topsecret" ]
then
	echo "REPO_SECRET value is incorrect"
	exit 1
fi
