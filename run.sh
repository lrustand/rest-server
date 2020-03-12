#!/bin/sh
docker run -d --cpuset-cpus=0 --cpu-shares=20 rest-server
