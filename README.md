[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)
[![CI](https://github.com/SolaceLabs/solace-tools-typescript/actions/workflows/ci.yml/badge.svg)](https://github.com/SolaceLabs/solace-tools-typescript/actions/workflows/ci.yml)
[![Release](https://github.com/SolaceLabs/solace-tools-typescript/actions/workflows/release.yml/badge.svg)](https://github.com/SolaceLabs/solace-tools-typescript/actions/workflows/release.yml)


# Solace Tools (Typescript)

A set of libaries to interact with various components in the Solace Platform.

- [Solace Event Portal OpenAPI Client for NodeJS](./packages/ep-openapi-node)
- [Solace SempV2 Config OpenAPI Client for NodeJS](./packages/sempv2-config-openapi-node)
- [Async API SDK](./packages/ep-asyncapi)
- [Event Portal SDK](./packages/ep-sdk)
- [Event Portal Async API Importer CLI](./packages/ep-async-api-importer)

## Documentation

[Visit the docs for details](https://solacelabs.github.io/solace-tools-typescript/).

## Resources

This is not an officially supported Solace product.

For more information try these resources:

- Ask the [Solace Community](https://solace.community)
- The Solace Developer Portal website at: https://solace.dev

## Building locally

1. Clone repo locally `git clone git@github.com:SolaceLabs/solace-tools-typescript.git`
1. Make sure you have node 16+ `node -v`
1. Make sure you have yarn installed `npm install --global yarn`
1. Navigate to the solace-tools-typescript repo `cd solace-tools-typescript`
1. Install node dependencies `yarn install`
1. Install python dependencies.
    1. We would recommend setting up a virtual environment for python3 `python3 -m venv venv`
    1. Activate the virtual environment `source venv/bin/activate`
    1. Upgrade pip `python -m pip install --upgrade pip`
    1. Install dependencies `pip install -r docs/devel/docs.requirements.txt`
1. Build the internal tools `yarn run build`
1. Navigate to the package of choice directory. For example, `cd packages/ep-async-api-importer`
1. Build the package `yarn build`
1. Your executable is in the dist dir you can run it by navigating to the `dist` directory and running `./cli.js`

Repeat the last two steps iteratively for any changes made to the package code 

## Contributing

Contributions are encouraged! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

See the list of [contributors](https://github.com/SolaceLabs/solace-tools-typescript/graphs/contributors) who participated in this project.

## License

See the [LICENSE](LICENSE) file for details.
