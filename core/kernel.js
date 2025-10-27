/* 
	-Kernelo NodeJS-
	Authors: A01L & thebralin
	GitHub: https://GitHub.com/A01L | https://github.com/thebralin
	Version:  4.1.3v
 */

// core/kernel.js
const fs = require('fs');
const path = require('path');
const http = require('http');
require.extensions['.kjs'] = require.extensions['.js'];

// ==============================
// Kernelo args for starting from cli
// ==============================
const processArgs = process.argv.slice(2);
const config = {};

// pars flags from args
for (const arg of processArgs) {
    if (arg.startsWith('--')) {
        const [key, value] = arg.replace(/^--/, '').split('=');
        config[key] = value === undefined ? true : value;
    }
}

// Default configs
config.port = parseInt(config.port || 3000);
config.mode = config.mode || 'dev';

console.log(`[Kernelo]  Args: ${JSON.stringify(config)}`);

class Router {
    static routes = [];

    /**
     * Setting route
     * @param {string} urlPattern - URL template (example, /page/{id}/card)
     * @param {string} htmlPath - path to file (regarding containers/)
     * @param {string} [jsPath] - path to KJS server side script (regarding containers/)
     */
    static set(urlPattern, htmlPath, jsPath = null) {
        const route = {
            urlPattern,
            htmlFullPath: path.join(process.cwd(), 'containers', htmlPath),
            jsFullPath: jsPath ? path.join(process.cwd(), 'containers', jsPath) : null
        };
        this.routes.push(route);

        const routesFile = path.join(process.cwd(), '.kernelo.routes.json');
        fs.writeFileSync(routesFile, JSON.stringify(this.routes, null, 2));
    }

    /**
     * Setting list routes
     * @param {array} routesArray - URL templates list (a like Router.set)
     */
    static list(routesArray) {
        for (const route of routesArray) {
            this.set(route.url, route.path, route.handler);
        }
    }

    /**
     * Init server 
     */
    static init() {
        const port = config.port;
        const server = http.createServer(async (req, res) => {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            const matchedRoute = this.matchRoute(req.url);
            
            if (!matchedRoute) {
                const staticPath = path.join(process.cwd(), 'containers', req.url);
                const ext = path.extname(staticPath).toLowerCase();
                const forbiddenExts = ['.kjs', '.env', '.md', '.lock'];

                if (forbiddenExts.includes(ext)) {
                    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
                    res.end('Forbidden');
                    return;
                }

                if (fs.existsSync(staticPath) && fs.statSync(staticPath).isFile()) {
                    const ext = path.extname(staticPath).toLowerCase();
                    const mimeTypes = {
                        '.png': 'image/png',
                        '.jpg': 'image/jpeg',
                        '.jpeg': 'image/jpeg',
                        '.gif': 'image/gif',
                        '.svg': 'image/svg+xml',
                        '.css': 'text/css',
                        '.js': 'text/javascript',
                        '.html': 'text/html'
                    };

                    const mimeType = mimeTypes[ext] || 'application/octet-stream';
                    res.writeHead(200, { 'Content-Type': `${mimeType}; charset=utf-8` });
                    fs.createReadStream(staticPath).pipe(res);
                    return;
                }

                res.writeHead(404);
                res.end('Page not found');
                return;
            }

            try {
                let dataContext = {};

                if (matchedRoute.jsFullPath && fs.existsSync(matchedRoute.jsFullPath)) {
                    const handler = require(matchedRoute.jsFullPath);

                    if (typeof handler === 'function') {
                        const params = this.extractParams(req.url, matchedRoute.urlPattern);
                        dataContext = await handler({ req, params });
                    }
                }

                fs.readFile(matchedRoute.htmlFullPath, 'utf-8', (err, html) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('Server side error');
                        return;
                    }

                    let rendered = html;
                    for (const [key, value] of Object.entries(dataContext)) {
                        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
                        rendered = rendered.replace(regex, value);
                    }

                    res.writeHead(200);
                    res.end(rendered);
                });
            } catch (err) {
                res.writeHead(500);
                res.end('Server side error: ' + err.message);
            }
        });

        server.listen(port, () => {
            console.log(`[Kernelo] Server started on http://localhost:${port}`);
            this.routes.forEach(r => {
                console.log(` → ${r.urlPattern}  →  ${r.htmlFullPath}${r.jsFullPath ? ' + KJS SSS' : ''}`);
            });
        });
    }

    /**
     * Search route
     */
    static matchRoute(requestUrl) {
        for (const route of this.routes) {
            const regexPattern = new RegExp('^' + route.urlPattern.replace(/\{[^\}]+\}/g, '([^/]+)') + '$');
            if (regexPattern.test(requestUrl)) {
                return route;
            }
        }
        return null;
    }

    /**
     * Extracting {param} from url
     */
    static extractParams(url, pattern) {
        const paramNames = (pattern.match(/\{[^\}]+\}/g) || []).map(p => p.replace(/[{}]/g, ''));
        const regexPattern = new RegExp('^' + pattern.replace(/\{[^\}]+\}/g, '([^/]+)') + '$');
        const values = regexPattern.exec(url);
        const params = {};
        if (values) {
            paramNames.forEach((name, i) => {
                params[name] = values[i + 1];
            });
        }
        return params;
    }
}

module.exports = Router;
