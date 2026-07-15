# OpenAI setup

## Completed in code

Altr uses the OpenAI Responses API for draft generation and `text-embedding-3-small` with 1536 dimensions for memory retrieval. Calls are server-only. Imported messages and memories are treated as untrusted reference data, never instructions. The current product creates drafts only and does not send messages or execute tasks.

## Account-owner setup

1. Create or select an OpenAI API project.
2. Add billing and usage limits appropriate for Test/Preview and Production.
3. Create a restricted API key for the Altr server environment.
4. Configure the API key, response model and embedding model in the appropriate environment scope.
5. Keep the embedding model set to `text-embedding-3-small`. A different dimension requires a reviewed database migration and re-embedding plan.
6. Redeploy after changing server environment values.
7. Run `yarn verify:ai-env` and `yarn verify:production` with production configuration.
8. Test draft generation, memory extraction, quota errors, provider-unavailable behavior and prompt-injection fixtures.
9. Review provider data-use, retention, region and organization access settings before launch.
10. Monitor usage, latency, error rates and cost after deployment.

## Failure behavior

Without a configured key, AI routes return a controlled unavailable response; they must not return fake drafts. Empty or malformed model output is rejected. Monthly plan quotas are enforced before generation.

## Not implemented

Operator task execution, Negotiator proposals, Gmail sync, Calendar actions and automatic message sending are future roadmap capabilities. This setup does not make them complete.