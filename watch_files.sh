#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function kill_previous {
  ps aux | sed -r 's/[ ]+/ /g' | grep 'bin/watchfile' | cut -d' ' -f2 |\
    xargs -Ippp kill -9 ppp
}

kill_previous

watchfile --recursive --regx '.*\.m?js$' --directory "${DIR}/ui" "${DIR}/handle_watched_file.sh" __file__ &

watchfile --recursive --regx '.*\.m?js$' --directory "${DIR}/core" "${DIR}/handle_watched_file.sh" __file__ &

watchfile --recursive --regx '.*\.m?js$' --directory "${DIR}/ai" "${DIR}/handle_watched_file.sh" __file__ &

watchfile --recursive --regx '.*\.m?js$' --directory "${DIR}/tests" "${DIR}/handle_watched_file.sh" __file__ &

watchfile --recursive --regx '.*\.m?js$' --directory "${DIR}/multiplayer" "${DIR}/handle_watched_file.sh" __file__ &

watchfile --recursive --regx '.*\.m?js$' --directory "${DIR}/server" "${DIR}/handle_watched_file.sh" __file__ &

watchfile --regx '.*\.m?js$' --directory "${DIR}/" "${DIR}/handle_watched_file.sh" __file__ &

wait
