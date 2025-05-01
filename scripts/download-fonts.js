// Download custom fonts script
const fs = require('fs');
const path = require('path');
const https = require('https');

const FONTS_DIR = path.join(__dirname, '..', 'src', 'fonts');
const PUBLIC_FONTS_DIR = path.join(__dirname, '..', 'public', 'fonts');

// Ensure the fonts directories exist
if (!fs.existsSync(FONTS_DIR)) {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
  console.log(`Created fonts directory at ${FONTS_DIR}`);
}

if (!fs.existsSync(PUBLIC_FONTS_DIR)) {
  fs.mkdirSync(PUBLIC_FONTS_DIR, { recursive: true });
  console.log(`Created public fonts directory at ${PUBLIC_FONTS_DIR}`);
}

// Font URLs
const FONT_URLS = {
  'CascadiaMono.woff2': 'https://cdn.jsdelivr.net/gh/microsoft/cascadia-code@main/fonts/CascadiaMono-Regular.woff2',
  'HubotSans.woff2': 'https://github.githubassets.com/resources/font/hubot-sans.woff2',
  'Rowdies-Regular.woff2': 'https://fonts.gstatic.com/s/rowdies/v15/ptRMTieMYPNBAK219hth5O7yKQNute8.woff2'
};

// Download a file
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} to ${destination}...`);
    
    const file = fs.createWriteStream(destination);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode} ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${url}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destination, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

// Download all fonts
async function downloadFonts() {
  console.log('Starting font downloads...');
  
  const downloads = Object.entries(FONT_URLS).map(([filename, url]) => {
    const destination = path.join(FONTS_DIR, filename);
    return downloadFile(url, destination);
  });
  
  try {
    await Promise.all(downloads);
    console.log('All fonts downloaded successfully!');
  } catch (error) {
    console.error('Error downloading fonts:', error);
    process.exit(1);
  }
}

// Run the download
downloadFonts(); 