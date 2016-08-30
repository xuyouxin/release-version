#!/usr/bin/env node

const semverUtils = require('semver-utils');
const jsonfile = require('jsonfile');
jsonfile.spaces = 2;
const argv = require('yargs')
  .usage('Usage: $0 [-b "buildNumber"]')
  .required('b', 'Build number is required')
  .option('r', { alias: 'release', demand: false, default: '', describe: 'override pre-release version'})
  .option('b', { alias: 'buildNumber', describe: 'Build Number', type: 'string'})
  .option('pre', { alias: 'prefix', demand: false, default: 'rc', describe: 'override build prefix'})
  .option('p', { alias: 'path', demand: false, default: '.', describe: 'Path to package.json', type: 'string'})
  .option('v', { alias: 'verbose', demand: false, describe: 'logs more info', type: 'string'})
  .count('verbose')
  .help('?')
  .alias('?', 'help')
  .example('$0 -b 12', 'creates 1.0.0+rc.12')
  .example('$0 -b 12 -r dev --pre \'\'', 'creates 1.0.0-dev+12')
  .example('$0 -b 12 -p /path/to/project --pre build', 'creates 1.0.0+build.12')
  .argv;

const VERBOSE_LEVEL = argv.verbose;
function INFO()  { VERBOSE_LEVEL >= 0 && console.log.apply(console, arguments)};
function DEBUG() { VERBOSE_LEVEL >= 1 && console.log.apply(console, arguments)};
function VERBOSE() { VERBOSE_LEVEL >= 2 && console.log.apply(console, arguments)};

const packagePath = argv.p + '/package.json';
DEBUG('packagePath: ' + packagePath);

const packagejson = jsonfile.readFileSync(packagePath);
const currentVersion = packagejson.version;
DEBUG('currentVersion: ' + currentVersion);

const parsedVersion = semverUtils.parse(currentVersion);
DEBUG('parsedVersion: ' + parsedVersion);

const release = argv.r;
if(release.length) {
  VERBOSE('release: ' + release);
}

const prefix = argv.pre.length > 0 ? argv.pre + '.' : '';
VERBOSE('build prefix: ' + prefix);

const buildNumber = argv.b;
DEBUG('Updating with Build Number: ' + buildNumber);

var newPackageVersion = semverUtils.stringify({
  major: parsedVersion.major,
  minor: parsedVersion.minor,
  patch: parsedVersion.patch,
  release: release,
  build: prefix + buildNumber
});
VERBOSE('newPackageVersion: ' + newPackageVersion);

packagejson.version = newPackageVersion;

try {
  jsonfile.writeFileSync(packagePath, packagejson);
} catch (error) {
  error('ERROR Occured: ', error);
}

INFO('Version ' + currentVersion + ' updated to Version: ' + newPackageVersion);
