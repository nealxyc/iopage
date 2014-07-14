#!/bin/bash

# This script requires you have the permission to push to the Github page repository
REMOTE_REPO=git@github.com:nealxyc/nealxyc.github.io.git
TEMP_DIR=./deploy
COMMIT_MSG=$1

if [ -d $TEMP_DIR ]; then  
    cd $TEMP_DIR
    git pull --rebase
else
	git clone $REMOTE_REPO $TEMP_DIR
	cd $TEMP_DIR
fi
cd ..
jekyll build --destination $TEMP_DIR
cd $TEMP_DIR

if [ "$COMMIT_MSG" = "" ]; then
	COMMIT_MSG="Auto commit by $0"
fi
git add --all .
git commit -m "$COMMIT_MSG"
git push
echo Done.