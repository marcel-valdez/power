#!/usr/bin/env bash

function now {
  date '+%H:%M:%S'
}

function print {
  echo "$(now) $1"
}

function run_all_tests {
  print "Running all tests."
  local exit_code=0
  for test_file in ./tests/**/*test.mjs; do
    run_test "${test_file}"
    ! [[ $? -eq 0 ]] && exit_code=1
  done
  print "Done running all tests."
  return ${exit_code}
}

function run_test {
  test_file=$1
  print "Running test: ${test_file}"
  node "${test_file}"
  return $?
}

function get_test_file {
  src_file=$1
  filename=$(basename ${src_file})
  dirpath=$(dirname ${src_file})

  test_dirpath=${dirpath/core/tests\/core/}
  test_filename=${filename/\.mjs/.test.mjs}
  echo ${test_dirpath}/${test_filename}
}

function main {
  file=$1
  clear
  print "Regenerating TAGS file"
  etags *.mjs


  if [[ "${file}" =~ test\.mjs ]]; then
    run_test "${file}"
  elif [[ "${file}" =~ \.mjs ]]; then
    test_file=$(get_test_file "${file}")
    if [[ -e "${test_file}" ]]; then
      run_test "${test_file}"
    else
      run_all_tests
    fi
  fi

  exit $?
}

main "$@"
