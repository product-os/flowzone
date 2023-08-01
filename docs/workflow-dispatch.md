# Dispatch Workflows

A collection of [dispatch workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_dispatch).

- [Patch](#patch)

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

The same could also be accomplished with this similar tool: <https://github.com/duolingo/pulldozer>
