# Issue Tracking & Sprint Tracking Guide

## Overview

This document defines how the team tracks work: issues, sprints, and reporting.  
The primary issue tracker is: **[GitHub Issues / Jira / Linear / Azure DevOps — update this]**

---

## 1. Issue Types

| Type | When to Use | Label |
|---|---|---|
| Feature | New functionality from a user story | `type: feature` |
| Bug | Something is broken and not working as intended | `type: bug` |
| Chore | Non-functional work: dependency updates, refactors, CI | `type: chore` |
| Spike | Research or prototyping with a time-boxed goal | `type: spike` |
| Documentation | Documentation-only change | `type: docs` |

---

## 2. Issue Labels

### Priority

| Label | Meaning |
|---|---|
| `priority: critical` | Blocking — must be resolved immediately |
| `priority: high` | Must be in the current sprint |
| `priority: medium` | Planned for a near sprint |
| `priority: low` | Backlog; schedule when capacity allows |

### Status

| Label | Meaning |
|---|---|
| `status: backlog` | Not yet scheduled |
| `status: ready` | Groomed, estimated, and ready to pull |
| `status: in-progress` | Actively being worked |
| `status: in-review` | PR open, awaiting review |
| `status: blocked` | Cannot progress — reason in comments |
| `status: done` | Merged and verified |

---

## 3. Issue Template

When creating an issue, include:

**For Features / Stories:**
```
## Summary
[One sentence: what does this implement?]

## Linked Story
US-NNN

## Acceptance Criteria
- [ ] AC-1
- [ ] AC-2

## Definition of Done
- [ ] Code written and reviewed
- [ ] Tests added and passing
- [ ] Documentation updated (if needed)
- [ ] CI green
```

**For Bugs:**
```
## Summary
[One sentence describing the bug]

## Steps to Reproduce
1. 
2. 
3. 

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- Version / commit:
- OS / Browser:
- User role:

## Severity
[Critical / High / Medium / Low]

## Logs / Screenshots
[Attach if available]
```

---

## 4. Sprint Workflow

### Before Sprint Starts (Sprint Planning)
1. PM and Tech Lead review and prioritize the backlog.
2. Team estimates unestimated stories (Planning Poker or T-shirt sizes).
3. Sprint goal is agreed.
4. Issues are assigned to the sprint and to team members.
5. Acceptance criteria are confirmed for all selected stories.

### During Sprint
- Daily stand-up: What did I do? What will I do? Any blockers?
- Update issue status labels as work progresses.
- Flag blockers immediately in stand-up and/or in the issue thread.
- Raise new issues as discovered (estimate and prioritize before pulling into sprint).

### Sprint Review (Last Day of Sprint)
- Demo completed work to stakeholders.
- Accept or reject stories based on acceptance criteria.
- Rejected stories return to the backlog with feedback.

### Sprint Retrospective
- Format: What went well? What could be improved? What actions will we take?
- Actions are tracked as issues with owner and due date.

---

## 5. Definition of Ready (DoR)

A story is ready to be pulled into a sprint when:
- [ ] It has a clear description and acceptance criteria.
- [ ] It is estimated (story points assigned).
- [ ] Dependencies are identified and unblocked.
- [ ] UX designs are available (for UI stories).
- [ ] Tech Lead has confirmed feasibility.

---

## 6. Definition of Done (DoD)

A story is done when:
- [ ] All acceptance criteria are met.
- [ ] Code is reviewed and merged to `develop`.
- [ ] All tests pass in CI (unit, integration).
- [ ] Code coverage threshold maintained.
- [ ] No new linting warnings.
- [ ] Relevant documentation updated.
- [ ] QA has verified in staging (for P1/P2 stories).

---

## 7. Velocity Tracking

| Sprint | Committed | Completed | Notes |
|---|---|---|---|
| Sprint 1 | | | |
| Sprint 2 | | | |
| Sprint 3 | | | |

Velocity = story points completed per sprint (rolling 3-sprint average for planning).

---

## 8. Escalation Path

| Issue | First Contact | Escalate To |
|---|---|---|
| Technical blocker | Tech Lead | CTO / Architecture Board |
| Scope / requirements gap | BA Lead | Project Manager |
| Resource unavailability | PM | Sponsor |
| Production incident | On-call DevOps | Runbook → Engineering Lead |
