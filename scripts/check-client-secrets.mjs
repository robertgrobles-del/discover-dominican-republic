import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const assetsDir = path.resolve("dist/assets");
const forbiddenEnvNames = Object.keys(process.env).filter((name) =>
  /^VITE_.*(SERVICE_ROLE|SECRET|PRIVATE|SIGNING_KEY)/i.test(name),
);

if (forbiddenEnvNames.length > 0) {
  console.error(`Private environment variables use the public VITE_ prefix: ${forbiddenEnvNames.join(", ")}`);
  process.exit(1);
}

async function findFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? findFiles(fullPath) : [fullPath];
  }));
  return nested.flat();
}

const bundleFiles = await findFiles(assetsDir);
const findings = [];

for (const file of bundleFiles) {
  const contents = await readFile(file, "utf8");
  if (/SUPABASE_SERVICE_ROLE_KEY|SERVICE_ROLE_KEY/i.test(contents)) {
    findings.push(`${path.relative(process.cwd(), file)}: service-role key name`);
  }

  for (const match of contents.matchAll(/\beyJ[a-zA-Z0-9_-]{8,}\.[a-zA-Z0-9_-]{8,}\.[a-zA-Z0-9_-]{8,}\b/g)) {
    try {
      const payload = JSON.parse(Buffer.from(match[0].split(".")[1], "base64url").toString("utf8"));
      if (payload.role === "service_role") {
        findings.push(`${path.relative(process.cwd(), file)}: service-role JWT`);
      }
    } catch {
      // Other JWT-like strings are not service-role credentials.
    }
  }
}

if (findings.length > 0) {
  console.error(`Potential service credentials found in the frontend bundle:\n${findings.join("\n")}`);
  process.exit(1);
}

console.log(`Client bundle secret scan passed (${bundleFiles.length} assets).`);
