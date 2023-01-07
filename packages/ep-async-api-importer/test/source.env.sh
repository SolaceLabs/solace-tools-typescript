#
# Environment for tests
#
# Usage:
#   source source.env.sh && {run-tests} && unset_source_env

unset_source_env() {
    # env vars for app
    unset CLI_APP_NAME
    unset CLI_EP_API_BASE_URL
    unset CLI_MODE
    unset CLI_RUN_ID
    unset CLI_LOGGER_LOG_LEVEL
    unset CLI_LOGGER_PRETTY_PRINT
    unset CLI_TEST_SETUP_DOMAINS_FOR_APIS
    unset CLI_LOGGER_LOG_FILE
    unset CLI_LOGGER_PRETTY_PRINT
    unset CLI_IMPORT_ASSETS_OUTPUT_DIR
    # env vars for tests
    unset CLI_TEST_ENABLE_API_CALL_LOGGING
    unset TEST_EP_ASYNC_API_IMPORTER_EP_SDK_LOG_LEVEL
    # unset this function
    unset -f unset_source_env
}

# Env vars for cli
# export CLI_APP_NAME="ep-async-api-importer-test"

# export CLI_RUN_ID="testing-test-id"

export CLI_LOGGER_LOG_LEVEL="info"
export CLI_LOGGER_LOG_LEVEL="trace"
export CLI_LOGGER_PRETTY_PRINT="true"
export CLI_LOGGER_LOG_FILE=./logs/TEST_EP_ASYNC_API_IMPORTER.log
export CLI_LOGGER_PRETTY_PRINT=true
export CLI_IMPORT_ASSETS_OUTPUT_DIR=./output

# ENV vars for tests
export TEST_EP_ASYNC_API_IMPORTER_ENABLE_API_CALL_LOGGING="false"
export TEST_EP_ASYNC_API_IMPORTER_EP_SDK_LOG_LEVEL=0

######################################################

NOLOG_TEST_EP_ASYNC_API_IMPORTER_SOLACE_CLOUD_TOKEN=$TEST_EP_ASYNC_API_IMPORTER_SOLACE_CLOUD_TOKEN
export TEST_EP_ASYNC_API_IMPORTER_SOLACE_CLOUD_TOKEN="***"

logName='[source.env.sh]'
echo "$logName - test environment:"
echo "$logName - CLI:"
export -p | sed 's/declare -x //' | grep CLI_
echo "$logName - TEST_EP_ASYNC_API_IMPORTER:"
export -p | sed 's/declare -x //' | grep TEST_EP_ASYNC_API_IMPORTER_

export TEST_EP_ASYNC_API_IMPORTER_SOLACE_CLOUD_TOKEN=$NOLOG_TEST_EP_ASYNC_API_IMPORTER_SOLACE_CLOUD_TOKEN
export CLI_SOLACE_CLOUD_TOKEN=$NOLOG_TEST_EP_ASYNC_API_IMPORTER_SOLACE_CLOUD_TOKEN
