# Flowzone

![ridiculous logo about hating and flowing](./docs/images/logo.png)

Reusable, opinionated, zero-conf workflows for GitHub actions

## Contents

- [Flowzone](#flowzone)
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
  - [Customization](#customization)
    - [Secrets](#secrets)
      - [`GH_APP_PRIVATE_KEY`](#gh_app_private_key)
      - [`FLOWZONE_TOKEN`](#flowzone_token)
      - [`NPM_TOKEN`](#npm_token)
      - [`DOCKERHUB_USER`](#dockerhub_user)
      - [`DOCKERHUB_TOKEN`](#dockerhub_token)
      - [`BALENA_API_KEY`](#balena_api_key)
      - [`PYPI_TOKEN`](#pypi_token)
      - [`PYPI_TEST_TOKEN`](#pypi_test_token)
      - [`CARGO_REGISTRY_TOKEN`](#cargo_registry_token)
      - [`COMPOSE_VARS`](#compose_vars)
      - [`CUSTOM_JOB_SECRET_1`](#custom_job_secret_1)
      - [`CUSTOM_JOB_SECRET_2`](#custom_job_secret_2)
      - [`CUSTOM_JOB_SECRET_3`](#custom_job_secret_3)
    - [Inputs](#inputs)
      - [`aws_region`](#aws_region)
      - [`aws_iam_role`](#aws_iam_role)
      - [`cloudformation_templates`](#cloudformation_templates)
      - [`app_id`](#app_id)
      - [`installation_id`](#installation_id)
      - [`token_scope`](#token_scope)
      - [`runs_on`](#runs_on)
      - [`custom_runs_on`](#custom_runs_on)
      - [`docker_runs_on`](#docker_runs_on)
      - [`jobs_timeout_minutes`](#jobs_timeout_minutes)
      - [`working_directory`](#working_directory)
      - [`docker_images`](#docker_images)
      - [`bake_targets`](#bake_targets)
      - [`docker_invert_tags`](#docker_invert_tags)
      - [`docker_publish_platform_tags`](#docker_publish_platform_tags)
      - [`balena_environment`](#balena_environment)
      - [`balena_slugs`](#balena_slugs)
      - [`cargo_targets`](#cargo_targets)
      - [`rust_binaries`](#rust_binaries)
      - [`rust_toolchain`](#rust_toolchain)
      - [`pseudo_terminal`](#pseudo_terminal)
      - [`protect_branch`](#protect_branch)
      - [`repo_config`](#repo_config)
      - [`repo_allow_forking`](#repo_allow_forking)
      - [`repo_default_branch`](#repo_default_branch)
      - [`repo_delete_branch_on_merge`](#repo_delete_branch_on_merge)
      - [`repo_allow_update_branch`](#repo_allow_update_branch)
      - [`repo_description`](#repo_description)
      - [`repo_homepage`](#repo_homepage)
      - [`repo_enable_auto_merge`](#repo_enable_auto_merge)
      - [`repo_enable_issues`](#repo_enable_issues)
      - [`repo_enable_merge_commit`](#repo_enable_merge_commit)
      - [`repo_enable_projects`](#repo_enable_projects)
      - [`repo_enable_rebase_merge`](#repo_enable_rebase_merge)
      - [`repo_enable_squash_merge`](#repo_enable_squash_merge)
      - [`repo_enable_wiki`](#repo_enable_wiki)
      - [`repo_visibility`](#repo_visibility)
      - [`disable_versioning`](#disable_versioning)
      - [`required_approving_review_count`](#required_approving_review_count)
      - [`required_status_checks`](#required_status_checks)
      - [`github_prerelease`](#github_prerelease)
      - [`restrict_custom_actions`](#restrict_custom_actions)
      - [`custom_test_matrix`](#custom_test_matrix)
      - [`custom_publish_matrix`](#custom_publish_matrix)
      - [`custom_finalize_matrix`](#custom_finalize_matrix)
      - [`cloudflare_website`](#cloudflare_website)
      - [`docusaurus_website`](#docusaurus_website)
      - [`toggle_auto_merge`](#toggle_auto_merge)
  - [Testing](#testing)
  - [Help](#help)
  - [Contributing](#contributing)

## Getting Started

Open a PR with the following changes to test and enable Flowzone:

1. Create `.github/workflows/flowzone.yml` (see [Usage](#usage)) in a new Draft Pull Request to avoid changing branch protection rules.
2. Ensure your `package.json`, `docker-compose.test.yml`, `balena.yml`, etc. contain correct information and all tests are passing.
3. Mark the Pull Request as Ready for Review and re-run the checks via the Checks or Actions panel. New branch protection rules will be applied and this requires admin access to revert!
4. Seek approval or self-certify!

## Usage

Workflows that call reusable workflows in the same organization or enterprise can use the inherit keyword to implicitly pass the secrets.

```yml
# .github/workflows/flowzone.yml
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
    secrets: inherit
    with: ... # see inputs
```

Otherwise specify the repository secrets to pass into Flowzone.

```yml
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
    secrets:
      FLOWZONE_TOKEN: ${{ secrets.FLOWZONE_TOKEN }}
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
      DOCKERHUB_USER: ${{ secrets.DOCKERHUB_USER }}
      DOCKERHUB_TOKEN: ${{ secrets.DOCKERHUB_TOKEN }}
      BALENA_API_KEY: ${{ secrets.BALENA_API_KEY }}
    with: ... # see inputs
```

Flowzone will automatically select an appropriate runner based on your project's code.

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
- Custom actions are disabled for external contributors by default and can be [enabled](#restrict_custom_actions) after the custom action has been vetted to not leak secrets to untrusted code.

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

If you need to provide environment variables to the compose environment you can add a repository secret called [`COMPOSE_VARS`](#compose_vars) that should be a base64 encoded `.env` file.
This will be decoded and written to a `.env` file inside the test worker at runtime.

> **WARNING**: The `COMPOSE_VARS` secret is not well protected from leaking and we recommend alternate methods where possible.
> See <https://github.com/product-os/flowzone/issues/236>.

To enable publishing of Docker artifacts set the [`docker_images`](#docker_images) input to correct value of docker image repositories without tags - eg `ghcr.io/product-os/flowzone`.

For advanced Docker build options, including multi-arch, add one or more [Docker bake files](https://docs.docker.com/build/customize/bake/file-definition/) to your project.

To publish multiple image variants, set the [`bake_targets`](#bake_targets) input to the name of each target in the Docker bake file(s).
All targets except `default` will have the target name prefixed to the tags - eg. `v1.2.3`, `debug-v1.2.3`.

An example of multiple bake targets can be found here: <https://github.com/balena-io-modules/open-balena-base/blob/master/docker-bake.hcl>

### balena

If a `balena.yml` file is found in the root of the repository Flowzone will attempt to push draft releases to your fleet's slug(s) and finalize on merge.

This will **require** either your organization or your repository to have a balenaCloud API key set as a secret named `BALENA_API_KEY`. If you intend to set the secret at the org level then make sure that the API key is valid for all repositories in that organization. A repository-level secret will override an organization-level secret. This API key will be used to login into balena-cli and push draft releases to your fleet in balenaCloud.

To disable publishing of releases to balenaCloud set [`balena_slugs`](#balena_slugs) to `""`.

Examples:

1. Start with something simple, [balena-python-hello-world](https://github.com/balena-io-examples/balena-python-hello-world/blob/master/.github/workflows/flowzone.yml)
2. Push to multiple fleets, check out [balena-supervisor](https://github.com/balena-os/balena-supervisor/blob/master/.github/workflows/flowzone.yml).

### Python (with Poetry)

Python tests will be run if a `pyproject.toml` file is found in the root of the repository and Poetry is used as a package manager.

Multiple versions (>=3.7, <3.11) of Python will be tested as long as they meet the range in the `pyproject.toml` file.

If your `pyproject.toml` file contains a `packages` property under `[tool.poetry]` tag, this package will also be deployed to [PyPI registry](https://pypi.org/) on master and [PyPI test registry](https://test.pypi.org/) on PRs.

### Rust

If a `Cargo.toml` file is found in the root of the repository, Flowzone will run tests on the code formatting (using `cargo fmt` and `cargo clippy`) and then run tests for a set of target architectures given in [`cargo_targets`](#cargo_targets). In order to disable Rust testing, set the value of that variable to `""`.

For cross building targets, flowzone uses [cross](https://github.com/cross-rs/cross). This also means that further build options (e.g. [pre-build hooks](https://github.com/cross-rs/cross#pre-build-hook)) can be defined by adding a `Cross.toml` file to the local repository.

When [`rust_binaries`](#rust_binaries) is set to `true`, Flowzone will also build release artifacts for each target architecture given in [`cargo_targets`](#cargo_targets) and upload the artifacts to the GitHub release.

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

## Customization

### Secrets

The following secrets should be set by an Owner at the Organization level,
but they can also be [configured for personal repositories](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository).

These secrets can also be found at the top of [flowzone.yml](./.github/workflows/flowzone.yml).

#### `GH_APP_PRIVATE_KEY`

GitHub App's private key to generate ephemeral access tokens.

Not required, but preferred.

#### `FLOWZONE_TOKEN`

Personal access token (PAT) for the GitHub service account with admin/owner permissions.

#### `NPM_TOKEN`

The npm auth token to use for publishing.

Required for [npm](#npm) projects.

#### `DOCKERHUB_USER`

Username to publish to the Docker Hub container registry.

Required for [Docker](#docker) projects.

#### `DOCKERHUB_TOKEN`

A [personal access token](https://docs.docker.com/docker-hub/access-tokens/) to publish to the Docker Hub container registry.

Required for [Docker](#docker) projects.

#### `BALENA_API_KEY`

[API key](https://www.balena.io/docs/learn/manage/account/#api-keys) for pushing releases to balena applications.

Required for [balena](#balena) projects.

#### `PYPI_TOKEN`

[API key](https://pypi.org/help/#apitoken) for pushing releases to PyPI applications.

Used for [python](#python-with-poetry) projects.

#### `PYPI_TEST_TOKEN`

[API key](https://pypi.org/help/#apitoken) for pushing releases to test PyPI applications.

Used for [python](#python-with-poetry) PR artifacts.

#### `CARGO_REGISTRY_TOKEN`

[API token](https://doc.rust-lang.org/cargo/reference/publishing.html) for publishing a library into a cargo registry.

Publishing to a cargo registry will be skipped if the token is empty.

#### `COMPOSE_VARS`

Optional base64 encoded docker-compose `.env` file for testing [Docker](#docker) projects.

> **WARNING**: The `COMPOSE_VARS` secret is not well protected from leaking and we recommend alternate methods where possible.
> See <https://github.com/product-os/flowzone/issues/236>.

#### `CUSTOM_JOB_SECRET_1`

Optional secret for use with [Custom](#custom) jobs.

#### `CUSTOM_JOB_SECRET_2`

Optional secret for use with [Custom](#custom) jobs.

#### `CUSTOM_JOB_SECRET_3`

Optional secret for use with [Custom](#custom) jobs.

### Inputs

These inputs are all optional and include some opinionated defaults.
They can also be found at the top of [flowzone.yml](./.github/workflows/flowzone.yml).

#### `aws_region`

AWS region with GitHub OIDC provider IAM configuration.

Type: _string_

Default: `"${{ vars.AWS_REGION || '' }}"`

#### `aws_iam_role`

AWS IAM role ARN to assume with GitHub OIDC provider.

Type: _string_

Default: `"${{ vars.AWS_IAM_ROLE || '' }}"`

#### `cloudformation_templates`

AWS CloudFormation templates to deploy.

Type: _string_

Example:

```json
{
  "stacks": [
    {
      "name": "foo-bar",
      "template": "aws/foo/bar.yaml",
      "params": [
        "var=${{ vars.VERBOSE }}",
        "secret=${{ secrets.GITHUB_TOKEN }} ",
        "static=foo-bar"
      ],
      "tags": ["Name=foo", "Environment=bar"],
      "capabilities": ["CAPABILITY_IAM", "CAPABILITY_NAMED_IAM"]
    }
  ]
}
```

Default: ``

#### `app_id`

GitHub App id to generate ephemeral access tokens.

Type: _string_

Default: `"${{ vars.APP_ID || '291899' }}"`

#### `installation_id`

GitHub App installation id, if installed in a different organisation.

Type: _string_

Default: `"${{ vars.INSTALLATION_ID || '34040165' }}"`

#### `token_scope`

Subset from permissions granted to the GitHub App, see [list](https://docs.github.com/en/rest/apps/apps?apiVersion=2022-11-28#create-a-scoped-access-token).

Type: _string_

Default:

```json
{
  "actions": "read",
  "administration": "write",
  "checks": "read",
  "contents": "write",
  "members": "read",
  "metadata": "read",
  "organization_secrets": "read",
  "packages": "write",
  "pages": "write",
  "pull_requests": "read",
  "secrets": "read",
  "statuses": "read",
  "workflows": "read"
}
```

#### `runs_on`

JSON array of runner label strings for generic jobs.

Type: _string_

Default: `["ubuntu-22.04"]`

#### `custom_runs_on`

JSON 2-dimensional matrix of runner label strings for custom jobs.

Type: _string_

Default: `[["ubuntu-22.04"]]`

#### `docker_runs_on`

JSON key-value pairs mapping platforms to arrays of runner labels. Unlisted platforms will use `runs_on`.

Type: _string_

Default: `{}`

#### `jobs_timeout_minutes`

Job(s) timeout.

Type: _number_

Default: `360`

#### `working_directory`

GitHub actions working directory.

Type: _string_

Default: `.`

#### `docker_images`

Comma-delimited string of Docker images (without tags) to publish (skipped if empty).

Type: _string_

Default: `''`

#### `bake_targets`

Comma-delimited string of Docker buildx bake targets to publish (skipped if empty).

Type: _string_

Default: `default`

#### `docker_invert_tags`

Invert the tags for the Docker images (e.g. `{tag}-{variant}` becomes `{variant}-{tag}`)

Type: _boolean_

Default: `false`

#### `docker_publish_platform_tags`

Publish platform-specific tags in addition to multi-arch manifests (e.g. `product-os/flowzone:latest-amd64`)

Type: _boolean_

Default: `false`

#### `balena_environment`

Alternative balenaCloud environment (e.g. balena-staging.com)

Type: _string_

Default: `balena-cloud.com`

#### `balena_slugs`

Comma-delimited string of balenaCloud apps, fleets, or blocks to deploy (skipped if empty).

Type: _string_

Default: `''`

#### `cargo_targets`

Comma-delimited string of Rust stable targets to publish (skipped if empty).

Type: _string_

Default: `'aarch64-unknown-linux-gnu,armv7-unknown-linux-gnueabi,arm-unknown-linux-gnueabihf,x86_64-unknown-linux-gnu,i686-unknown-linux-gnu'`

#### `rust_binaries`

Set to true to publish Rust binary artifacts to GitHub.

Type: _boolean_

Default: `true`

#### `rust_toolchain`

Version specifier (e.g. 1.65, stable, nigthly) for the toolchain to use when building Rust sources.

Type: _string_

Default: `'stable'`

#### `pseudo_terminal`

Set to true to enable terminal emulation for test steps (under `npm_test` and `python_tests`). This wraps the test call with the `script` command so test commands that rely on a terminal feature (e.g. terminal colors) can work as they would in a development environment. This only works with ubuntu runners.

Type: _boolean_

Default: `false`

#### `protect_branch`

Set to false to disable updating branch protection rules after a successful run. Rules are not applied for draft pull requests.

Type: _boolean_

Default: `true`

#### `repo_config`

Set to true to standardise repository settings after a successful run.

Type: _boolean_

Default: `false`

#### `repo_allow_forking`

Allow forking of an organization repository.

Type: _boolean_

Default: `true`

#### `repo_default_branch`

Set the default branch name for the repository.

Type: _string_

Default: `master`

#### `repo_delete_branch_on_merge`

Delete head branch when pull requests are merged.

Type: _boolean_

Default: `true`

#### `repo_allow_update_branch`

Always suggest updating pull request branches.

Type: _boolean_

Default: `true`

#### `repo_description`

Description of the repository.

Type: _string_

Default: `''`

#### `repo_homepage`

Repository home page URL.

Type: _string_

Default: `''`

#### `repo_enable_auto_merge`

Enable auto-merge functionality.

Type: _boolean_

Default: `true`

#### `repo_enable_issues`

Enable issues in the repository.

Type: _boolean_

Default: `true`

#### `repo_enable_merge_commit`

Enable merging pull requests via merge commit.

Type: _boolean_

Default: `true`

#### `repo_enable_projects`

Enable projects in the repository.

Type: _boolean_

Default: `false`

#### `repo_enable_rebase_merge`

Enable merging pull requests via rebase.

Type: _boolean_

Default: `false`

#### `repo_enable_squash_merge`

Enable merging pull requests via squashed commit.

Type: _boolean_

Default: `false`

#### `repo_enable_wiki`

Enable wiki in the repository.

Type: _boolean_

Default: `false`

#### `repo_visibility`

Change the visibility of the repository to {public,private,internal}.

Type: _string_

Default: `default`

#### `disable_versioning`

Set to true to disable automatic versioning.

Type: _boolean_

Default: `false`

#### `required_approving_review_count`

Count of GitHub approved reviews required for Pull Requests to be merged.
Set to 0 if using [policy-bot](https://github.com/palantir/policy-bot) for PR merge conditions.
Skipped if [protect_branch](#protect_branch) is false.

Type: _string_

Default: `'0'`

#### `required_status_checks`

JSON array of status checks that must pass before a Pull Requests can be merged.
Skipped if [protect_branch](#protect_branch) is false.

Type: _string_

Default: `["Flowzone / Protect branch","policy-bot: master"]`

#### `github_prerelease`

Make GitHub release final on merge.

Type: _boolean_

Default: `false`

#### `restrict_custom_actions`

Do not execute custom actions for external contributors. Only remove this restriction if custom actions have been vetted as secure.

Type: _boolean_

Default: `true`

#### `custom_test_matrix`

Comma-delimited string of values that will be passed to the custom test action.

Type: _string_

Default: `''`

#### `custom_publish_matrix`

Comma-delimited string of values that will be passed to the custom publish action.

Type: _string_

Default: `''`

#### `custom_finalize_matrix`

Comma-delimited string of values that will be passed to the custom finalize action.

Type: _string_

Default: `''`

#### `cloudflare_website`

Setting this to your existing CF pages project name will generate and deploy a website. Skipped if empty.

Type: _string_

Default: `""`

#### `docusaurus_website`

Set to false to disable building a docusaurus website. If false the script `npm run deploy-docs` will be run if it exists.

Type: _string_

Default: true

#### `toggle_auto_merge`

Set to false to disable toggling auto-merge on PRs.

Type: _boolean_

Default: true

## Testing

There is a dispatch workflow to test development branches of Flowzone with a range of repositories to ensure breaking changes aren't introduced.

See [docs/workflow-dispatch.md#e2e](docs/workflow-dispatch.md#e2e) for more information.

## Help

If you're having trouble getting the project running,
submit an issue or post on the forums at <https://forums.balena.io>.

## Contributing

Please open an issue or submit a pull request with any features, fixes, or changes.
