import fs from 'fs';
import path from 'path';

const TARGET_DIR = 'src-tauri/target';
const VERSION = process.env.VERSION?.replace(/^v/, '');
const NOTES = process.env.RELEASE_BODY || 'Update available.';
// Release assets are published under the app-v__VERSION__ tag (see release.yml)
const BASE_URL = `https://github.com/dmitriyg0r/ai-uml-builder/releases/download/app-v${VERSION}`;

// Walk all files under a directory
const walkFiles = (dir) => {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...walkFiles(full));
    } else {
      result.push(full);
    }
  }
  return result;
};

// Map Tauri targets to updater platform keys
const platformMap = {
  darwin: process.arch === 'arm64' ? 'darwin-aarch64' : 'darwin-x86_64',
  linux: 'linux-x86_64',
  win32: 'windows-x86_64',
};

function loadExistingLatest() {
  if (fs.existsSync('latest.json')) {
    try {
      const parsed = JSON.parse(fs.readFileSync('latest.json', 'utf-8'));
      if (parsed && typeof parsed === 'object' && parsed.platforms) {
        return parsed;
      }
    } catch (e) {
      console.warn('Existing latest.json is invalid, will regenerate');
    }
  }
  return {
    version: VERSION,
    notes: NOTES,
    pub_date: new Date().toISOString(),
    platforms: {},
  };
}

async function main() {
  if (!VERSION) {
    console.error('Error: VERSION env var is missing');
    process.exit(1);
  }

  const currentPlatform = platformMap[process.platform];
  if (!currentPlatform) {
    console.log(`Skipping latest.json gen: unknown platform ${process.platform}`);
    return;
  }

  let searchExt = '';
  if (process.platform === 'darwin') searchExt = '.app.tar.gz';
  if (process.platform === 'win32') searchExt = '.zip'; // nsis updater default
  if (process.platform === 'linux') searchExt = '.AppImage.tar.gz';

  const files = walkFiles(TARGET_DIR).filter((f) => f.includes(`${path.sep}release${path.sep}bundle${path.sep}`));
  const sigFile = files.find((f) => f.endsWith(`${searchExt}.sig`));

  if (!sigFile) {
    console.error(`No signature file found for ${searchExt}.sig under ${TARGET_DIR}`);
    console.log('Files found:', files);
    process.exit(1);
  }

  const signature = fs.readFileSync(sigFile, 'utf-8').trim();
  const assetName = path.basename(sigFile, '.sig'); // e.g. app.tar.gz
  const url = `${BASE_URL}/${assetName}`;

  const latest = loadExistingLatest();
  latest.version = VERSION;
  latest.notes = NOTES;
  latest.pub_date = new Date().toISOString();
  latest.platforms[currentPlatform] = { signature, url };

  fs.writeFileSync('latest.json', JSON.stringify(latest, null, 2));
  console.log(`latest.json updated for ${currentPlatform}`);
}

main();
