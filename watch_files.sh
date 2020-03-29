#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function kill_previous {
  ps aux | sed -r 's/[ ]+/ /g' | grep 'bin/watchfile' | cut -d' ' -f2 |\
    xargs -Ippp kill -9 ppp
}

kill_previous

watchfile --recursive --regx '.*\.mjs$' --directory "${DIR}/ui" "${DIR}/handle_watched_file.sh" __file__ &

watchfile --recursive --regx '.*\.mjs$' --directory "${DIR}/core" "${DIR}/handle_watched_file.sh" __file__ &

watchfile --recursive --regx '.*\.mjs$' --directory "${DIR}/ai" "${DIR}/handle_watched_file.sh" __file__ &

watchfile --recursive --regx '.*\.mjs$' --directory "${DIR}/tests" "${DIR}/handle_watched_file.sh" __file__ &

wait
