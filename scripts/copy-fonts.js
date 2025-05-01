// Script to copy fonts from src/fonts to public/fonts
const fs = require('fs');
const path = require('path');

const SRC_FONTS_DIR = path.join(__dirname, '..', 'src', 'fonts');
const PUBLIC_FONTS_DIR = path.join(__dirname, '..', 'public', 'fonts');

// Ensure the public fonts directory exists
if (!fs.existsSync(PUBLIC_FONTS_DIR)) {
  fs.mkdirSync(PUBLIC_FONTS_DIR, { recursive: true });
  console.log(`Created public fonts directory at ${PUBLIC_FONTS_DIR}`);
}

// Copy all font files from src/fonts to public/fonts
function copyFonts() {
  if (!fs.existsSync(SRC_FONTS_DIR)) {
    console.error(`Source fonts directory ${SRC_FONTS_DIR} does not exist.`);
    process.exit(1);
  }
  
  console.log('Copying fonts to public directory...');
  
  // Get all font files
  const files = fs.readdirSync(SRC_FONTS_DIR);
  
  if (files.length === 0) {
    console.log('No font files found in source directory.');
    return;
  }
  
  let copiedCount = 0;
  
  // Copy each file
  files.forEach(file => {
    if (file.endsWith('.woff2') || file.endsWith('.woff') || file.endsWith('.ttf')) {
      const srcPath = path.join(SRC_FONTS_DIR, file);
      const destPath = path.join(PUBLIC_FONTS_DIR, file);
      
      try {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${file} to public fonts directory.`);
        copiedCount++;
      } catch (error) {
        console.error(`Failed to copy ${file}:`, error);
      }
    }
  });
  
  console.log(`Successfully copied ${copiedCount} font files.`);
}

// Run the script
copyFonts(); 