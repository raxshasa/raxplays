/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';

const blogDir = './src/data/blog';
// const now = new Date().toISOString();

const files = fs.readdirSync(blogDir);

files.forEach(file => {
  if (file.endsWith('.md') || file.endsWith('.mdoc')) {
    const filePath = path.join(blogDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Only update if it is currently a draft
    if (content.includes('draft: true')) {
      console.log(`🚀 Publishing: ${file}`);
      
      // Flip draft to false
      content = content.replace(/draft: true/g, 'draft: false');
      
      // Update pubDatetime to right now
      // This regex looks for pubDatetime: followed by any date string
      // content = content.replace(/pubDatetime: .*/g, `pubDatetime: ${now}`);
      
      fs.writeFileSync(filePath, content);
    }
  }
});