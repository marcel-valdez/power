#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
watcher_pids=()

function kill_previous {
  ps aux | sed -r 's/[ ]+/ /g' | grep 'bin/watchfile' | cut -d' ' -f2 |\
    xargs -Ipid kill -9 pid
}

function kill_watcher {
  for pid in "${watcher_pids[@]}"; do
    kill -9 ${pid}
  done
}

function watch_directory {
  local watched_dir="$1"
  watchfile --recursive --regx '.*\.m?js$'\
    --directory "${watched_dir}"\
    "${DIR}/handle_watched_file.sh __file__" &
  watcher_pids+=($!)
}

kill_previous

trap kill_watcher EXIT

watch_directory "${DIR}/ui"
watch_directory "${DIR}/core"
watch_directory "${DIR}/ai"
watch_directory "${DIR}/tests"
watch_directory "${DIR}/multiplayer"
watch_directory "${DIR}/server"

watchfile --regx '.*\.m?js$' --directory "${DIR}/" "${DIR}/handle_watched_file.sh" __file__ &

wait
