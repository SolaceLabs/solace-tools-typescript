#!/usr/bin/env bash

scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

# # yarn build
# cd $scriptDir/..
#   code=$?; if [[ $code != 0 ]]; then echo ">>> XT_ERROR - $code make html"; exit 1; fi
# yarn build
#   code=$?;
#   # run yarn install and try again
#   if [[ $code != 0 ]]; then
#     yarn install;
#     yarn build;
#     code=$?; if [[ $code != 0 ]]; then echo ">>> XT_ERROR - $code make html"; exit 1; fi
#   fi
#
# generate rst docs
cd $scriptDir
make clean html
  code=$?; if [[ $code != 0 ]]; then echo ">>> XT_ERROR - $code make html"; exit 1; fi

make linkcheck
  code=$?; if [[ $code != 0 ]]; then echo ">>> XT_ERROR - $code make linkcheck"; exit 1; fi

###
# The End.
