#!/usr/bin/env bash

watchfile --recursive --regx '.*\.mjs$' --directory $(pwd) /home/marcel/projects/power/handle_watched_file.sh __file__
