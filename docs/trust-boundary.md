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
| `pull_request` open / sync | **fork** | Build and test with **no secrets** (GitHub withholds them and issues a read-only token). No versioning, no publishes. |
| `pull_request` closed | **fork** | **Vetoed** at the event gate — see [Fork closes do nothing](#fork-closes-do-nothing). |
| `push` | default branch, **fork merge** | **Rebuild + publish + finalize** from the merged (trusted) commit. Where fork contributions publish. |
| `push` | default branch, internal merge | Quiet skip — already finalized on the internal PR's `pull_request` lane. |
| `push` | tags / direct | Trusted release path. **Unchanged.** |
| `push` | **Flowzone itself** | **Vetoed** at the event gate — see [Not re-triggering itself](#not-re-triggering-itself). |
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

## Not re-triggering itself

Adding the `push` trigger means Flowzone reacts to pushes it makes itself. `versioned_source`
pushes the versioned commit with the GitHub App token, and unlike `github.token`, an App token
**does** re-trigger workflows — so the versioned commit re-enters the pipeline.

That run cannot loop: it merged no PR, so `fork_merge` and `push_finalize` are both `false`, the
test jobs skip, and no git ref is written again. It is not harmless, though. The jobs whose `if:`
carries no push-lane gate beyond `trusted == 'true'` — `balena_publish`, `website_publish`, and a
caller's `custom_always` — would run a second time, so a release that already published would
push another balena release and redeploy the Cloudflare Pages site. `versioned_source` would also
re-run versionist and leave orphan commit and tag objects behind.

The `event_types` job's `if:` vetoes it. Every other job has `event_types` in its `needs`
(directly or transitively), so skipping there skips the whole workflow — one place to veto a run.
Two independent signals, because either can be absent:

- `github.event.sender.login != 'flowzone-app[bot]'` — any push made by the App, including
  auto-merge. Does not cover the legacy `FLOWZONE_TOKEN` (PAT) path, where the pusher is a human
  account whose login Flowzone cannot know.
- `!contains(github.event.head_commit.message, 'Flowzone-version-commit:')` — the trailer
  `versioned_source` writes into the versioned commit, so the veto holds whichever credential
  pushed it.

This is deliberately **not** a `[skip ci]` commit directive. GitHub honours skip directives for
every workflow in the repository, not just Flowzone, so vetoing that way also suppressed
downstream pipelines that key deployments off pushes to the default branch (balena-os). A private
trailer that only Flowzone reads keeps the veto scoped to Flowzone and leaves other consumers of
the push running.

## Fork closes do nothing

The same `if:` also vetoes a fork `pull_request` `closed` event, whether the PR merged or not.
GitHub withholds secrets from **every** fork `pull_request` action, including the close, so
`trusted` is `false` on that run and there is no outcome it can reach:

- **Merged.** The work belongs to the fork-merge `push` lane, which starts in parallel and has
  secrets. The close can only recompute what that run computes properly.
- **Not merged.** There is nothing to clean up. A fork never had secrets, so it drafted no
  release or artifact, and `github_clean` / `custom_clean` require `trusted` in any case.

Before the veto, a fork close still spent a run on `versioned_source` (which executed versionist
and then wrote nothing, every App-token step being gated on `trusted`), `octoscan`, `file_list`,
and the `is_*` detectors. `actionlint` and `pre_commit_hooks` already gated themselves out with
`github.event.action != 'closed'`.

`pull_request_target` is excluded from this veto on purpose: its close must still reach the
`Reject pull_request_target events` step and fail loudly, rather than disappear as a skipped run.

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
`docker_publish` pushes — Docker has registry tags, not a draft-vs-final artifact. Custom jobs
likewise run test → publish → finalize on this lane, since a caller's `custom_finalize` may
consume its `custom_publish` output (the action bodies are caller-defined).

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
- **Caller permissions.** No permission change is required. Flowzone declares no `GITHUB_TOKEN`
  permissions the caller must grant, so it never fails the reusable-workflow permissions subset
  check at startup. The push-lane `Classify push merge` lookup needs `pull-requests: read`, but
  it mints an ephemeral Flowzone **app token** for it (scoped `pull-requests: read`) when
  `app_id` is configured — so fork publishing works without the caller granting anything. If the
  app is not configured it falls back to `FLOWZONE_TOKEN`, then `github.token`; if that last
  fallback lacks the scope, fork-merge detection is skipped (a warning is logged) and everything
  else is unaffected.
- **`restrict_custom_actions` is deprecated.** It only existed to keep fork custom code out of
  the trusted `pull_request_target` context; forks now run without secrets, so it has no effect.
  `custom_test` runs on forks; `custom_publish`/`custom_finalize`/`custom_always` are
  trusted-only. Flowzone logs a `::warning::` when the input is set; remove it from callers (it
  will be dropped in a future release).

## Accepted limitations

- Fork PRs cannot run steps that need secrets (private submodules, `COMPOSE_VARS`-backed compose
  tests) during review; the trusted merge lane rebuilds them with credentials.
- Fork publish-path bugs surface at merge, not during review, because forks cannot draft-publish.
- A repo without the `push` trigger gets fork test-only, and will need it once internal
  branches move onto the push lane.
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
