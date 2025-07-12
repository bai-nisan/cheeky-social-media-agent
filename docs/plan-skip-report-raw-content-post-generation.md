# Plan: Enable Raw Content Based Post Generation (Skip Report)

When `useRawContentForPost` is set to `true`, the **generate-post** node will create social posts directly from the ingested raw content instead of relying on the marketing report.

## Checklist

- [x] Add boolean flag `useRawContentForPost` (default `true`) to agent invocation options and shared LangGraph state.
- [ ] Expose flag in CLI scripts and Agent Inbox / Slack UI.
- [x] Update `src/agents/generate-post/generate-post-state.ts` to include `useRawContentForPost`.
- [x] Modify `src/agents/generate-post/generate-post-graph.ts` to branch:
  - `verifyLinksSubGraph` → `generate-post` when flag is `true`.
  - `verifyLinksSubGraph` → `generate-report` → `generate-post` when flag is `false` (current path).
- [x] Update `generate-post/nodes/generate-post/index.ts` to accept `pageContents` fallback when `report` is undefined.
- [x] Ensure `verify-links` graph outputs `pageContents` field (already available).
- [x] Extend `GENERATE_POST_PROMPT` to read `<content>` tags when `<report>` tags are absent.
- [x] Confirm existing validation prompts still apply; update if necessary. (Validation happens in verifyLinksSubGraph which runs in both paths)
- [x] Write unit tests covering both execution paths (`useRawContentForPost = true | false`).
- [x] Add integration test verifying end-to-end flow with raw content.
- [x] Update documentation (`docs/prompts-flow.md`, README) describing the new option and its usage.
- [x] Regenerate LangGraph manifest (not needed - configuration is file-based) and run full CI pipeline.
- [ ] Notify front-end team to surface the toggle in Agent Inbox UI and Slack. (Pending - requires front-end implementation) 