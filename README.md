# Flowzone

Reusable, opinionated, zero-conf workflows for GitHub actions

## ToC

* [Usage](#usage)
* [Supported project types](#supported-project-types)
* [Migration from resinCI](#migration-from-resinci)

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
    uses: product-os/flowzone/.github/workflows/flowzone.yml@master
```

Flowzone will automatically select an appropriate runner based on your project's code.

## Supported project types

### NodeJS

Currently testing with NodeJS 16.x is supported. These tests will be run if a `package.json` file is found in the root of the repository. If a `package-lock.json` file is found in the root of the repository, dependencies will be install with `npm ci`, otherwise `npm i` will be used.
If a build script is present in `package.json` it will be called before the tests are run.
Testing is done by calling `npm test`.

### Docker compose w/ SUT container

If a `docker-compose.yml` *and* a `docker-compose.test.yml` is found in the root of the repository, Flowzone will test your project using Docker. The compose script will merge the to yaml file together and wait on a container named `sut` to finish. The result of the test is determined by the exit code of the `sut` container.
Typically, the `sut` container will container your e2e or integration tests and will exit on test completion.
If you need to provide environment variables to the compose environment you can add a repository secret called `COMPOSE_VARS` that should be a base64 encoded `.env` file. This will be decoded and written to a `.env` file inside the test worker at runtim.

## Migration from resinCI
> steps to migrate an existing resinCI enabled repository to Flowzone

* obtain GitHub token with admin/owner permissions from [Vault](https://vault.product-os.io/ui/vault/secrets/secret/show/concourse/main/github-access-token)
* set `GITHUB_ACCESS_TOKEN` in your shell to the value obtained from Vault
* disable resinCI in `.resinci.yml` by adding `disabled: true` key (e.g.)

```
$ cat < .resinci.yml
disabled: true
```

* remove all resinCI required checks from your repository (e.g.)

```
org=balenablocks
repo=awesome-block
branch=master

curl https://api.github.com/repos/${org}/${repo}/branches/${branch}/protection \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_ACCESS_TOKEN}" \
  -X PUT \
  -d '{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "VersionBot/generate-version"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismissal_restrictions": {
      "users": [],
      "teams": []
    },
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1,
    "bypass_pull_request_allowances": {
      "users": [],
      "teams": []
    }
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": false
}'
```

* add `.github/workflows/flowzone.yml` (e.g.)

```
name: Flowzone

on:
  pull_request:
    branches:
      - "main"
      - "master"
  push:
    branches:
      - "main"
      - "master"

jobs:
  flowzone:
    name: Flowzone
    uses: product-os/flowzone/.github/workflows/flowzone.yml@master
    secrets: inherit
```

* ensure your `package.json`, `docker-compose.yml`, `balena.yml`, `Dockerfile`, etc.
  contain correct information to enable Flowzone to perform the required actions

* open a draft PR

* approve/certify

* the PR will automatically merge if and when the workflow completes
