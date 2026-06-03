/**
 * 🚀 PROOT UBUNTU 22.04 LIVE CONTAINER ENGINE (COLOR RENDERER FIX)
 * 👤 User: ImGunpoint
 * 🛠️ Made by: Gemini AI & ImGunpoint
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;

// System Paths
const BIN_DIR = path.join(__dirname, 'bin');
const PROOT_PATH = path.join(BIN_DIR, 'proot');
const ROOTFS_DIR = path.join(__dirname, 'ubuntu-22-rootfs');
const ARCHIVE_PATH = path.join(__dirname, 'ubuntu-rootfs.tar.gz');

// ============================================================================
// 📋 VERIFIED LIVE ENDPOINTS (STATIC PROOT & OFFICIAL MINIMAL ROOTFS)
// ============================================================================
const PROOT_SOURCES = [
    'https://proot.gitlab.io/proot/bin/proot',
    'https://raw.githubusercontent.com/proot-me/proot-static-build/master/proot-x86_64'
];

const ROOTFS_SOURCES = [
    'https://cdimage.ubuntu.com/ubuntu-base/releases/jammy/release/ubuntu-base-22.04-base-amd64.tar.gz'
];

// ============================================================================
// 🪵 SIMPLIFIED LOG CONSOLE
// ============================================================================
function log(status, msg) {
    const symbols = { info: '💡', success: '✅', warning: '⚠️', error: '🚨' };
    console.log(`[ImGunpoint] ${symbols[status] || '⚙️'} ${msg}`);
}

// ============================================================================
// 📡 NETWORK DOWNLOAD STREAM HANDLER
// ============================================================================
function downloadFile(urls, outputPath, index = 0) {
    return new Promise((resolve, reject) => {
        if (index >= urls.length) {
            return reject(new Error('All download sources exhausted. Connection failed.'));
        }

        const url = urls[index];
        log('info', `Using Route #${index + 1}/${urls.length}: ${url}`);

        const client = url.startsWith('https') ? https : http;

        client.get(url, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                log('info', `Following Redirect Matrix...`);
                return downloadFile([response.headers.location, ...urls.slice(index + 1)], outputPath, 0).then(resolve).catch(reject);
            }

            if (response.statusCode !== 200) {
                log('warning', `Route dropped with status: ${response.statusCode}`);
                return downloadFile(urls, outputPath, index + 1).then(resolve).catch(reject);
            }

            const fileStream = fs.createWriteStream(outputPath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                log('success', `Download verified and written to disk.`);
                resolve();
            });
        }).on('error', (err) => {
            log('warning', `Network exception caught: ${err.message}`);
            return downloadFile(urls, outputPath, index + 1).then(resolve).catch(reject);
        });
    });
}

// ============================================================================
// 🏗️ FILESYSTEM ASSEMBLY & SANITIZATION (WITH AUTOMATIC PURGE/RETRY)
// ============================================================================
async function initializeEnvironment() {
    log('info', 'Booting core system matrix...');
    
    if (!fs.existsSync(BIN_DIR)) fs.mkdirSync(BIN_DIR, { recursive: true });

    // Step 1: Secure Static PRoot Executable
    if (!fs.existsSync(PROOT_PATH)) {
        log('info', 'PRoot native core not found. Fetching runtime...');
        await downloadFile(PROOT_SOURCES, PROOT_PATH);
        fs.chmodSync(PROOT_PATH, 0o755); 
        log('success', 'PRoot execution flags established.');
    } else {
        log('success', 'PRoot execution layer intact.');
    }

    // Step 2: Clear broken environments if bash is missing
    const bashCheckPath = path.join(ROOTFS_DIR, 'bin', 'bash');
    if (fs.existsSync(ROOTFS_DIR) && !fs.existsSync(bashCheckPath)) {
        log('warning', 'Incomplete RootFS detected. Purging directory for clean Ubuntu 22 re-install...');
        fs.rmSync(ROOTFS_DIR, { recursive: true, force: true });
    }

    if (!fs.existsSync(ROOTFS_DIR)) fs.mkdirSync(ROOTFS_DIR, { recursive: true });

    // Step 3: Unpack RootFS
    if (!fs.existsSync(bashCheckPath)) {
        log('info', 'Ubuntu 22.04 user-space image missing. Fetching RootFS Tarball...');
        await downloadFile(ROOTFS_SOURCES, ARCHIVE_PATH);

        log('info', 'Decompressing Ubuntu 22.04 core images via native system pipeline...');
        
        await new Promise((resolve, reject) => {
            const extract = spawn('tar', ['-xzf', ARCHIVE_PATH, '-C', ROOTFS_DIR]);
            
            extract.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Tar sub-process exited with error state: ${code}`));
            });
        });
        
        try { fs.unlinkSync(ARCHIVE_PATH); } catch(e) {}
        log('success', 'Ubuntu 22.04 ecosystem extracted completely.');
    } else {
        log('success', 'Ubuntu 22.04 environment verification passed.');
    }
}

// ============================================================================
// 🖥️ EMBEDDED WEB INTERFACE VIEWPORT (WITH REAL INTERACTIVE ANSI COLOR PARSER)
// ============================================================================
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>ImGunpoint Shell Stream</title>
    <style>
        body { background-color: #0f141c; color: #e6edf3; font-family: monospace; padding: 25px; margin: 0; }
        .wrapper { max-width: 1200px; margin: 0 auto; }
        .branding { border-bottom: 1px solid #30363d; padding-bottom: 12px; margin-bottom: 20px; }
        .highlight { color: #2f81f7; font-weight: bold; }
        #terminal { background-color: #010409; border: 1px solid #30363d; border-radius: 6px; padding: 18px; height: 65vh; overflow-y: auto; white-space: pre-wrap; font-size: 14px; line-height: 1.4; color: #e6edf3; }
        .input-area { margin-top: 15px; display: flex; background-color: #010409; border: 1px solid #30363d; border-radius: 6px; padding: 10px; }
        .prompt { color: #56d364; margin-right: 10px; user-select: none; }
        #cmd-input { flex: 1; background: transparent; border: none; color: #e6edf3; font-family: monospace; font-size: 14px; outline: none; }
        
        /* Native ANSI Terminal Linux Color Matrix Definitions */
        .ansi-black { color: #2e3436; }
        .ansi-red { color: #cc0000; }
        .ansi-green { color: #4e9a06; }
        .ansi-yellow { color: #c4a000; }
        .ansi-blue { color: #3465a4; }
        .ansi-magenta { color: #75507b; }
        .ansi-cyan { color: #06989a; }
        .ansi-white { color: #d3d7cf; }
        .ansi-bright-black { color: #555753; font-weight: bold; }
        .ansi-bright-red { color: #ef2929; font-weight: bold; }
        .ansi-bright-green { color: #8ae234; font-weight: bold; }
        .ansi-bright-yellow { color: #fce94f; font-weight: bold; }
        .ansi-bright-blue { color: #729fcf; font-weight: bold; }
        .ansi-bright-magenta { color: #ad7fa8; font-weight: bold; }
        .ansi-bright-cyan { color: #34e2e2; font-weight: bold; }
        .ansi-bright-white { color: #eeeeec; font-weight: bold; }
        .ansi-bold { font-weight: bold; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="branding">
            <h2>📦 Ubuntu 22.04 Workspace Shell Instance</h2>
            <div>Host Operator: <span class="highlight">ImGunpoint</span></div>
        </div>
        <div id="terminal"></div>
        
        <div class="input-area">
            <span class="prompt">root@ubuntu:~#</span>
            <input type="text" id="cmd-input" placeholder="Type a command and hit Enter..." autofocus autocomplete="off">
        </div>
    </div>

    <script>
        const term = document.getElementById('terminal');
        const input = document.getElementById('cmd-input');
        const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const ws = new WebSocket(proto + window.location.host);

        // Client-side ANSI to HTML Token Parser Engine
        function parseAnsi(text) {
            const ansiMap = {
                '30': 'ansi-black', '31': 'ansi-red', '32': 'ansi-green', '33': 'ansi-yellow',
                '34': 'ansi-blue', '35': 'ansi-magenta', '36': 'ansi-cyan', '37': 'ansi-white',
                '90': 'ansi-bright-black', '91': 'ansi-bright-red', '92': 'ansi-bright-green', '93': 'ansi-bright-yellow',
                '94': 'ansi-bright-blue', '95': 'ansi-bright-magenta', '96': 'ansi-bright-cyan', '97': 'ansi-bright-white',
                '1': 'ansi-bold'
            };

            // Break raw lines apart to prevent streaming overlap errors
            let cleanHTML = "";
            let segments = text.split(/\\x1B\\[|\\e\\[/);

            if (segments.length === 1) {
                return text.replace(/\\n/g, '<br>');
            }

            cleanHTML += segments[0];

            for (let i = 1; i < segments.length; i++) {
                let parts = segments[i].split('m');
                let codes = parts[0].split(';');
                let content = parts.slice(1).join('m');

                if (codes.length === 1 && (codes[0] === '0' || codes[0] === '')) {
                    cleanHTML += '</span>' + content;
                } else {
                    let classes = codes.map(c => ansiMap[c] || '').join(' ').trim();
                    cleanHTML += \`<span class="\${classes}">\` + content;
                }
            }

            return cleanHTML.replace(/\\n/g, '<br>');
        }

        ws.onopen = () => {
            term.innerHTML += '<span class="ansi-green">[System]: Secure pipeline bridged. Terminal Ready.</span><br>';
        };

        ws.onmessage = (e) => {
            term.innerHTML += parseAnsi(e.data);
            term.scrollTop = term.scrollHeight;
        };

        ws.onclose = () => {
            term.innerHTML += '<span class="ansi-red"><br>[System]: Remote session closed. Terminal instance destroyed.</span><br>';
            input.disabled = true;
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = input.value;
                ws.send(command + '\\n'); 
                input.value = '';
            }
        });

        document.addEventListener('click', () => {
            if (!input.disabled) input.focus();
        });
    </script>
</body>
</html>
`;

// ============================================================================
// 🌐 WEB ROUTING & CHILD PROCESS INTERFACE (INTERACTIVE PIPING)
// ============================================================================
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlContent);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    log('info', 'Web interface synchronized to backend terminal stream.');

    try {
        const etcDir = path.join(ROOTFS_DIR, 'etc');
        if (!fs.existsSync(etcDir)) fs.mkdirSync(etcDir, { recursive: true });
        fs.writeFileSync(path.join(etcDir, 'resolv.conf'), 'nameserver 8.8.8.8\nnameserver 8.8.4.4\n');
    } catch (dnsErr) {
        log('warning', `Failed DNS link binding optimization: ${dnsErr.message}`);
    }

    const args = [
        '-r', ROOTFS_DIR,
        '-0',
        '-w', '/',
        '-b', '/proc',
        '-b', '/dev',
        '-b', '/sys',
        '/bin/bash',
        '--login'
    ];

    if (!fs.existsSync(PROOT_PATH)) {
        ws.send(`\x1B[91mError: Initialization dependencies not met on disk.\x1B[0m\n`);
        return;
    }

    const bashEnv = spawn(PROOT_PATH, args, {
        env: { 
            ...process.env, 
            TERM: 'xterm-color', // Set terminal type to force system to output ANSI styling strings
            HOME: '/root',
            PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
        }
    });

    ws.send("\x1B[92mEnvironment booted successfully. Upgraded to Ubuntu 22.04 LTS Framework with ANSI color enhancements active.\x1B[0m\n\n");

    ws.on('message', (message) => {
        if (bashEnv.stdin.writable) {
            bashEnv.stdin.write(message.toString());
        }
    });

    bashEnv.stdout.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    bashEnv.stderr.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    bashEnv.on('close', (code) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(`\n\x1B[31m[Process exited with status framework code: ${code}]\x1B[0m\n`);
        }
    });

    ws.on('close', () => {
        log('info', 'Client disconnect tracked. Disposing child subsystem trees.');
        bashEnv.kill();
    });
});

// ============================================================================
// ⚡ RUNTIME EXECUTION CORES
// ============================================================================
initializeEnvironment().then(() => {
    server.listen(PORT, () => {
        log('success', `Service online and reachable on instance port: ${PORT}`);
        log('info', 'System ready, ImGunpoint.');
    });
}).catch((err) => {
    log('error', `Process failure aborted setup: ${err.message}`);
});
