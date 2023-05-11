#
# Environment for tests
#
# Usage:
#   source source.env.sh && {run-tests} && unset_source_env

unset_source_env() {
    # env vars for tests
    unset TEST_EP_MIGRATE_ENABLE_API_CALL_LOGGING
    # unset this function
    unset -f unset_source_env
}

# ENV vars for tests
export TEST_EP_MIGRATE_ENABLE_API_CALL_LOGGING="false"

######################################################

logName='[source.env.sh]'
echo "$logName - test environment:"
echo "$logName - TEST_EP_MIGRATE:"
export -p | sed 's/declare -x //' | grep TEST_EP_MIGRATE_
