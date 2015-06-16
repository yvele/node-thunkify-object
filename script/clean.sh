#!/usr/bin/env bash

set -e

ROOT_DIR=$(cd $(dirname $0)/..; pwd)
cd $ROOT_DIR

BIN_DIR=./node_modules/.bin

rm -rf \
  npm-debug.log \
  node_modules \
  coverage
