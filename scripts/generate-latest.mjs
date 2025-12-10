import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ARTIFACTS_DIR = 'src-tauri/target/release/bundle';
const VERSION = process.env.VERSION?.replace(/^v/, '');
const NOTES = process.env.RELEASE_BODY || 'Update available.';
const BASE_URL = `https://github.com/dmitriyg0r/ai-uml-builder/releases/download/v${VERSION}`;

async function main() {
  if (!VERSION) {
    console.error('Error: VERSION env var is missing');
    process.exit(1);
  }

  const latest = {
    version: VERSION,
    notes: NOTES,
    pub_date: new Date().toISOString(),
    platforms: {},
  };

  // Helper to find file recursively (simple version for specific structure)
  const findFile = (dir, ext) => {
    if (!fs.existsSync(dir)) return null;
    const files = fs.readdirSync(dir, { recursive: true });
    return files.find(f => f.endsWith(ext));
  };

  // Map Tauri targets to Updater platforms
  // We assume we are running on the OS that built the artifacts
  const platformMap = {
    'darwin': process.arch === 'arm64' ? 'darwin-aarch64' : 'darwin-x86_64',
    'linux': 'linux-x86_64',
    'win32': 'windows-x86_64'
  };
  
  const currentPlatform = platformMap[process.platform];
  if (!currentPlatform) {
    console.log(`Skipping latest.json gen: unknown platform ${process.platform}`);
    return;
  }

  // Find signature file (.sig)
  // Tauri v2 usually outputs .app.tar.gz and .app.tar.gz.sig for macOS updater
  // Windows: .zip and .zip.sig (nsis)
  // Linux: .AppImage.tar.gz and .sig
  
  let searchExt = '';
  if (process.platform === 'darwin') searchExt = '.app.tar.gz';
  if (process.platform === 'win32') searchExt = '.zip'; // nsis updater
  if (process.platform === 'linux') searchExt = '.AppImage.tar.gz';

  // We search in 'macos', 'nsis', 'deb' folders typically, but recursive search handles it
  const sigFileRel = findFile(ARTIFACTS_DIR, `${searchExt}.sig`);
  
  if (sigFileRel) {
    const sigPath = path.join(ARTIFACTS_DIR, sigFileRel);
    const signature = fs.readFileSync(sigPath, 'utf-8').trim();
    
    // The asset URL
    const assetName = path.basename(sigFileRel, '.sig'); // e.g. app.tar.gz
    const url = `${BASE_URL}/${assetName}`;

    latest.platforms[currentPlatform] = {
      signature,
      url
    };

    console.log(`Generated entry for ${currentPlatform}`);
    console.log(`URL: ${url}`);
    
    fs.writeFileSync('latest.json', JSON.stringify(latest, null, 2));
    console.log('latest.json created.');
  } else {
    console.error(`No signature file found for extension ${searchExt}.sig in ${ARTIFACTS_DIR}`);
    // List files to debug
    try {
        const allFiles = fs.readdirSync(ARTIFACTS_DIR, { recursive: true });
        console.log('Available files:', allFiles);
    } catch (e) {}
  }
}

main();
