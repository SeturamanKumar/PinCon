#!/bin/bash

echo "Starting PinCon Frontend Deployment..."

cd ~/Documents/Coding/PinCon/client || exit

echo "Building the frontend files"

npm run build

if [ $? -eq 0 ]; then
	echo "Build successful"
else
	echo "Build failed. Aborting deployment"
	exit 1
fi

echo "Clearing old files from /var/www/pincon..."
sudo rm -rf /var/www/pincon/*

echo "Moving new files to Nginx..."
sudo cp -r dist/* /var/www/pincon/

sudo chmod -R 755 /var/www/pincon

echo "Deployment complete! Your updates are live at http://localhost"
