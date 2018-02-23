[![Build Status](https://qa.nuxeo.org/jenkins/buildStatus/icon?job=master/tools_nuxeo-cli-master/)](https://qa.nuxeo.org/jenkins/job/master/job/tools_nuxeo-cli-master//)
[![npm version](https://img.shields.io/npm/v/nuxeo-cli.svg?style=flat-square)](https://www.npmjs.com/package/nuxeo-cli)
[![npm downloads](https://img.shields.io/npm/dm/nuxeo-cli.svg?style=flat-square)](https://www.npmjs.com/package/nuxeo-cli)
[![Dependency Status](https://img.shields.io/david/nuxeo/nuxeo-cli.svg?style=flat-square)](https://david-dm.org/nuxeo/nuxeo-cli) [![devDependency Status](https://img.shields.io/david/dev/nuxeo/nuxeo-cli.svg?style=flat-square)](https://david-dm.org/nuxeo/nuxeo-cli#info=devDependencies)

# About

Nuxeo CLI is a command-line interface for helping developers around Nuxeo ecosystem. It provides project bootstrapping, bundles hot reload,...

# Overview

Nuxeo CLI includes several commands for working with your Nuxeo Project

- bootstrap: Bootstrap Nuxeo project, bundles or several components
- hotreload: Trigger hot reload on your development server
- update: Keep Nuxeo CLI up to date

# Installation

Install via NPM:

```bash
npm install -g nuxeo-cli
```

Then `nuxeo` executable should be available; ensure you can run:

```bash
nuxeo
```

# Usage

```bash
nuxeo <command> [options] [args]
```

## Options

```text
  -h, --help     Print Nuxeo CLI version                               [boolean]
  -v, --version  Show version                                          [boolean]
  -n             Quiet - Hide welcome message                          [boolean]
```

## Commands

### Sync

#### Usage

```bash
nuxeo sync [--src "<src_folder>"] [--dest "<dest_folder"]
```

One-way Synchronization files (`src` folder to `dest` folder), then watch any changes occured in a child from the `source` folder to repercute it to the `dest` folder.

If you start this command inside a *nuxeo-cli* bootstrap project that has been registered for hotreload (`nuxeo hotreload configure`), the **destination** path is computed to the registered distribution.

```text
  --dest         Destination Folder                           [string] [default:
               "/Users/foo/nuxeo-server-tomcat-9.3-SNAPSHOT/nxserver/nuxeo.war"]
```

If you start command inside a *Studio Project* clone, the **source** path is computed to `nuxeo.war` folder.

```text
  --src          Source Folder         [default: "./studio/resources/nuxeo.war"]
```

You can watch several source folders:

```bash
nuxeo sync --src "<src1_folder>" --src "<src2_folder>" --src "<src3_folder>" --dest "<dest_folder"
```

You can fine tune which files are tracked, by overriding the `pattern` option:

```bash
nuxeo sync --pattern "*.js"
```

#### Options

```text
Options:
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version                                          [boolean]
  -n             Quiet - Hide welcome message                          [boolean]
  --src          Source Folder                     [default: "/tmp/watcher/src"]
  --dest         Destination Folder      [string] [default: "/tmp/watcher/dest"]
  --pattern      Glob matching pattern for synchronizable files
                              [default: "*.+(js|html|jpg|gif|svg|png|json|jsp)"]
```

### Update

```bash
nuxeo update
```

Update internal `generator-nuxeo` module to gets latest changes without updating `nuxeo-cli`.

### Bootstrap

```bash
nuxeo bootstrap [<generator>..] [options]
```

See: [Generator Nuxeo Bootstrap](https://github.com/nuxeo/generator-nuxeo/#available-generators)

#### Bootstrap Script

Script project bootstrap by passing questions' answers as command options.

```bash
nuxeo-bootstrap [<generator>..] [options]
```

##### Options

```text
Options:
  --dry-run, -n  Don't actually create the file(s), just list parameters,
                 default values and errors.                     [default: false]
  --help         Show help                                             [boolean]
```

##### Examples

Dry-run an operation creation to check parameters names and default values:

```bash
nuxeo-bootstrap operation -n
```

Create a single-module plus an operation:

```bash
nuxeo-bootstrap single-module operation --package com.sample --operation_name SampleOperation --operation_label="My Sample Operation"
```

### hotreload

```bash
nuxeo hotreload [hotreload|configure] [options]
```

See: [Generator Nuxeo Hotreload](https://github.com/nuxeo/generator-nuxeo/#hot-reload)

### studio

```bash
nuxeo studio [link|unlink] [options]
```

Link or Unlink your project to your Studio project to package it easily and be able to test ev erything together.

```bash
nuxeo studio import
```

Import in your project a constant file containing your Studio features in order to reuse them easily in your code.

```bash
nuxeo studio export
```

Export your project's contributions to the Studio registries in order to reuse them in Studio.

## Proxy

Proxy configuration rely on the common Unix environment variable `HTTP_PROXY` or `http_proxy`. Value format: `[username:password@]www.host.com[:1334]`

```bash
HTTP_PROXY=john:doe@fake.proxy:1337 nuxeo b multi-module
```

## Tester/Developer Environment

Lots of Nuxeo CLI logic is held in [generator-nuxeo](https://github.com/nuxeo/generator-nuxeo/) project. You must link both projects to be able to have live modifications.

```bash
npm install -g nuxeo/nuxeo-cli#master
```

## Release

Release tag and dependencies lock are plugged to the `version` NPM's [command](https://docs.npmjs.com/cli/version).

### When you bump the version

#### `preversion` task

- `node_modules` folder and `package-lock.json` file are deleted.
- `generator-nuxeo` dependency installed using the latest release.
- Install all the others dependencies.
- add `package-lock.json` file to the next commit.

#### `postversion` task

- run `npm publish`
- remove `package-lock.json` for the next commit.
- bump module version without a new tag.
- install `generator-nuxeo#master`.
- add a post-release commit.
- push everything.

### Examples

```
# bump major version
npm version major

# bump patch
npm version patch
```

# Licensing

[Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)

# About Nuxeo

Nuxeo dramatically improves how content-based applications are built, managed and deployed, making customers more agile, innovative and successful. Nuxeo provides a next generation, enterprise ready platform for building traditional and cutting-edge content oriented applications. Combining a powerful application development environment with SaaS-based tools and a modular architecture, the Nuxeo Platform and Products provide clear business value to some of the most recognizable brands including Verizon, Electronic Arts, Sharp, FICO, the U.S. Navy, and Boeing. Nuxeo is headquartered in New York and Paris. More information is available at [www.nuxeo.com](http://www.nuxeo.com).
