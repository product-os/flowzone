#!/bin/sh

# Fork PRs run with no secrets, so REPO_SECRET (from the COMPOSE_VARS secret) is empty.
# Only assert its value when it was provided (i.e. the trusted lane); skip on forks.
if [ -z "${REPO_SECRET}" ]
then
	echo "REPO_SECRET is empty (fork PR without secrets); skipping assertion"
elif [ "${REPO_SECRET}" != "topsecret" ]
then
	echo "REPO_SECRET value is incorrect"
	exit 1
fi
