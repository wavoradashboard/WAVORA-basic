import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Convert standard dark theme to modern glassmorphism dark theme
  // Backgrounds
  content = content.replace(/bg-\[\#030308\]/g, 'bg-black/20');
  content = content.replace(/bg-\[\#0A0A14\]/g, 'bg-white/5 backdrop-blur-md');
  content = content.replace(/bg-\[\#141424\]/g, 'bg-white/10 backdrop-blur-md');
  content = content.replace(/bg-\[\#1C1C2E\]/g, 'bg-white/10');
  content = content.replace(/bg-\[\#080812\]/g, 'bg-white/5');
  content = content.replace(/bg-\[\#0D0D1A\]/g, 'bg-white/5');
  
  // Borders
  content = content.replace(/border-\[\#1A1A2E\]/g, 'border-white/10');
  content = content.replace(/border-\[\#1F1F1F\]/g, 'border-white/10');
  content = content.replace(/border-\[\#1F1F2E\]/g, 'border-white/10');
  
  // Hex hardcodes
  content = content.replace(/#030308/ig, 'transparent');
  content = content.replace(/#0A0A14/ig, 'rgba(255,255,255,0.05)');
  content = content.replace(/#141424/ig, 'rgba(255,255,255,0.1)');
  content = content.replace(/#1A1A2E/ig, 'rgba(255,255,255,0.1)');

  // Structural Rounding (Neo glassmorphism)
  content = content.replace(/rounded-2xl/g, 'rounded-3xl');
  content = content.replace(/rounded-xl/g, 'rounded-2xl');
  content = content.replace(/rounded-lg/g, 'rounded-xl');

  // Shadows
  content = content.replace(/shadow-lg/g, 'shadow-2xl shadow-indigo-500/10');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
