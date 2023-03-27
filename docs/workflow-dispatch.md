# Dispatch Workflows

A collection of [dispatch workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_dispatch).

- [e2e](#e2e)
- [Patch](#patch)

## e2e

Test development branches of Flowzone with a range of repositories to ensure breaking changes aren't introduced.

Execute the [e2e workflow](https://github.com/product-os/flowzone/actions/workflows/e2e.yml)
via the [web browser](https://docs.github.com/en/actions/managing-workflow-runs/manually-running-a-workflow?tool=webui),
or via the [GitHub CLI](https://docs.github.com/en/actions/managing-workflow-runs/manually-running-a-workflow?tool=cli).

```bash
# https://cli.github.com/manual/gh_workflow_run
gh workflow run e2e.yml \
  -f repositories='["balena-io-modules/open-balena-base","balena-io/docs"]' \
  -f flowzone_ref="kyle/dispatch-e2e" \
  -f dry_run=true
```

## Patch

Open pull requests on a list of repositories with changes from one or more patch files.

Using an example repository, generate a set of patches to be applied and encode them with base64.

```bash
# https://git-scm.com/docs/git-format-patch
git format-patch -k --stdout origin/master | base64 -w0
```

Execute the [Patch workflow](https://github.com/product-os/flowzone/actions/workflows/patch.yml)
via the [web browser](https://docs.github.com/en/actions/managing-workflow-runs/manually-running-a-workflow?tool=webui),
or via the [GitHub CLI](https://docs.github.com/en/actions/managing-workflow-runs/manually-running-a-workflow?tool=cli).

```bash
# https://cli.github.com/manual/gh_workflow_run
gh workflow run patch.yml \
    -f repositories='["balena-io-modules/open-balena-base","balena-io/docs"]' \
    -f patches_base64="$(cat /tmp/patches.b64)" \
    -f pr_branch="kyle/patch" \
    -f pr_title="Prevent duplicate Flowzone workflow executions" \
    -f pr_body="[skip ci]" \
    -f dry_run=true
```
