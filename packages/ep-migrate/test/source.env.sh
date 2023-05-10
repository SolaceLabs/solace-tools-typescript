#
# Environment for tests
#
# Usage:
#   source source.env.sh && {run-tests} && unset_source_env

unset_source_env() {
    # env vars for tests
    unset TEST_EP_MIGRATE_ENABLE_API_CALL_LOGGING
    unset TEST_EP_MIGRATE_EP_SDK_LOG_LEVEL
    # unset this function
    unset -f unset_source_env
}

# ENV vars for tests
export TEST_EP_MIGRATE_ENABLE_API_CALL_LOGGING="false"
export TEST_EP_MIGRATE_EP_SDK_LOG_LEVEL=0

######################################################

logName='[source.env.sh]'
echo "$logName - test environment:"
echo "$logName - CLI:"
export -p | sed 's/declare -x //' | grep CLI_
echo "$logName - TEST_EP_MIGRATE:"
export -p | sed 's/declare -x //' | grep TEST_EP_MIGRATE_
