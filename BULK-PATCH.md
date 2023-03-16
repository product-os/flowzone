# Bulk Patch

Open pull requests on a list of repositories with changes from one or more patch files via
[workflow_dispatch](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_dispatch).

## Usage

Using an example repository, generate a set of patches to be applied and encode them with base64.

```bash
# https://git-scm.com/docs/git-format-patch
git format-patch -k --stdout origin/master | base64 > /tmp/patches.b64
```

Execute the workflow via the [web browser](https://docs.github.com/en/actions/managing-workflow-runs/manually-running-a-workflow?tool=webui),
or via the [GitHub CLI](https://docs.github.com/en/actions/managing-workflow-runs/manually-running-a-workflow?tool=cli).

## Developing

Running a workflow manually via the web browser can only use the workflow from the default branch.

In order to test changes to this workflow in a branch,
you must [use the GitHub CLI](https://cli.github.com/manual/gh_workflow_run) with the `--ref` option.

```bash
# https://cli.github.com/manual/gh_workflow_run
gh workflow run bulk-patch.yml \
    --ref "kyle/bulk-pull-requests" \
    -f patches_base64="$(cat /tmp/patches.b64)" \
    -f repositories="balena-os/balena-raspberrypi" \
    -f token_installation_id="34046907" \
    -f pr_branch="kyle/bulk-patch" \
    -f pr_title="Prevent duplicate Flowzone workflow executions" \
    -f pr_body="[skip ci]" \
    -f dry_run=true
```
