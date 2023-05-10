# Migration Tool for Solace Event Portal V1 to V2

## Install

```bash
npm install @solace-labs/ep-migrate -g
```

## Usage

### Set Solace Cloud Token

```bash
export EP_MIGRATE_CLI_SOLACE_CLOUD_TOKEN_V1={your v1 token}
export EP_MIGRATE_CLI_SOLACE_CLOUD_TOKEN_V2={your v2 token}
```

### Configuration

```bash
vi ./ep-migrate-config.yaml
```

_Note: You can use a different config file if you prefer._

### Migrating

```bash
# using the default config file: ep-migrate-config.yaml
ep-migrate
# using a different file: {my-config-file.yaml}
ep-migrate -cf {my-config-file.yaml}
```

### Help

```bash
ep-migrate -h
```

### Documentation

See [Documentation](https://solacelabs.github.io/ep-migrate/).
