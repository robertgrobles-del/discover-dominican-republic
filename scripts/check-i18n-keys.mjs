import { readFileSync } from "node:fs";

const locales = ["en", "fr", "de", "pt", "it"];
const readKeys = (locale) => {
  const source = readFileSync(new URL(`../src/i18n/translations/${locale}.ts`, import.meta.url), "utf8");
  return new Set([...source.matchAll(/^\s*"([^"]+)"\s*:/gm)].map((match) => match[1]));
};

const base = readKeys("es");
const failures = [];
for (const locale of locales) {
  const missing = [...base].filter((key) => !readKeys(locale).has(key));
  if (missing.length) failures.push(`${locale}: ${missing.length} missing translation key(s), e.g. ${missing.slice(0, 5).join(", ")}`);
}

if (failures.length) {
  console.error(`Translation coverage check failed. ${failures.join("; ")}`);
  process.exitCode = 1;
} else {
  console.log(`Translation key parity verified across ${locales.length + 1} locales (${base.size} keys).`);
}
