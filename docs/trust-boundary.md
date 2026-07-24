# Flowzone trust boundary

This document describes how Flowzone keeps secrets away from untrusted (fork) code, and how a
fork contribution still builds, tests, and publishes. It is the maintainer-facing companion to
the "External Contributions" section of the [README](../README.md).

## The problem it replaces

Flowzone used to give fork PRs access to secrets via `pull_request_target` plus a review-gate:
a maintainer approved a reaction before merge. Untrusted fork code ran in the base repository's
trusted context — its `GITHUB_TOKEN`, secrets, cache scope, and runner access — with only human
vigilance between a fork and the org's registry, cloud, and deploy credentials. That is the
"pwn request" anti-pattern: a boundary held by a person, not by structure.

The redesign removes `pull_request_target` entirely and makes the trust boundary structural:
**a fork never runs with secrets.** Secrets only ever appear on trusted lanes, selected by
event, not by review.

## One trust boundary per job, selected by event

| Event | Actor | Behaviour |
| --- | --- | --- |
| `pull_request` | internal branch | Full pipeline with secrets; draft on open, finalize on merge. **Unchanged.** |
| `pull_request` | **fork** | Build and test with **no secrets** (GitHub withholds them and issues a read-only token). No versioning, no publishes. |
| `push` | default branch, **fork merge** | **Rebuild + publish + finalize** from the merged (trusted) commit. Where fork contributions publish. |
| `push` | default branch, internal merge | Quiet skip — already finalized on the internal PR's `pull_request` lane. |
| `push` | tags / direct | Trusted release path. **Unchanged.** |
| `pull_request_target` | any | **Rejected** at the event gate. |

The lane is decided in the `event_types` job and exported as outputs the rest of the workflow
gates on:

- `trusted` — `true` on everything except a fork `pull_request`. Secret-consuming jobs and
  steps gate on this so they skip (not fail) on the untrusted fork lane.
- `fork_merge` — `true` when a `push` to the default branch merged a PR that came from a fork.
  Set by the `Classify push merge` step, which looks up the PR associated with the pushed commit
  (`GET /repos/{}/commits/{sha}/pulls`).
- `push_finalize` — `true` for tag pushes and fork merges; gates the finalize path on `push`.
  Internal merges and direct pushes are `false` (no double-publish).

## Why a fork merge rebuilds

A fork's `pull_request` run has no secrets, so it publishes nothing during review. On merge, the
`push` to the default branch runs the **whole pipeline in one run**: the test jobs rebuild from
the merged commit, the publishers push, and the finalize jobs promote. This is structurally
different from the internal flow, which splits work across two runs (open → draft-publish,
merge → finalize).

The rebuild is deliberate. Reusing a fork PR's uploaded artifact would let a fork publish bytes
that do not match its reviewed source, built under its own workflow — a supply-chain break. So
the fork-merge push downloads **same-run** artifacts produced by the rebuild; the cross-run
artifact lookup (`dawidd6/action-download-artifact`, keyed by commit SHA) is used only on the
internal-merge and tag lanes, whose artifact was built in a trusted earlier run.

On this lane there is no reviewer for a "draft", so pure-draft steps are skipped: the GitHub
release is created directly by `github_finalize` (not promoted from a draft), and the npm /
PyPI draft publishes do not run (the finalize jobs publish the final release). Docker keeps
publish + finalize, because `docker_finalize` retags the `build-<sha>` images that
`docker_publish` pushes — Docker has registry tags, not a draft-vs-final artifact.

## The required check, and why `pull_request_target` cannot game it

The required status check is `All jobs`, produced only by the trusted `pull_request` lane. As
defense-in-depth, if a caller is misconfigured to fire Flowzone on both `pull_request` and
`pull_request_target` for one PR, the (rejected) `pull_request_target` run emits a **different,
non-required** context — `All jobs (pull_request_target)` — so it can neither block a valid PR
nor satisfy the gate. A failing same-named check would block a PR permanently ("latest completed
wins" is false), which is why the p_r_t lane must never produce the required context.

## Migration

- **Fork testing** requires a caller change. The previous caller snippet routed fork PRs to
  `pull_request_target` with an `if:` condition, so a fork's `pull_request` invocation was
  filtered out. Flowzone no longer runs on `pull_request_target`, so callers must adopt the new
  [usage](../README.md#usage) snippet — removing the `pull_request_target` trigger and its
  routing `if:` — to send fork PRs to the no-secrets `pull_request` lane.
- **Fork publishing** additionally requires the `push` trigger on the default branch.
- **Internal PRs** are unchanged. A caller that keeps the old `pull_request` +
  `pull_request_target` wiring keeps working for internal PRs: the `pull_request_target`
  invocation is filtered out by the caller `if:` (and if it does run, Flowzone rejects it and
  its `all_jobs` is the non-required per-event context, so it never gates). Removing the dead
  trigger is otherwise a mechanical follow-up.
- **Caller permissions.** Most callers need no permission change. A caller that explicitly pins
  a restrictive `permissions:` block must include `pull-requests: read` — `event_types`
  declares it for the push-merge PR lookup, and a reusable-workflow call fails at startup if the
  caller granted less. Callers that do not pin the permission inherit enough by default.

## Accepted limitations

- Fork PRs cannot run steps that need secrets (private submodules, `COMPOSE_VARS`-backed compose
  tests) during review; the trusted merge lane rebuilds them with credentials.
- Fork publish-path bugs surface at merge, not during review, because forks cannot draft-publish.
- Repos that never add the `push` trigger get fork test-only.
- `push`-merge runs share the default-branch concurrency group with `cancel-in-progress: false`;
  GitHub keeps one pending run per group, so stacked merges can drop a pending publish. Re-run the
  workflow for the affected merge commit.

## Runners

`runs_on` / `docker_runs_on` are caller inputs and Flowzone does not override them. A fork job
may use self-hosted runners **only if they are ephemeral and isolated**: provisioned
just-in-time, torn down per job, with no persistent tool-cache or disk and no reachable internal
network or IAM. The real risk is persistent runner state bridging an untrusted fork job into a
later trusted one. Flowzone cannot enforce this (it is infrastructure config), so it is org
runner-group policy — see [#534](https://github.com/product-os/flowzone/issues/534) — together
with "Require approval for all outside collaborators".

## Auto-merge

Flowzone's auto-merge is internal-only; it needs an app token that the fork lane does not have.
For fork auto-merge, install [bulldozer](https://github.com/palantir/bulldozer) (a GitHub App
that merges on label/config as itself) and add a per-repo `.bulldozer.yml`.

---
Co-authored with Claude
