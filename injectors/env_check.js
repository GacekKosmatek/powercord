/**
 * Powercord, a lightweight @discord client mod focused on simplicity and performance
 * Copyright (C) 2018-2020  aetheryx & Bowser65
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const { join } = require('path');
const { existsSync } = require('fs');
const { execSync } = require('child_process');

const rootPath = join(__dirname, '..');
const nodeModulesPath = join(rootPath, 'node_modules');

function installDeps () {
  console.log('Installing dependencies...');
  execSync('npm install --only=prod', {
    cwd: rootPath,
    stdio: [ null, null, null ]
  });
  console.log('Dependencies successfully installed!');
}

module.exports = () => {
  // Don't clone in System32
  if (__dirname.toLowerCase().replace(/\\/g, '/').includes('/windows/system32')) {
    console.error('Powercord shouldn\'t be cloned in System32, as this will generate conflicts and bloat your Windows installation. Please remove it and clone it in another place.\n' +
      'Note: Not opening cmd as administrator will be enough.');
    process.exit(1);
  }

  // Verify if we're on node 10.x
  const fs = require('fs');
  if (!fs.promises) {
    console.error('You\'re on an outdated Node.js version. Powercord requires you to run at least Node 10. You can download it here: https://nodejs.org');
    process.exit(1);
  }

  // Verify if deps have been installed. If not, install them automatically
  if (!existsSync(nodeModulesPath)) {
    installDeps();
  } else {
    const { dependencies } = require('../package.json');
    for (const dependency in dependencies) {
      const depPath = join(nodeModulesPath, dependency);
      if (!existsSync(depPath)) {
        installDeps();
        break;
      }
      const expectedFrom = `${dependency}@${dependencies[dependency]}`;
      const depPackage = require(join(depPath, 'package.json'));
      if (expectedFrom !== depPackage._from) {
        installDeps();
        break;
      }
    }
  }
};
