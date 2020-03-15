#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

watchfile --recursive --regx '.*\.mjs$' --directory "${DIR}/ui" "${DIR}/handle_watched_file.sh" __file__ &

watchfile --recursive --regx '.*\.mjs$' --directory "${DIR}/core" "${DIR}/handle_watched_file.sh" __file__ &

watchfile --recursive --regx '.*\.mjs$' --directory "${DIR}/ai" "${DIR}/handle_watched_file.sh" __file__ &

watchfile --recursive --regx '.*\.mjs$' --directory "${DIR}/tests" "${DIR}/handle_watched_file.sh" __file__ &

