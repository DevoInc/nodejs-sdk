#!/bin/bash
# Alex 2018-03-05: show latest queries to integration

current="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
start=$(date --iso-8601=seconds -d "-2 minutes")
end=$(date --iso-8601=seconds)

echo "from $start to $end"

node $current/cli.js \
  -d "$start" \
  -t "$end" \
  -q "from siem.logtrust.serrea.out select eventdate,message"

