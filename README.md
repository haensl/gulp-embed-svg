# gulp-embed-svg

[![NPM](https://nodei.co/npm/gulp-embed-svg.png?downloads=true)](https://nodei.co/npm/gulp-embed-svg/)
[![npm version](https://badge.fury.io/js/gulp-embed-svg.svg)](http://badge.fury.io/js/gulp-embed-svg)
[![Build Status](https://travis-ci.org/haensl/gulp-embed-svg.svg?branch=master)](https://travis-ci.org/haensl/gulp-embed-svg)

Gulp plugin to inline/embed SVG images into html files.

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

### selectors `string | Array<string>`

Provide custom CSS selectors to specify which tags should be replaced by embedded SVGs.

#### default: `['img[src$=".svg"]', 'svg[src$=".svg"]']`

All `<img>` and `<svg>` tags with an svg source.

#### Example: Only embed tags with a specific class
HTML layout
```html
<html>
  <head><!-- ... --></head>
  <body>
    <!-- ... -->
    <svg src="github-icon.svg" class="inline-svg"></svg>
    <img src="other-icon.svg" />
    <!-- ... -->
  </body>
</html>
```

Gulp task
```javascript
const embedSvg = require('gulp-embed-svg');

gulp.task('embedSvgs', () =>
  gulp.src('*.html')
    .pipe(embedSvg({
      selectors: '.inline-svg' // only replace tags with the class inline-svg
    }))
    .pipe(gulp.dest('dist/')));
```

Output
```html
<html>
  <head><!-- ... --></head>
  <body>
    <!-- ... -->
    <svg class="inline-svg"><!-- svg markup from github-icon.svg --></svg>
    <img src="other-icon.svg" />
    <!-- ... -->
  </body>
</html>
```


### attrs `string | RegExp`

Provide a regular expression to transfer select attributes from matched tags to embedded `<svg>`s.

**Attention:** Attributes from matched tags take precedence over corresponding attributes in the source `.svg` file.

#### default: `^(?!src).*$`

Transfer/preserve any attribute **but** `src`.

#### Example: Preserve/transfer specific attribute
HTML layout
```html
<html>
<head><!-- ... --></head>
<body>
  <!-- ... -->
  <svg src="github-icon.svg" class="icon"></svg>
  <!-- ... -->
</body>
</html>
```

Gulp task
```javascript
const embedSvg = require('gulp-embed-svg');

gulp.task('embedSvgs', () =>
  gulp.src('*.html')
    .pipe(embedSvg({
      attrs: /class/ // only transfer/preserve class attribute
    }))
    .pipe(gulp.dest('dist/')));
```

Output
```html
<html>
  <head><!-- ... --></head>
  <body>
    <!-- ... -->
    <svg class="icon"><!-- svg markup from github-icon.svg --></svg>
    <!-- ... -->
  </body>
</html>
```


### root `string`

Provide the root folder where SVG source images are located.

#### default: `__dirname`

The folder in which the task is executed.

#### Example: Alternate svg root

HTML layout

```html
<html>
  <head><!-- ... --></head>
  <body>
    <!-- ... -->
    <svg src="github-icon.svg"></svg>
    <!-- ... -->
  </body>
</html>
```

Folder structure
```bash
  /src
    index.html
    gulpfile.js
    /assets
      github-icon.svg
```

Gulp task
```javascript
const embedSvg = require('gulp-embed-svg');

gulp.task('embedSvgs', () =>
  gulp.src('*.html')
    .pipe(embedSvg({
      root: './assets'
    }))
    .pipe(gulp.dest('dist/')));
```


## [Changelog](CHANGELOG.md)

## [License](LICENSE)
