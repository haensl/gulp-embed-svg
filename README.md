# gulp-embed-svg

[![NPM](https://nodei.co/npm/gulp-embed-svg.png?downloads=true)](https://nodei.co/npm/gulp-embed-svg/)
[![npm version](https://badge.fury.io/js/gulp-embed-svg.svg)](http://badge.fury.io/js/gulp-embed-svg)
[![Build Status](https://travis-ci.org/haensl/gulp-embed-svg.svg?branch=master)](https://travis-ci.org/haensl/gulp-embed-svg)

Gulp plugin to inlines/embedd SVG images into html files.

## Features

* Inline/embed any images with an SVG source attribute (i.e. `<img src="some.svg">`) and `<svg>` tags with a `src` attribute (i.e. `<svg src="some.svg">`).

* Preserves all/select attributes via RegEx.

## Installation

```shell
npm i --save-dev gulp-embed-svg
```

## Quick Start

```javascript
const embedSvg = require('gulp-embed-svg');

gulp.task('embedSvgs', () =>
  gulp.src('*.html')
    .pipe(embedSvg())
    .pipe(gulp.dest('dist/')));
```

This gulp task will inline/embed any images with an SVG source attribute (i.e. `<img src="some.svg">`) and `<svg>` tags with a `src` attribute.

## Options

### selectors `string | Array<string>` [required]

Provide custom CSS selectors to specify which tags should be replaced by embedded SVGs.

#### default: `['img[src$=".svg"]', 'svg[src$=".svg"]']`

All `<img>` and `<svg>` tags with an svg source.

#### Example: Only embed tags with a specific class
```javascript
const embedSvg = require('gulp-embed-svg');

gulp.task('embedSvgs', () =>
  gulp.src('*.html')
    .pipe(embedSvg({
      selectors: '.inline-svg' // only replace tags with the class inline-svg
    }))
    .pipe(gulp.dest('dist/')));
```

### attrs `string | RegExp` [optional]

Provide a regular expression to transfer select attributes from matched tags to embedded `<svg>`s.

**Attention:** Attributes from matched tags take precedence over corresponding attributes in the source `.svg` file.

#### default: `^(?!src).*$`

Transfer/preserve any attribute **but `src`.

#### Example: Preserve/transfer specific attribute
```javascript
const embedSvg = require('gulp-embed-svg');

gulp.task('embedSvgs', () =>
  gulp.src('*.html')
    .pipe(embedSvg({
      attrs: /class/ // only transfer/preserve class attribute
    }))
    .pipe(gulp.dest('dist/')));
```

## [Changelog](CHANGELOG.md)

## [License](LICENSE)
