# Task Board

## Now
- Measure any remaining setup/main-menu latency after the non-blocking save-load and client-runtime import fixes, especially residual runtime-mode startup overhead
- Smoke the updated setup/startup, trade/compare/history selection flows, team-identity, depth-chart, and `Play`-mode flows in any remaining manual QA scenarios if needed
- Reconcile the feature branch against `origin/main` and keep the parked realism/runtime stash isolated until that work is resolved deliberately

## Next
- Decide whether to restore the parked realism/runtime stash onto a separate branch or continue keeping it isolated
- Add more targeted startup observability if setup/menu latency is still unclear after the non-blocking save-load and client-runtime import fixes
- Extend the search/table-selection pattern to any new admin tools that might surface typed player IDs in future batches
- Reconcile the separate Studio repo deployment docs/templates to the direct-Pages model once that repo is safe to edit

## Later
- Add deeper runtime/backend rollout docs once production infra exists
- Extend project-memory files with system specs and recurring operational checklists
- Promote the client beta to a fuller Studio launch checklist when backend rollout is ready
