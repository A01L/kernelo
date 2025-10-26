#!/usr/bin/env node
/**
 * Kernelo CLI 
 */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PID_FILE = path.join(process.cwd(), '.kernelo.pid');

function getPid() {
    if (fs.existsSync(PID_FILE)) {
        const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));
        try {
            process.kill(pid, 0);
            return pid;
        } catch {
            fs.unlinkSync(PID_FILE);
            return null;
        }
    }
    return null;
}

const args = process.argv.slice(2);
const command = args[0];
const portIndex = args.indexOf('-p');
const port = portIndex !== -1 ? args[portIndex + 1] : 3000;

const COMMANDS = [
  {
    name: 'start',
    desc: 'Starts the Kernelo server on the specified port (default is 3000)',
    example: 'kernelo start -p 4000'
  },
  {
    name: 'restart',
    desc: 'Restarts the server (if it is running)',
    example: 'kernelo restart'
  },
  {
    name: 'stop',
    desc: 'Stops the server and deletes the PID file',
    example: 'kernelo stop'
  },
  {
    name: 'routes',
    desc: 'Displays all registered routes from the kernel',
    example: 'kernelo routes'
  },
  {
    name: 'ping',
    desc: 'Checks whether the Kernelo server is responding (via HTTP)',
    example: 'kernelo ping'
  },
  {
    name: 'uscan',
    desc: 'Checks for all HTML/KJS files from routes',
    example: 'kernelo uscan'
  },
  {
    name: 'help',
    desc: 'Shows the list of available Kernelo commands',
    example: 'kernelo help'
  },
  {
    name: 'uncache',
    desc: 'Resetting all caches and deleting temp files and variables',
    example: 'kernelo uncache'
  }
];


switch (command) {
    case 'help':
    default: {
        console.log(`
    ┌──────────────────────────────┐
    │     Kernelo CLI — Manual.    │
    └──────────────────────────────┘

    Using:
    kernelo <command> [parameters]

    Commands:
    `);

        COMMANDS.forEach(cmd => {
        console.log(`  ${cmd.name.padEnd(12)} — ${cmd.desc}`);
        });

        console.log(`\nExamplex:\n`);
        COMMANDS.forEach(cmd => {
        console.log(`  ${cmd.example}`);
        });

        console.log(`
    Additional parameters:
    -p <port>           — setting port with starting
    --port=<number>     — an alternative way to specify a port
    --mode=dev|prod     — set the operating mode of the kernel

    Documentation:
    📘 https://github.com/A01L/kernelo
    `);
        break;
    }

    case 'start':
        const existingPid = getPid();
        if (existingPid) {
            console.log(`[Kernelo]  It has already been launched (PID ${existingPid}). Use "kernelo restart" or "kernelo shutdown".`);
            process.exit(0);
        }

        console.log(`[Kernelo]  Starting the server on port ${port}...`);

        const { spawn } = require('child_process');

        const logOut = fs.openSync(path.join(process.cwd(), 'kernelo.log'), 'a');
        const logErr = fs.openSync(path.join(process.cwd(), 'kernelo-error.log'), 'a');

        const child = spawn('node', ['index.js', `--port=${port}`], {
            detached: true,
            stdio: ['ignore', logOut, logErr]
        });

        fs.writeFileSync(PID_FILE, String(child.pid));
        child.unref();

        console.log(`[Kernelo]  Server started (PID ${child.pid})`);
        console.log(`[Kernelo]  Logs: kernelo.log / kernelo-error.log`);
        break;

    case 'restart':
        const oldPid = getPid();
        if (oldPid) {
            console.log('[Kernelo]  Restarting the server...');
            try {
                process.kill(oldPid);
            } catch (e) {
                console.log('[Kernelo]  The old process was not found.');
            }
            fs.unlinkSync(PID_FILE);
        }
        exec(`kernelo start -p ${port}`);
        break;

    case 'stop': 
        const pid = getPid();
        if (!pid) {
            console.log('[Kernelo]  The server is not running.');
            process.exit(0);
        }

        try {
            process.kill(pid);
            fs.unlinkSync(PID_FILE);
            console.log(`[Kernelo]  Server stopped (PID ${pid}).`);
        } catch (e) {
            if (e.code === 'ESRCH') {
                console.log('[Kernelo]  The process was not found. The PID file has been deleted.');
                if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
            } else {
                console.error('[Kernelo]  Error when stopping:', e.message);
            }
        }
        break;
    
    case 'routes': {
        const routesFile = path.join(process.cwd(), '.kernelo.routes.json');
        if (!fs.existsSync(routesFile)) {
            console.log('[Kernelo] No routes file found. Start the server at least once.');
            break;
        }

        const routes = JSON.parse(fs.readFileSync(routesFile, 'utf8'));
        console.log(`\n Registered routes (${routes.length}):\n`);
        routes.forEach((r, i) => {
            console.log(`${i + 1}. ${r.urlPattern}`);
            console.log(`    Client: ${r.htmlFullPath}`);
            if (r.jsFullPath) console.log(`    Server:   ${r.jsFullPath}`);
            console.log('');
        });
        break;
    }

    case 'ping': {
        const http = require('http');
        const pid = getPid();

        if (!pid) {
            console.log('[Kernelo] The server is not running.');
            break;
        }

        const portMatch = fs.readFileSync(path.join(process.cwd(), 'kernelo.log'), 'utf8')
            .match(/http:\/\/localhost:(\d+)/);
        const port = portMatch ? parseInt(portMatch[1]) : 3000;

        console.log(`[Kernelo] Checking the connection to http://localhost:${port} ...`);

        http.get(`http://localhost:${port}`, (res) => {
            console.log(`[Kernelo] Response: ${res.statusCode} ${res.statusMessage}`);
        }).on('error', (err) => {
            console.log(`[Kernelo] Error: ${err.message}`);
        });
        break;
    }

    case 'uscan': {
        const routesFile = path.join(process.cwd(), '.kernelo.routes.json');
        if (!fs.existsSync(routesFile)) {
            console.log('[Kernelo] There is no routes. file. Start the server first.');
            break;
        }

        const routes = JSON.parse(fs.readFileSync(routesFile, 'utf8'));
        console.log('[Kernelo] Checking files...');

        let missing = [];
        for (const r of routes) {
            if (!fs.existsSync(r.htmlFullPath)) {
                missing.push(r.htmlFullPath);
            }
            if (r.jsFullPath && !fs.existsSync(r.jsFullPath)) {
                missing.push(r.jsFullPath);
            }
        }

        if (missing.length === 0) {
            console.log('[Kernelo] Success! All registered files exist.');
        } else {
            console.log('[Kernelo] Warning! Missing files found:');
            missing.forEach(f => console.log('   - ' + f));
        }
        break;
    }

    case 'uncache': {
        const kerneloLog    = path.join(process.cwd(), 'kernelo.log');
        const kerneloErrLog = path.join(process.cwd(), 'kernelo-error.log');

        if (fs.existsSync(kerneloLog)) {
            try {
                fs.unlinkSync(kerneloLog);
                console.log('[Kernelo] kernelo.log deleted.');
            } catch (e) {
                console.error('[Kernelo] Failed to delete kernelo.log:', e.message);
            }
        }

        if (fs.existsSync(kerneloErrLog)) {
            try {
                fs.unlinkSync(kerneloErrLog);
                console.log('[Kernelo] kernelo-error.log deleted.');
            } catch (e) {
                console.error('[Kernelo] Failed to delete kernelo-error.log:', e.message);
            }
        }
        break;
    }
}
