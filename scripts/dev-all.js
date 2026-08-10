const { spawn } = require('child_process');

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(label, args) {
  const child = spawn(npmCmd, args, {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd(),
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`[${label}] stopped by signal ${signal}`);
    } else {
      console.log(`[${label}] exited with code ${code}`);
    }
  });

  return child;
}

const server = run('server', ['run', 'server']);
const dev = run('dev', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173']);

function shutdown() {
  if (!server.killed) server.kill('SIGTERM');
  if (!dev.killed) dev.kill('SIGTERM');
}

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});
