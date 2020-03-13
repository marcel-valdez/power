#!/usr/bin/env bash

function ::now {
  date "+%m/%d %H:%M:%S"
}

function ::now_millis {
  echo $(date +%s%N | cut -b1-13)
}

function ::log {
  if [[ -z ${SILENT} ]]; then
    echo -e "[$(::now)]: $@"
  fi
}

function ::debug {
  ! [ -z "${DEBUG}" ] && ::log "$@" >&2
}

function ::info {
  ::log "\e[34mINFO:\e[0m $@\n"
}

function ::error {
  ::log "\e[31mERROR:\e[0m $@\n" >&2
}

function ::warn {
  ::log "\e[33mWARNING:\e[0m $@\n" >&2
}

function ::fatal {
  ::log "\e[31mFATAL:\e[0m $@\n" >&2
  exit 1
}
