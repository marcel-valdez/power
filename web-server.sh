#!/usr/bin/env bash


SCRIPT="${BASH_SOURCE[0]}"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
NPM_BIN=$(npm bin)
NODE_BIN=$(type -p node 2>/dev/null)
return_value=

source "${SCRIPT_DIR}/boilerplate.sh"

function validate_environment {
  type npm &> /dev/null || ::fatal "npm is required"
  [[ -x "${NODE_BIN}" ]] || ::fatal "${NODE_BIN} is required.\
Please install it by running npm install."

  [[ "${type}" == "dev" ]] || [[ "${type}" == "dist" ]] || \
    ::fatal "Unknown deployment type: ${type}"
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
  pushd "${SCRIPT_DIR}" >& /dev/null
  local temp_filepath=$(tempfile)
  if [[ "${type}" == "dev" ]]; then
    [[ -z ${port} ]] && port=8000
    DEBUG=express:* "${NODE_BIN}" app.js --port "${port}" \
         --static_path "${SCRIPT_DIR}" &> \
         ${temp_filepath} &
  else
    [[ -z ${port} ]] && port=80
    "${NODE_BIN}" app.js --port "${port}" --static_path "${SCRIPT_DIR}/dist" \
      &> ${temp_filepath} &
  fi
  local web_server_pid=$!
  echo ${web_server_pid} > /tmp/power-local-web-server.pid
  popd >& /dev/null

  return_value=${temp_filepath}
}

function print_usage {
  cat <<EOF
${SCRIPT} [--start-only] [--stop] [--start] [--type (dev|dist)] [--help]
          [--port|-p (port number)]

port: Port on which to host the server. Default: 80
start: Stops the previous web server (if any) and starts a new one.
       This is done by default whether this parameter is passed in or not.
start-only: Does not try to stop a previous instance.
stop: Only stops the current web server (if any).
type: Deployment type for the local web server. Default: dev
  dev: Hosts the files in the source code as-is.
  dist: Hosts the files in the 'dist/' folder. Note that you need to execute
        'npm run build' in order to create the outputs for the dist/ folder.
help: Prints this help message.
EOF
}

start_server=1
stop_server=1
type='dev'
port=80
! [[ -z ${PORT} ]] && port=${PORT}
function parse_params {
  while [ $# -gt 0 ]; do
    local arg="$1"
    case "${arg}" in
      --port|-p)
        port=$2
        shift
        ;;
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
      --type)
        type="$2"
        shift
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
