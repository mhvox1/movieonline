const path = require('path');
const afterPack = require('./after-pack-rcedit');

const rootDir = path.resolve(__dirname, '..');
const appOutDir = path.join(rootDir, 'rb', 'run-1782911023357', 'win-unpacked');

const appInfo = {
  productFilename: 'Movie Business',
  productName: 'Movie Business',
  shortVersion: '0.9.51',
  buildVersion: '0.9.51',
  shortVersionWindows: '0.9.51.0',
  getVersionInWeirdWindowsForm() {
    return '0.9.51.0';
  },
  copyright: '',
  companyName: '',
};

afterPack({
  electronPlatformName: 'win32',
  appOutDir,
  packager: {
    appInfo,
    projectDir: rootDir,
  },
}).then(() => {
  console.log('afterPack ok');
}).catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
