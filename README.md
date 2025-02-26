# Flowzone

![ridiculous logo about hating and flowing](./docs/images/logo.png)

Reusable, opinionated, zero-conf workflows for GitHub actions

## Contents

- [Contents](#contents)
- [Getting Started](#getting-started)
- [Usage](#usage)
  - [Merging](#merging)
  - [External Contributions](#external-contributions)
  - [Commit Message](#commit-message)
    - [Skipping Workflow Runs](#skipping-workflow-runs)
- [Supported project types](#supported-project-types)
  - [npm](#npm)
  - [Docker](#docker)
  - [balena](#balena)
  - [Python (with Poetry)](#python-with-poetry)
  - [Rust](#rust)
  - [GitHub](#github)
  - [Custom](#custom)
  - [Versioning](#versioning)
  - [Docs](#docs)
  - [Website](#website)
- [Help](#help)
- [Contributing](#contributing)

## Getting Started

Open a PR with the following changes to test and enable Flowzone:

1. Create `.github/workflows/flowzone.yml` (see [Usage](#usage)) in a new Draft Pull Request to avoid changing branch protection rules.
2. Ensure your `package.json`, `docker-compose.test.yml`, `balena.yml`, etc. contain correct information and all tests are passing.
3. Mark the Pull Request as Ready for Review and re-run the checks via the Checks or Actions panel. New branch protection rules will be applied and this requires admin access to revert!
4. Seek approval or self-certify!

## Usage

<!-- start usage -->

<!---
DO NOT EDIT MANUALLY - This section is auto-generated from flowzone.yml
-->

```yaml

name: Flowzone

on:
  pull_request:
    types: [opened, synchronize, closed]
    branches: [main, master]
  # allow external contributions to use secrets within trusted code
  pull_request_target:
    types: [opened, synchronize, closed]
    branches: [main, master]

jobs:
  flowzone:
    name: Flowzone
    uses: product-os/flowzone/.github/workflows/flowzone.yml@master
    # prevent duplicate workflow executions for pull_request and pull_request_target
    if: |
      (
        github.event.pull_request.head.repo.full_name == github.repository &&
        github.event_name == 'pull_request'
      ) || (
        github.event.pull_request.head.repo.full_name != github.repository &&
        github.event_name == 'pull_request_target'
      )

    # Workflows in the same org or enterprise can use the inherit keyword to implicitly pass secrets
    secrets: inherit

    # Otherwise you must manually specify which secrets to pass
    secrets:
      # GitHub App to generate ephemeral access tokens
      # Required: false
      GH_APP_PRIVATE_KEY:

      # .. or Personal Access Token (PAT) with admin/owner permissions in the org.
      # Required: false
      FLOWZONE_TOKEN:

      # The npm auth token to use for publishing
      # Required: false
      NPM_TOKEN:

      # Username to publish to the Docker Hub container registry
      # Required: false
      DOCKERHUB_USER:

      # Deprecated, use DOCKERHUB_USER instead
      # Required: false
      DOCKER_REGISTRY_USER:

      # A personal access token to publish to the Docker Hub container registry
      # Required: false
      DOCKERHUB_TOKEN:

      # Deprecated, use DOCKERHUB_TOKEN instead
      # Required: false
      DOCKER_REGISTRY_PASS:

      # API key for pushing releases to balena applications
      # Required: false
      BALENA_API_KEY:

      # Deprecated, use BALENA_API_KEY instead
      # Required: false
      BALENA_API_KEY_PUSH:

      # A personal access token to publish to a cargo registry
      # Required: false
      CARGO_REGISTRY_TOKEN:

      # Optional base64 encoded docker-compose `.env` file for testing Docker images
      # Required: false
      COMPOSE_VARS:

      # Cloudflare account ID
      # Required: false
      CF_ACCOUNT_ID:

      # Cloudflare API token with limited access for Pages projects
      # Required: false
      CF_API_TOKEN:

      # Token to publish to pypi.org
      # Required: false
      PYPI_TOKEN:

      # Token to publish to test.pypi.org
      # Required: false
      PYPI_TEST_TOKEN:

      # API key to post Zulip messages.
      # Required: false
      ZULIP_API_KEY:

      # Optional secret for using with custom jobs
      # Required: false
      CUSTOM_JOB_SECRET_1:

      # Optional secret for using with custom jobs
      # Required: false
      CUSTOM_JOB_SECRET_2:

      # Optional secret for using with custom jobs
      # Required: false
      CUSTOM_JOB_SECRET_3:

      # API key for Dependency-Track integration
      # Required: false
      DTRACK_TOKEN:

    with:
      # AWS region with GitHub OIDC provider IAM configuration
      # Type: string
      # Required: false
      aws_region: ${{ vars.AWS_REGION || '' }}

      # AWS IAM role ARN to assume with GitHub OIDC provider
      # Type: string
      # Required: false
      aws_iam_role: ${{ vars.AWS_IAM_ROLE || '' }}

      # AWS CloudFormation templates to deploy (e.g.)
      # ```
      # {
      # "stacks": [
      # {
      # "name": "foo",
      # "template": "aws/bar.yaml",
      # "tags": [
      # "Name=foo",
      # "Environment=${FOO}"
      # ],
      # "capabilities": [
      # "CAPABILITY_IAM",
      # "CAPABILITY_NAMED_IAM"
      # ]
      # },
      # ...
      # ]
      # }
      # ```
      # * assumes `aws/bar.yaml` exists.
      # * `${ENVVARS}` injected at runtime from `vars` and `secrets` contexts
      # Type: string
      # Required: false
      cloudformation_templates: 

      # GitHub App ID to impersonate
      # Type: string
      # Required: false
      app_id: ${{ vars.FLOWZONE_APP_ID || vars.APP_ID }}

      # Deprecated, no longer used
      # Type: string
      # Required: false
      installation_id:

      # Ephemeral token scope(s)
      # Type: string
      # Required: false
      token_scope: >
        {
          "contents": "write",
          "metadata": "read",
          "packages": "write",
          "pages": "write",
          "pull_requests": "read"
        }

      # Timeout for the job(s).
      # Type: number
      # Required: false
      jobs_timeout_minutes: 360

      # GitHub actions working directory
      # Type: string
      # Required: false
      working_directory: .

      # Comma-delimited string of Docker images (without tags) to publish (skipped if empty)
      # Type: string
      # Required: false
      docker_images: 

      # Comma-delimited string of Docker buildx bake targets to publish (skipped if empty)
      # Type: string
      # Required: false
      bake_targets: default

      # Invert the tags for the Docker images (e.g. `{tag}-{variant}` becomes `{variant}-{tag}`)
      # Type: boolean
      # Required: false
      docker_invert_tags: false

      # Publish platform-specific tags in addition to multi-arch manifests (e.g.
      # `product-os/flowzone:latest-amd64`)
      # Type: boolean
      # Required: false
      docker_publish_platform_tags: false

      # balenaCloud environment
      # Type: string
      # Required: false
      balena_environment: balena-cloud.com

      # Comma-delimited string of balenaCloud apps, fleets, or blocks to deploy (skipped if empty)
      # Type: string
      # Required: false
      balena_slugs: 

      # Comma-delimited string of Rust stable targets to publish (skipped if empty)
      # Type: string
      # Required: false
      cargo_targets: >
        aarch64-unknown-linux-gnu,
        armv7-unknown-linux-gnueabihf,
        arm-unknown-linux-gnueabihf,
        x86_64-unknown-linux-gnu,
        i686-unknown-linux-gnu

      # Version specifier (e.g. 1.65, stable, nigthly) for the toolchain to use when building Rust
      # sources
      # Type: string
      # Required: false
      rust_toolchain: stable

      # Set to true to publish Rust binary release artifacts to GitHub
      # Type: boolean
      # Required: false
      rust_binaries: false

      # Set to true to enable terminal emulation for test steps
      # Type: boolean
      # Required: false
      pseudo_terminal: false

      # Set to true to disable automatic versioning
      # Type: boolean
      # Required: false
      disable_versioning: false

      # JSON array of runner label strings for default jobs.
      # Type: string
      # Required: false
      runs_on: >
        [
          "ubuntu-24.04"
        ]

      # JSON key-value pairs mapping platforms to arrays of runner labels. Unlisted platforms will
      # use `runs_on`.
      # Type: string
      # Required: false
      docker_runs_on: {}

      # JSON array of runner label strings for cloudformation jobs.
      # Type: string
      # Required: false
      cloudformation_runs_on:

      # Setting this to your existing CF pages project name will generate and deploy a website.
      # Skipped if empty.
      # Type: string
      # Required: false
      cloudflare_website: 

      # Set to false to disable building a docusaurus website. If false the script `npm run
      # deploy-docs` will be run if it exists.
      # Type: boolean
      # Required: false
      docusaurus_website: true

      # Finalize releases on merge.
      # Type: boolean
      # Required: false
      github_prerelease: false

      # Do not execute custom actions for external contributors. Only remove this restriction if
      # custom actions have been vetted as secure.
      # Type: boolean
      # Required: false
      restrict_custom_actions: true

      # JSON matrix strategy for the custom test action. Properties 'environment' and 'os' will be
      # applied to the job.
      # Type: string
      # Required: false
      custom_test_matrix: 

      # JSON matrix strategy for the custom publish action. Properties 'environment' and 'os' will
      # be applied to the job.
      # Type: string
      # Required: false
      custom_publish_matrix: 

      # JSON matrix strategy for the custom finalize action. Properties 'environment' and 'os'
      # will be applied to the job.
      # Type: string
      # Required: false
      custom_finalize_matrix: 

      # Deprecated. Add the 'os' property in custom_test_matrix, custom_publish_matrix, and
      # custom_finalize_matrix instead.
      # Type: string
      # Required: false
      custom_runs_on:

      # Set to false to disable toggling auto-merge on PRs.
      # Type: boolean
      # Required: false
      toggle_auto_merge: true

      # Create git tags and a PR comment with detailed change log.
      # Type: boolean
      # Required: false
      release_notes: false

      # Set a max parallel value for ALL matrix strategy jobs.
      # Type: number
      # Required: false
      max_parallel: 20

      # Generate a Software Bill of Materials (SBOM) for the release.
      # Type: boolean
      # Required: false
      generate_sbom: true


```
<!-- end usage -->

### Merging

Flowzone only supports merging with a merge commit. This option is shown as **Merge pull request** on an in-progress PR.

Avoid using **Squash and merge** or **Rebase and merge** as these methods will result in a new commit SHA not matching anything from the original PR.
This would prevent Flowzone from finding and finalizing existing draft artifacts.

You can read more about the available merge methods [here](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/about-merge-methods-on-github).

### External Contributions

Flowzone supports external contributions (ie. PRs from forks) to your repository by using [`pull_request_target`](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#pull_request_target) events in addition to `pull_request`. This allows access to secrets normally available to members of the organization or the repository.

To mitigate the risk of secrets being exposed by malicious pull requests, we have taken the following steps in the Flowzone workflow.

- Trusted code includes the Flowzone workflow itself and cannot be modified by pull requests.
- Untrusted or arbitrary code can be called by Flowzone (eg. npm scripts) but does not expose any secrets in the environment at these points.
- Custom actions are disabled for external contributors by default and can be enabled via `restrict_custom_actions` after the custom action has been vetted to not leak secrets to untrusted code.

See the [usage examples](#usage) to get started and allow external contributions to your repo.

### Commit Message

#### Skipping Workflow Runs

Workflows that would otherwise be triggered using `on: push` or `on: pull_request` won't be triggered if you add any of the following strings to the commit message in a push, or the HEAD commit of a pull request:

```text
[skip ci]
[ci skip]
[no ci]
[skip actions]
[actions skip]
```

Alternatively, you can end the commit message with two empty lines followed by either:

```text
skip-checks:true
skip-checks: true
```

You won't be able to merge the pull request if your repository is configured to require specific checks to pass first. To allow the pull request to be merged you can push a new commit to the pull request without the skip instruction in the commit message.

For further reading please check [Github Skipping Workflow Documentation](https://docs.github.com/en/actions/managing-workflow-runs/skipping-workflow-runs).

## Supported project types

Note that these project types are _not_ mutually exclusive, and your project may execute one or more of the following.

### npm

These tests will be run if a `package.json` file is found in the root of the repository.
If a `package-lock.json` or an `npm-shrinkwrap.json` file is found in the root of the repository, dependencies will be installed with `npm ci`, otherwise `npm i` will be used.
If a build script is present in `package.json` it will be called before the tests are run. Testing is done by calling `npm test`.

Multiple LTS versions of Node.js will be tested as long as they meet the [range](https://github.com/npm/node-semver#ranges) defined in [engines](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#engines) in `package.json`.
Node.js 16.x will be used for testing if engines are not defined.

To disable publishing of artifacts set `"private": true` in `package.json`.

### Docker

If `docker-compose.test.yml` is found in the root of the repository, Flowzone will test your project using Docker compose.
If a `docker-compose.yml` is also found they will be merged.

The result of the test is determined by the exit code of the `sut` service.
Typically, the `sut` container will execute your e2e or integration tests and will exit on test completion.

If you need to provide environment variables to the compose environment you can add a repository secret called `COMPOSE_VARS` that should be a base64 encoded `.env` file.
This will be decoded and written to a `.env` file inside the test worker at runtime.

> **WARNING**: The `COMPOSE_VARS` secret is not well protected from leaking and we recommend alternate methods where possible ([issue](https://github.com/product-os/flowzone/issues/236)).

To enable publishing of Docker artifacts set the `docker_images` input to correct value of docker image repositories without tags - eg `ghcr.io/product-os/flowzone`.

For advanced Docker build options, including multi-arch, add one or more [Docker bake files](https://docs.docker.com/build/customize/bake/file-definition/) to your project.

To publish multiple image variants, set the `bake_targets` input to the name of each target in the Docker bake file(s).
All targets except `default` will have the target name prefixed to the tags - eg. `v1.2.3`, `debug-v1.2.3`.

An example of multiple bake targets can be found [here](https://github.com/balena-io-modules/open-balena-base/blob/master/docker-bake.hcl)

### balena

If a `balena.yml` file is found in the root of the repository Flowzone will attempt to push draft releases to your fleet's slug(s) and finalize on merge.

This will **require** either your organization or your repository to have a balenaCloud API key set as a secret named `BALENA_API_KEY`. If you intend to set the secret at the org level then make sure that the API key is valid for all repositories in that organization. A repository-level secret will override an organization-level secret. This API key will be used to login into balena-cli and push draft releases to your fleet in balenaCloud.

To disable publishing of releases to balenaCloud set `balena_slugs` to `""`.

Examples:

1. Start with something simple, [balena-python-hello-world](https://github.com/balena-io-examples/balena-python-hello-world/blob/master/.github/workflows/flowzone.yml)
2. Push to multiple fleets, check out [balena-supervisor](https://github.com/balena-os/balena-supervisor/blob/master/.github/workflows/flowzone.yml).

### Python (with Poetry)

Python tests will be run if a `pyproject.toml` file is found in the root of the repository and Poetry is used as a package manager.

Multiple versions (`>=3.7, <3.11`) of Python will be tested as long as they meet the range in the `pyproject.toml` file.

If your `pyproject.toml` file contains a `packages` property under `[tool.poetry]` tag, this package will also be deployed to [PyPI registry](https://pypi.org/) on master and [PyPI test registry](https://test.pypi.org/) on PRs.

### Rust

If a `Cargo.toml` file is found in the root of the repository, Flowzone will run tests on the code formatting (using `cargo fmt` and `cargo clippy`) and then run tests for a set of target architectures given in `cargo_targets`. In order to disable Rust testing, set the value of that variable to `""`.

For cross building targets, flowzone uses [cross](https://github.com/cross-rs/cross). This also means that further build options (e.g. [pre-build hooks](https://github.com/cross-rs/cross#pre-build-hook)) can be defined by adding a `Cross.toml` file to the local repository.

When `rust_binaries` is set to `true`, Flowzone will also build release artifacts for each target architecture given in `cargo_targets` and upload the artifacts to the GitHub release.

### GitHub

Flowzone will look for any artifacts created with the name `gh-release-${{ github.event.pull_request.head.sha || github.event.head_commit.id }}` and
upload all files found to a draft release matching the branch name. Custom flowzone actions can use this namespace for publishing extra artifacts.

On finalizing the release, Flowzone will edit the release to make it final an add the commit information to the release
notes.

### Custom

_Note: Custom Flowzone actions are not a guaranteed stable interface and should be merged to Flowzone core when possible._

If any [composite actions](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action) are found at the following paths
they will be executed automatically at the described stages of the workflow.

```bash
.github
├── actions
│   ├── clean
│   │   └── action.yml
│   ├── finalize
│   │   └── action.yml
│   ├── publish
│   │   └── action.yml
│   └── test
│   │   └── action.yml
│   └── always
│       └── action.yml
└── workflows
    ├── flowzone.yml
```

A `test` action will run in parallel to any other supported project tests. See [test/action.yml](.github/actions/test/action.yml) for an example.

A `publish` action will run after all the supported tests have completed. See [publish/action.yml](.github/actions/publish/action.yml) for an example.

A `finalize` action will run after a pull request is merged. See [finalize/action.yml](.github/actions/finalize/action.yml) for an example.

A `clean` action will run after a pull request is closed (including merged). See [clean/action.yml](.github/actions/clean/action.yml) for an example.

An `always` action will run (always), even if the workflow is cancelled.

More interfaces may be added in the future. Open an issue if you have a use case that is not covered!

### Versioning

As long as versioning is not explicitly disabled via `disable_versioning` then Flowzone will attempt run [balena-versionist](https://github.com/product-os/balena-versionist) directly on the PR's source.

If you have [VersionBot3](https://github.com/apps/versionbot3) installed it will be ignored as far as versioning is concerned, so no need to disable it.

### Docs

If you have an `npm run doc` script then it will automatically be run and the generated `docs` folder will be published to a `docs` branch for github pages use.

### Website

If you have docs that you intend to publish on a website, checkout the [Getting Started](https://docusaurus-builder.pages.dev/) section of the Docusaurus builder. The docs will be built using the Docusaurus framework and published on Cloudflare Pages.

If you intend to use a custom framework for your docs build, then you can make use of the custom website build option by adding your desired build command in a input called `custom_website_build`. This command should generate your static site into a folder called `build` which will then be deployed to Cloudflare Pages.

## Help

If you're having trouble getting the project running,
submit an issue or post on the [forums](https://forums.balena.io).

## Contributing

Please open an issue or submit a pull request with any features, fixes, or changes.
