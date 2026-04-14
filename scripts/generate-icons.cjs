const fs = require('fs');
fs.mkdirSync('public/icons', { recursive: true });

const svgIcon = (size) => [
  '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 100 100">',
  '  <rect width="100" height="100" rx="20" fill="#0A2540"/>',
  '  <text x="50" y="62" font-family="Arial, sans-serif" font-size="42" font-weight="bold" fill="#FDB813" text-anchor="middle">EE</text>',
  '</svg>'
].join('\n');

fs.writeFileSync('public/icons/pwa-192x192.svg', svgIcon(192));
fs.writeFileSync('public/icons/pwa-512x512.svg', svgIcon(512));
console.log('SVG icons created at public/icons/');
