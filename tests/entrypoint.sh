#!/bin/sh

if [ "${REPO_SECRET}" != "topsecret" ]
then
	echo "REPO_SECRET value is incorrect"
	exit 1
fi

sysbench --test=cpu --cpu-max-prime=20000 run
sysbench --test=memory run
sysbench --test=fileio --file-test-mode=seqwr run
