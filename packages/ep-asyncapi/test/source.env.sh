#
# Environment for tests
#
# Usage:
#   source source.env.sh && {run-tests} && unset_source_env



unset_source_env() {
    # unset env vars for tests
    # placeholder

    # unset this function
    unset -f unset_source_env
}

######################################################

export TEST_EP_ASYNCAPI_DUMMY="dummy"

logName='[source.env.sh]'
echo "$logName - test environment:"
echo "$logName - TEST_EP_ASYNCAPI:"
export -p | sed 's/declare -x //' | grep TEST_EP_ASYNCAPI_

