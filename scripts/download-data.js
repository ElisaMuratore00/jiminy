/* eslint-disable */
import https from 'https';
import http from 'http';
import fs from 'fs';

if (process.argv.length < 4) {
  console.error('Usage: node download-data.js <URL> <output_file.json>');
  process.exit(1);
}

const url = process.argv[2];
const outputFile = process.argv[3];

const protocol = url.startsWith('https') ? https : http;

let data = '';

protocol
  .get(url, response => {
    if (response.statusCode !== 200) {
      console.error(`Error: status code ${response.statusCode}`);
      process.exit(1);
    }
    response.setEncoding('utf8');
    response.on('data', chunk => {
      data += chunk;
    });
    response.on('end', () => {
      try {
        // If the remote file is already JSON, save it directly
        JSON.parse(data); // Check if it's valid JSON
        fs.writeFileSync(outputFile, data, 'utf8');
        console.log(`JSON file downloaded to: ${outputFile}`);
      } catch (e) {
        // If the remote file is CSV, convert it to an object { url: type }
        const rows = data.trim().split('\n');
        const headers = rows.shift().split(',');
        const urlIndex = headers.findIndex(h => h.trim() === 'url');
        const typeIndex = headers.findIndex(h => h.trim() === 'type');
        const obj = {};
        rows.forEach(row => {
          const values = row.split(',');
          const key = values[urlIndex]?.trim();
          const value = values[typeIndex]?.trim();
          if (key && value) {
            const valueAsNumber = value === 'unreliable' ? 1 : 0;
            obj[key] = valueAsNumber;
          }
        });
        fs.writeFileSync(outputFile, JSON.stringify(obj, null, 2), 'utf8');
        console.log(`CSV file converted and saved as JSON object in: ${outputFile}`);
      }
    });
  })
  .on('error', err => {
    console.error('Error during download:', err.message);
    process.exit(1);
  });
