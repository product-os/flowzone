## Flowzone

Reusable, opinionated, zero-conf workflows for GitHub actions

### Usage

Simply add the following to `./github/workflows/flowzone.yml`:

```yml
name: Flowzone

on:
  pull_request:
    types: [opened, synchronize, closed]
    branches:
      - "main"
      - "master"

jobs:
  flowzone:
    uses: product-os/flowzone/.github/workflows/flowzone.yml@master
```

Flowzone will automatically select an appropriate runner based on your project's code.

### Supported project types

#### NodeJS

Currently testing with NodeJS 16.x is supported. These tests will be run if a `package.json` file is found in the root of the repository. If a `package-lock.json` file is found in the root of the repository, dependencies will be install with `npm ci`, otherwise `npm i` will be used.
If a build script is present in `package.json` it will be called before the tests are run.
Testing is done by calling `npm test`.

#### Docker compose w/ SUT container

If a `docker-compose.yml` *and* a `docker-compose.test.yml` is found in the root of the repository, Flowzone will test your project using Docker. The compose script will merge the to yaml file together and wait on a container named `sut` to finish. The result of the test is determined by the exit code of the `sut` container.
Typically, the `sut` container will container your e2e or integration tests and will exit on test completion.
If you need to provide environment variables to the compose environment you can add a repository secret called `COMPOSE_VARS` that should be a base64 encoded `.env` file. This will be decoded and written to a `.env` file inside the test worker at runtim.
