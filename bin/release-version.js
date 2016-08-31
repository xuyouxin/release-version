#!/usr/bin/env node

const semverUtils = require('semver-utils');
const jsonfile = require('jsonfile');
jsonfile.spaces = 2;
const argv = require('yargs')
  .usage('Usage: $0 [-r "releaseVersion"] [-b "buildVersion"]')
  .option('r', { alias: 'release', describe: 'Release version', type: 'string'})
  .option('pre', { alias: 'prefix', demand: false, default: 'rc', describe: 'Change release version prefix', type: 'string'})
  .option('b', { alias: 'build', demand: false, default: '', describe: 'Build meta data', type: 'string'})
  .option('p', { alias: 'path', demand: false, default: '.', describe: 'Path to package.json', type: 'string'})
  .option('v', { alias: 'verbose', demand: false, describe: 'logs more info', type: 'string'})
  .count('verbose')
  .help('?')
  .alias('?', 'help')
  .example('$0 -r 12', 'creates 1.0.0-rc.12')
  .example('$0 -r 12 --pre alpha -b 420', 'creates 1.0.0-alpha.12+420')
  .example('$0 -r dev --pre \'\' -b 12', 'creates 1.0.0-dev+12')
  .example('$0 -b build.12 -p /path/to/project', 'creates 1.0.0+build.12')
  .argv;

const VERBOSE_LEVEL = argv.verbose;
function INFO()  { VERBOSE_LEVEL >= 0 && console.log.apply(console, arguments)}
function DEBUG() { VERBOSE_LEVEL >= 1 && console.log.apply(console, arguments)}
function VERBOSE() { VERBOSE_LEVEL >= 2 && console.log.apply(console, arguments)}

const packagePath = argv.p + '/package.json';
DEBUG('packagePath: %s', packagePath);

const packagejson = jsonfile.readFileSync(packagePath);
const currentVersion = packagejson.version;
DEBUG('currentVersion: %s', currentVersion);

const parsedVersion = semverUtils.parse(currentVersion);
DEBUG('parsedVersion: ' + parsedVersion);

const release = argv.r;
release && VERBOSE('release: %s', release);

var prerelease;
if (release) {
  var prefix = argv.pre;
  if (prefix.length > 0) {
    VERBOSE('release prefix: %s', prefix);
    prefix += '.';
  }
  prerelease = prefix + release;
  DEBUG('prerelease %s', prerelease);
}

const buildNumber = argv.b;
DEBUG('Updating with Build Number: %s', buildNumber);

var newPackageVersion = semverUtils.stringify({
  major: parsedVersion.major,
  minor: parsedVersion.minor,
  patch: parsedVersion.patch,
  release: prerelease,
  build: buildNumber
});
VERBOSE('newPackageVersion: %s', newPackageVersion);

packagejson.version = newPackageVersion;

try {
  jsonfile.writeFileSync(packagePath, packagejson);
} catch (error) {
  error('ERROR Occured: ', error);
}

INFO('Version %s updated to Version: %s', currentVersion, newPackageVersion);
