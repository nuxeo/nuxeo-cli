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

```
npm install -g nuxeo-cli
```

Then `nuxeo` executable should be available; ensure you can run:

```
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
```

## Commands

### Bootstrap

See: [Generator Nuxeo Bootstrap](https://github.com/nuxeo/generator-nuxeo/#available-generators)

### hotreload

See: [Generator Nuxeo Hotreload](https://github.com/nuxeo/generator-nuxeo/#hot-reload)


# Licensing

[Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)

# About Nuxeo

Nuxeo dramatically improves how content-based applications are built, managed and deployed, making customers more agile, innovative and successful. Nuxeo provides a next generation, enterprise ready platform for building traditional and cutting-edge content oriented applications. Combining a powerful application development environment with SaaS-based tools and a modular architecture, the Nuxeo Platform and Products provide clear business value to some of the most recognizable brands including Verizon, Electronic Arts, Sharp, FICO, the U.S. Navy, and Boeing. Nuxeo is headquartered in New York and Paris. More information is available at [www.nuxeo.com](http://www.nuxeo.com).
