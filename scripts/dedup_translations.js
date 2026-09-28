import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, '..', 'src', 'i18n', 'translations');
const files = ['es.ts', 'en.ts', 'fr.ts', 'de.ts', 'it.ts', 'pt.ts'];

for (const file of files) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) continue;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  
  const seenKeys = new Set();
  const duplicateKeys = new Set();
  const outputLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^\s*"([^"]+)"\s*:/);
    if (match) {
      const key = match[1];
      if (seenKeys.has(key)) {
        duplicateKeys.add(key);
        // Skip duplicate line
        continue;
      }
      seenKeys.add(key);
    }
    outputLines.push(line);
  }
  
  console.log(`File ${file}: Total unique keys: ${seenKeys.size}, Removed duplicates: ${duplicateKeys.size}`);
  if (duplicateKeys.size > 0) {
    console.log(`Duplicates sample in ${file}:`, Array.from(duplicateKeys).slice(0, 10));
    fs.writeFileSync(filePath, outputLines.join('\n'), 'utf8');
    console.log(`Updated ${file} successfully.`);
  }
}
