const required = ["OPENAI_API_KEY", "OPENAI_RESPONSE_MODEL", "OPENAI_EMBEDDING_MODEL"];
const missing = required.filter((name) => !process.env[name]?.trim());

if (missing.length) {
  console.error(`Missing required production AI environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

if (process.env.OPENAI_EMBEDDING_MODEL !== "text-embedding-3-small") {
  console.error("OPENAI_EMBEDDING_MODEL requires a documented database dimension migration before deployment.");
  process.exit(1);
}

console.log("AI production environment is configured.");
