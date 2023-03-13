#
# Environment for tests
#
# Usage:
#   source source.env.sh && {run-tests} && unset_source_env

unset_source_env() {
    # env vars for tests
    unset INTEGRATION_TESTS_EP_SDK_LOG_LEVEL
    unset INTEGRATION_TESTS_ENABLE_API_CALL_LOGGING
    unset INTEGRATION_TESTS_SOLACE_CLOUD_TOKEN
    # unset this function
    unset -f unset_source_env
}
# export enum EEpSdkLogLevel {
#   Silent = 0,
#   FatalError = 1,
#   Error = 2,
#   Warn = 3,
#   Info = 4,
#   Debug = 5,
#   Trace = 6,
# }
export INTEGRATION_TESTS_EP_SDK_LOG_LEVEL=0
export INTEGRATION_TESTS_ENABLE_API_CALL_LOGGING="true"

######################################################

NOLOG_INTEGRATION_TESTS_SOLACE_CLOUD_TOKEN=$INTEGRATION_TESTS_SOLACE_CLOUD_TOKEN
export INTEGRATION_TESTS_SOLACE_CLOUD_TOKEN="***"

logName='[source.env.sh]'
echo "$logName - test environment:"
echo "$logName - INTEGRATION_TESTS_:"
export -p | sed 's/declare -x //' | grep INTEGRATION_TESTS_

export INTEGRATION_TESTS_SOLACE_CLOUD_TOKEN=$NOLOG_INTEGRATION_TESTS_SOLACE_CLOUD_TOKEN
