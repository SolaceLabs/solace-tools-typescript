#
# Environment for tests
#
# Usage:
#   source source.env.sh && {run-tests} && unset_source_env

unset_source_env() {
    # env vars for tests
    unset TEST_SEMPV2_CONFIG_OPEN_API_NODE_ENABLE_API_CALL_LOGGING
    # unset this function
    unset -f unset_source_env
}

######################################################

# here
export TEST_SEMPV2_CONFIG_OPEN_API_NODE_ENABLE_API_CALL_LOGGING=true
# external
NOLOG_TEST_SEMPV2_CONFIG_OPEN_API_NODE_SOLACE_CLOUD_TOKEN=$TEST_SEMPV2_CONFIG_OPEN_API_NODE_SOLACE_CLOUD_TOKEN
export TEST_SEMPV2_CONFIG_OPEN_API_NODE_SOLACE_CLOUD_TOKEN="***"
NOLOG_TEST_SEMPV2_CONFIG_OPEN_API_PASSWORD=$TEST_SEMPV2_CONFIG_OPEN_API_PASSWORD
export TEST_SEMPV2_CONFIG_OPEN_API_PASSWORD="***"

logName='[source.env.sh]'
echo "$logName - test environment:"
echo "$logName - CI: '$CI'"
echo "$logName - TEST_SEMPV2_CONFIG_OPEN_API_:"
export -p | sed 's/declare -x //' | grep TEST_SEMPV2_CONFIG_OPEN_API_

export TEST_SEMPV2_CONFIG_OPEN_API_NODE_SOLACE_CLOUD_TOKEN=$NOLOG_TEST_SEMPV2_CONFIG_OPEN_API_NODE_SOLACE_CLOUD_TOKEN
export TEST_SEMPV2_CONFIG_OPEN_API_PASSWORD=$NOLOG_TEST_SEMPV2_CONFIG_OPEN_API_PASSWORD
