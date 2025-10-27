#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const targetDir = process.cwd();

console.log(`Setup kernelo to : ${targetDir}`);

function copyRecursive(src, dest) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        const baseName = path.basename(src);

        if (['.git', 'node_modules'].includes(baseName)) return;

        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        for (const file of fs.readdirSync(src)) {
            copyRecursive(path.join(src, file), path.join(dest, file));
        }
    } else {
        fs.copyFileSync(src, dest);
    }
}

copyRecursive(path.join(__dirname, '..'), targetDir);

const oldPackage = path.join(targetDir, 'package.json');
if (fs.existsSync(oldPackage)) {
    fs.unlinkSync(oldPackage);
}

const tpPackage = path.join(targetDir, 'tp.json');
if (fs.existsSync(tpPackage)) {
    fs.renameSync(tpPackage, path.join(targetDir, 'package.json'));
} else {
    console.warn("tp.json not found ERRC: Sx001");
}

console.log("init (npm link) for cli kernelo...");
execSync('npm link --force', { cwd: targetDir, stdio: 'inherit' });

console.log("Success! You can use CLI of kernelo:");
console.log("  kernelo start | kernelo help");
