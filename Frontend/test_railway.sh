#!/bin/bash
# Test comme Railway
export VITE_MAPBOX_TOKEN=pk.eyJ1IjoibWF0c2Rrdc2QiLCJhIjoiY20ybnZlcWdwMDgyMTJqc2NhaXZ1OXY1eCJ9.0jMxkpNKzhawFcWBWg6Yjg
export VITE_API_URL=https://cdabackend-production-3c8a.up.railway.app

docker build \
  --build-arg VITE_MAPBOX_TOKEN=$VITE_MAPBOX_TOKEN \
  --build-arg VITE_API_URL=$VITE_API_URL \
  -t sportmap-frontend . && \
docker run -p 5173:80 sportmap-frontend