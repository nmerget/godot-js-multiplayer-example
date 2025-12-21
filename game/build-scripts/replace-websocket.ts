import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'path';

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || '3000';
const socketFile = join(__dirname, '../.godot/GodotJS/src/socket-singleton.js');

console.log(`Updating socket file to ${host}:${port}`);

const content = readFileSync(socketFile, 'utf8');
const updated = content.replace(/ws:\/\/localhost:3000/g, `ws://${host}:${port}`);
writeFileSync(socketFile, updated);