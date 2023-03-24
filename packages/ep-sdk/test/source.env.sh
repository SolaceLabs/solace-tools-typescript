#
# Environment for tests
#
# Usage:
#   source source.env.sh && {run-tests} && unset_source_env

unset_source_env() {
    # env vars for tests
    unset TEST_EP_SDK_LOG_LEVEL
    unset TEST_EP_SDK_ENABLE_API_CALL_LOGGING
    unset TEST_EP_SDK_SOLACE_CLOUD_TOKEN
    unset TEST_EP_SDK_TOKEN_NO_APPLICATION_DOMAINS_PERMISSIONS    
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
export TEST_EP_SDK_LOG_LEVEL=0
export TEST_EP_SDK_ENABLE_API_CALL_LOGGING="false"

######################################################

NOLOG_TEST_EP_SDK_SOLACE_CLOUD_TOKEN=$TEST_EP_SDK_SOLACE_CLOUD_TOKEN
export TEST_EP_SDK_SOLACE_CLOUD_TOKEN="***"
NOLOG_TEST_EP_SDK_TOKEN_NO_APPLICATION_DOMAINS_PERMISSIONS=$TEST_EP_SDK_TOKEN_NO_APPLICATION_DOMAINS_PERMISSIONS
export TEST_EP_SDK_TOKEN_NO_APPLICATION_DOMAINS_PERMISSIONS="***"

logName='[source.env.sh]'
echo "$logName - test environment:"
echo "$logName - TEST_EP_SDK_:"
export -p | sed 's/declare -x //' | grep TEST_EP_SDK_

export TEST_EP_SDK_SOLACE_CLOUD_TOKEN=$NOLOG_TEST_EP_SDK_SOLACE_CLOUD_TOKEN
export TEST_EP_SDK_TOKEN_NO_APPLICATION_DOMAINS_PERMISSIONS=$NOLOG_TEST_EP_SDK_TOKEN_NO_APPLICATION_DOMAINS_PERMISSIONS
