#!/usr/bin/env node

const semver = require('semver');
const semverUtils = require('semver-utils');
const jsonfile = require('jsonfile');
const getLastRelease = require('../util/get-last-release');
const {argv: Argv, env, stderr} = require('process');
const {tag, push} = require('../util/git.js');
const {template} = require('lodash');

async function resolvePreRelease() {
  jsonfile.spaces = 2;
  const argv = require('yargs')
    .usage('Usage: $0 [-r "releaseVersion"] [-b "buildVersion"]')
    .option('pre', {
      alias: 'prefix',
      demand: false,
      default: 'rc',
      describe: 'Change release version prefix',
      type: 'string'
    })
    .option('b', {alias: 'build', demand: false, default: '', describe: 'Build meta data', type: 'string'})
    .option('p', {alias: 'path', demand: false, default: '.', describe: 'Path to package.json', type: 'string'})
    .option('t', {alias: 'tag-format', describe: 'Git tag format', type: 'string', group: 'Options'})
    .count('verbose')
    .help('?')
    .alias('?', 'help')
    .example('$0 -r 12', 'creates 1.0.0-rc.12')
    .example('$0 -r 12 --pre alpha -b 420', 'creates 1.0.0-alpha.12+420')
    .example('$0 -r dev --pre \'\' -b 12', 'creates 1.0.0-dev+12')
    .example('$0 -b build.12 -p /path/to/project', 'creates 1.0.0+build.12')
    .argv;


  const buildNumber = argv.b;

  try {
    const tagFormat = argv.tagFormat || 'rc${version}';
    const lastRelease = await getLastRelease(tagFormat);
    const nextVersion = lastRelease.version ? semver.inc(lastRelease.version, 'minor') : '1.0.0';
    const parsedNextVersion = semverUtils.parse(nextVersion);

    let newPackageVersion = semverUtils.stringify({
      major: parsedNextVersion.major,
      minor: parsedNextVersion.minor,
      patch: parsedNextVersion.patch,
      release: argv.pre + '.${version}',
      build: buildNumber
    });

    const preTagFormat = template(tagFormat)({version: newPackageVersion});
    const lastPreRelease = await getLastRelease(preTagFormat, true);
    const nextPreVersion = lastPreRelease.version ? parseInt(lastPreRelease.version) + 1 : 1;

    newPackageVersion = semverUtils.stringify({
      major: parsedNextVersion.major,
      minor: parsedNextVersion.minor,
      patch: parsedNextVersion.patch,
      release: argv.pre + '.' + nextPreVersion,
      build: buildNumber
    });

    const packagePath = argv.p + '/package.json';
    const packagejson = jsonfile.readFileSync(packagePath);
    packagejson.version = newPackageVersion;
    jsonfile.writeFileSync(packagePath, packagejson);

    const gitTag = template(preTagFormat)({version: nextPreVersion});
    await tag(gitTag);
    await push();

    console.log(`New version is ${newPackageVersion}, Generate tag ${gitTag}`)
    return 0;
  } catch (error) {
    console.log('ERROR Occured: ', error);
    return 1;
  }
}

resolvePreRelease()
  .then(exitCode => {
    process.exitCode = exitCode;
  })
  .catch(() => {
    process.exitCode = 1;
  });


