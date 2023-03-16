# Bulk Patch

Open pull requests on a list of repositories with changes from one or more patch files via
[workflow_dispatch](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_dispatch).

## Usage

Using an example repository, generate a set of patches to be applied and encode them with base64.

```bash
# https://git-scm.com/docs/git-format-patch
git format-patch -k --stdout origin/master | base64 -w0
```

Ask an administrator for the App ID and Installation ID of a GitHub App capable of providing ephemeral app tokens.

Execute the workflow via the [web browser](https://docs.github.com/en/actions/managing-workflow-runs/manually-running-a-workflow?tool=webui),
or via the [GitHub CLI](https://docs.github.com/en/actions/managing-workflow-runs/manually-running-a-workflow?tool=cli).
