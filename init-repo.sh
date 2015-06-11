#!/bin/bash
set -e

node=`which node 2>&1`
if [ $? -ne 0 ]; then
  echo "Please install Node.js."
  exit 1
fi

npm=`which npm 2>&1`
if [ $? -ne 0 ]; then
  echo "Please install NPM."
  exit 1
fi

echo "Installing required npm packages..."
npm install
