import packageJson from "@/package.json";

export type PublicVersionInfo = {
  appVersion: string;
  commitSha: string | null;
  buildTime: string | null;
  environment: string;
};

export function getPublicVersionInfo(env: NodeJS.ProcessEnv = process.env): PublicVersionInfo {
  return {
    appVersion: packageJson.version,
    commitSha: env.VERCEL_GIT_COMMIT_SHA ?? null,
    buildTime: env.APP_BUILD_TIME ?? null,
    environment: env.VERCEL_ENV ?? env.NODE_ENV ?? "development",
  };
}
