# release-version

> Release and build number appender to package.json version

If you use Artifactory on premise to publish node projects,
you need to update the version each time you publish new builds.

This package allow Jenkins or other build system to update the version in your project
with the current build number given by jenkins optionally with a pre-release version.

Reference: [semver.org spec](http://semver.org/#spec-item-9)

## Getting Started
This package is for node.js projects that contain package.json files.

```shell
npm install -g release-version
```


### Usage Examples
Once the package has been globally installed it may be used from from any path



```shell
release-version -b 2
```
given current version 1.0.0 will create version: 1.0.0+rc.2


```shell
release-version -b 2 -p /path/to/project -pre build
```
version 1.0.0 will result in: 1.0.0+build.2


```shell
release-version -b 2 -r alpha -p /path/to/project -pre ''
```
version 1.0.0 will result in: 1.0.0-alpha+2

