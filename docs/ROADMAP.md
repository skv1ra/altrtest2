# Product roadmap

## Current production foundation

The current codebase provides Supabase authentication and server-authoritative data, conversation import parsers, editable memory, the Altr Twin draft MVP, Lemon Squeezy billing, export/deletion, security hardening, legal/consent surfaces, accessibility improvements and automated testing.

Account configuration, final legal review and manual production validation are still required. The phases below are future work and are **not complete**.

## Phase A — Gmail OAuth and incremental sync

- Add dedicated Gmail OAuth scopes and consent.
- Store and rotate provider tokens securely.
- Implement incremental sync, revocation, deletion and audit behavior.
- Keep Google sign-in separate from Gmail mailbox access.

## Phase B — Telegram/WhatsApp/Meta import improvements

- Improve export guidance, format coverage, deduplication and large-import UX.
- Add provider-specific normalization and provenance.
- Do not claim direct live API sync until approved APIs and permissions exist.

## Phase C — Google Calendar

- Add Calendar OAuth, scoped read/write permissions and token lifecycle.
- Build availability/context features with explicit user control.
- Require confirmation before any calendar mutation.

## Phase D — Operator task extraction and approval workflow

- Extract proposed tasks from approved data.
- Show evidence, confidence, owner and due-date suggestions.
- Require explicit approval before creating or executing any task.

## Phase E — Negotiator rules and controlled proposal generation

- Define user-controlled negotiation constraints and prohibited actions.
- Generate proposals as reviewable drafts with provenance.
- Prevent autonomous commitments, payments, contracts or message sending.

## Phase F — team workspace, roles, shared memory and audit logs

- Add organizations, invitations, roles and least-privilege permissions.
- Separate personal and shared memory.
- Add tenant isolation, administrative controls and complete audit history.
- Perform a new security, privacy and legal review before release.