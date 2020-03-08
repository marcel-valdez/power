#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

watchfile --recursive --regx '.*\.mjs$' --directory "${DIR}" "${DIR}/handle_watched_file.sh" __file__

