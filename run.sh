#!/bin/sh
docker run -it --rm --cpuset-cpus=0 --cpu-shares=20 --cap-drop ALL -p 3000:3000 rest-server
