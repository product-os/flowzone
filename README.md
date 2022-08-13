# Flowzone

Reusable, opinionated, zero-conf workflows for GitHub actions

## ToC

- [Usage](#usage)
- [Supported project types](#supported-project-types)
- [Migration from resinCI](#migration-from-resinci)
- [Maintenance](#maintenance)

## Usage

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
    name: Flowzone
    uses: product-os/flowzone/.github/workflows/flowzone.yml@master
    secrets: inherit
```

Flowzone will automatically select an appropriate runner based on your project's code.

## Supported project types

### NodeJS

Currently testing with NodeJS 16.x is supported. These tests will be run if a `package.json` file is found in the root of the repository. If a `package-lock.json` file is found in the root of the repository, dependencies will be install with `npm ci`, otherwise `npm i` will be used.
If a build script is present in `package.json` it will be called before the tests are run.
Testing is done by calling `npm test`.

### Docker compose w/ SUT container

If a `docker-compose.yml` _and_ a `docker-compose.test.yml` is found in the root of the repository, Flowzone will test your project using Docker. The compose script will merge the to yaml file together and wait on a container named `sut` to finish. The result of the test is determined by the exit code of the `sut` container.
Typically, the `sut` container will container your e2e or integration tests and will exit on test completion.
If you need to provide environment variables to the compose environment you can add a repository secret called `COMPOSE_VARS` that should be a base64 encoded `.env` file. This will be decoded and written to a `.env` file inside the test worker at runtim.

## Customization

### Secrets

The following secrets should be set by an Owner at the Organization level,
but they can also be [configured for personal repositories](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository).

| Name                   | Required | Description                                                                                                                  |
| ---------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `FLOWZONE_TOKEN`       | true     | Personal access token (PAT) for the GitHub service account with admin/owner permissions                                      |
| `GPG_PRIVATE_KEY`      | true     | GPG private key exported with `gpg --armor --export-secret-keys ...` to sign commits                                         |
| `GPG_PASSPHRASE`       | true     | Passphrase to decrypt GPG private key                                                                                        |
| `NPM_TOKEN`            | true     | The NPM auth token to use for publishing                                                                                     |
| `DOCKER_REGISTRY_USER` | true     | Username to publish to the Docker Hub container registry                                                                     |
| `DOCKER_REGISTRY_PASS` | true     | A [personal access token](https://docs.docker.com/docker-hub/access-tokens/) to publish to the Docker Hub container registry |
| `BALENA_API_KEY_PUSH`  | true     | [API key](https://www.balena.io/docs/learn/manage/account/#api-keys) for pushing releases to balena applications             |
| `COMPOSE_VARS`         | false    | Optional base64 encoded docker-compose `.env` file for testing Docker images                                                 |

These secrets can also be found at the top of [flowzone.yml](./.github/workflows/flowzone.yml).

### Inputs

These inputs are all optional and include some opinionated defaults.

| Name                              | Default                                                                                                      | Description                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `working_directory`               | `.`                                                                                                          | GitHub actions working directory                                               |
| `required_approving_review_count` | `1`                                                                                                          | Setting this value to zero effectively means merge==deploy without approval(s) |
| `dockerhub_repo`                  |                                                                                                              | Docker Hub repository for Docker projects, skipped if empty                    |
| `ghcr_repo`                       | `${{ github.repository }}`                                                                                   | GitHub Container Registry repository for Docker projects, skipped if empty     |
| `docker_cache_from`               |                                                                                                              | Newline-delimited string of additional external cache sources                  |
| `docker_platforms`                | `linux/amd64`<br>`linux/arm64`<br>`linux/arm/v7`                                                             | Newline-delimited string of Docker target platforms                            |
| `docker_context`                  | `.`                                                                                                          | Docker build context directory                                                 |
| `docker_file`                     | `Dockerfile`                                                                                                 | Path to the Dockerfile relative to the context                                 |
| `docker_target`                   |                                                                                                              | Sets the target stage to build                                                 |
| `balena_slugs`                    | `${{ github.repository }}-amd64`<br>`${{ github.repository }}-aarch64`<br>`${{ github.repository }}-armv7hf` | Newline-delimited string of balenaCloud apps, fleets, or blocks to deploy      |
| `node_versions`                   | `14.x`<br>`16.x`<br>`18.x`                                                                                   | Newline-delimited string of Node.js versions to test                           |

These inputs can also be found at the top of [flowzone.yml](./.github/workflows/flowzone.yml).

Note that newline-delimited strings are a workaround for actions not accepting arrays as input and should look like this in your workflow file:

```yml
---
jobs:
  flowzone:
    name: Flowzone
    uses: product-os/flowzone/.github/workflows/flowzone.yml@master
    secrets: inherit
    inputs:
      docker_platforms: |
        linux/amd64
        linux/arm64
        linux/arm/v7
      node_versions: |
        14.x
        16.x
        18.x
```

## Migration from resinCI

Open a PR with the following changes to migrate an existing resinCI enabled repository to Flowzone:

1. Create `.github/workflows/flowzone.yml` (see [Usage](#usage)) in a new PR
2. Ensure your `package.json`, `docker-compose.test.yml`, `balena.yml`, etc. contain correct information and Flowzone is passing all tests
3. Disable resinCI in `.resinci.yml` by adding `disabled: true` key

   ```yaml
   # .resinci.yml
   disabled: true
   ```

4. Once the resinCI is disabled, and the Flowzone tests have passed, the branch protection rules will be updated automatically. This requires admin access to revert!
5. Seek approval or self-certify!

## Maintenance

### Generate GPG keys

> [Managing commit signature verification
> ](https://docs.github.com/en/authentication/managing-commit-signature-verification)

- generate new GPG key signing ensuring the name matches an existing GitHub user/identity

```bash
gpg --full-generate-key
```

- get the key id

```bash
gpg --list-secret-keys --keyid-format=long
```

- export the key to be stored in `GPG_PRIVATE_KEY` GitHub organisation secret

```bash
gpg --armor --export-secret-keys {{secret_key_id}}
```

- set `GPG_PASSPHRASE` and `GPG_PRIVATE_KEY` GitHub organisation secrets

## Help

If you're having trouble getting the project running,
submit an issue or post on the forums at <https://forums.balena.io>.

## Contributing

Please open an issue or submit a pull request with any features, fixes, or changes.
