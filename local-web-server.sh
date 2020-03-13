#!/usr/bin/env bash


SCRIPT="${BASH_SOURCE[0]}"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
NPM_BIN=$(npm bin)
WEB_SERVER_BIN="${NPM_BIN}/ws"
return_value=

source "${SCRIPT_DIR}/boilerplate.sh"

function validate_environment {
  type npm &> /dev/null || ::fatal "npm is required"
  [[ -x "${WEB_SERVER_BIN}" ]] || ::fatal "${WEB_SERVER_BIN} is required.\
Please install it by running npm install."
}

function is_old_web_server_running {
  [[ -e /tmp/power-local-web-server.pid ]]
}

function stop_old_web_server {
  ::info "Stopping old web server"
  old_web_server_pid=$(cat /tmp/power-local-web-server.pid)
  if ! kill ${old_web_server_pid} &> /dev/null; then
    ::warn "Could not send SIGTERM to process ${old_web_server_pid}"
  fi
}

function start_web_server {
  ::info "Starting new web server"
  pushd ${SCRIPT_DIR} >& /dev/null
  local temp_filepath=$(tempfile)
  "${WEB_SERVER_BIN}" --log.format dev &> ${temp_filepath} &
  local web_server_pid=$!
  echo ${web_server_pid} > /tmp/power-local-web-server.pid
  popd >& /dev/null

  return_value=${temp_filepath}
}

function print_usage {
  cat <<EOF
${SCRIPT} [--start-only] [--stop] [--start] [--help]

start: Stops the previous web server (if any) and starts a new one.
       This is done by default whether this parameter is passed in or not.
start-only: Does not try to stop a previous instance.
stop: Only stops the current web server (if any).
help: Prints this help message.
EOF
}

start_server=1
stop_server=1
function parse_params {
  while [ $# -gt 0 ]; do
  local arg="$1"
  case "${arg}" in
    --start)
      ;;
    --start-only)
      stop_server=0
      ;;
    --stop)
      start_server=0
      ;;
    --help)
      print_usage
      exit 0
      ;;
    *)
      ::error "Unknown parameter ${arg}"
      print_usage
      exit 1
      ;;
  esac
  shift
done

}

function main {
  parse_params "$@"
  validate_environment

  if [[ ${stop_server} -eq 1 ]]; then
    if is_old_web_server_running; then
      stop_old_web_server
    else
      ::info "No previous web server to stop."
    fi
  fi

  if [[ ${start_server} -eq 1 ]]; then
    start_web_server
    log_file=${return_value}
    ::info "Tailing log file..."
    tail -f "${log_file}"
  fi
}


main "$@"
