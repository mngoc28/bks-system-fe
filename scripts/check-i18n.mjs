import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = join(__dirname, "..");
const srcDir = join(rootDir, "src");
const enPath = join(srcDir, "locales", "en.json");
const viPath = join(srcDir, "locales", "vi.json");

function flattenKeys(obj, prefix = "") {
  const keys = new Set();
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const childKeys = flattenKeys(value, fullKey);
      childKeys.forEach((k) => keys.add(k));
    } else {
      keys.add(fullKey);
    }
  }
  return keys;
}

function walkDir(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      if (entry !== "locales" && entry !== "assets") {
        walkDir(fullPath, files);
      }
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractUsedKeys(content) {
  const keys = new Set();
  const patterns = [
    /\bt\(\s*["'`]([a-zA-Z][\w.]*)["'`]/g,
    /\bi18n\.t\(\s*["'`]([a-zA-Z][\w.]*)["'`]/g,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      keys.add(match[1]);
    }
  }
  return keys;
}

const enJson = JSON.parse(readFileSync(enPath, "utf8"));
const viJson = JSON.parse(readFileSync(viPath, "utf8"));
const enKeys = flattenKeys(enJson);
const viKeys = flattenKeys(viJson);

const usedKeys = new Set();
for (const file of walkDir(srcDir)) {
  const content = readFileSync(file, "utf8");
  extractUsedKeys(content).forEach((k) => usedKeys.add(k));
}

function hasKey(keys, key) {
  if (keys.has(key)) return true;
  // i18next plural suffixes: beds -> beds_one / beds_other
  const pluralSuffixes = ["_zero", "_one", "_two", "_few", "_many", "_other"];
  return pluralSuffixes.some((suffix) => keys.has(`${key}${suffix}`));
}

const missingInEn = [...usedKeys].filter((k) => !hasKey(enKeys, k)).sort();
const missingInVi = [...usedKeys].filter((k) => !hasKey(viKeys, k)).sort();
const enOnly = [...enKeys].filter((k) => !viKeys.has(k)).sort();
const viOnly = [...viKeys].filter((k) => !enKeys.has(k)).sort();

let hasError = false;

function report(title, items) {
  if (items.length === 0) return;
  hasError = true;
  console.error(`\n${title} (${items.length}):`);
  items.forEach((k) => console.error(`  - ${k}`));
}

report("Keys used in code but missing in en.json", missingInEn);
report("Keys used in code but missing in vi.json", missingInVi);
report("Keys in en.json but missing in vi.json", enOnly);
report("Keys in vi.json but missing in en.json", viOnly);

if (!hasError) {
  console.log("i18n check passed: all keys are synchronized.");
  process.exit(0);
}

console.error("\ni18n check failed.");
process.exit(1);
