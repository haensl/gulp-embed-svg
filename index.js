const through = require('through2');
const cheerio = require('cheerio');
const gutil = require('gulp-util');
const fs = require('fs');
const path = require('path');

const PLUGIN_NAME = require('./package').name;
const defaults = {
  selectors: [
    'img[src$=".svg"]',
    'svg[src$=".svg"]'
  ],
  attrs: /^(?!src).*$/,
  root: __dirname
};

module.exports = (opts = {}) =>
  through.obj((file, encoding, callback) => {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      return callback(new gutil.PluginError(PLUGIN_NAME, 'Streams are not supported.'));
    }

    const options = Object.assign({}, defaults, opts);

    if (typeof options.root !== 'string') {
      return callback(new gutil.PluginError(PLUGIN_NAME, 'Invalid option: root must be a string'));
    } else if (!fs.existsSync(options.root)) {
      return callback(new gutil.PluginError(PLUGIN_NAME, `Invalid option: root path ${options.root} does not exist`));
    }

    if (typeof options.attrs === 'string') {
      options.attrs = new RegExp(options.attrs);
    } else if (!(options.attrs instanceof RegExp)) {
      return callback(new gutil.PluginError(PLUGIN_NAME, 'Invalid option: attrs must be either RegExp or string'));
    }

    let selectors;
    if (Array.isArray(options.selectors)) {
      selectors = options.selectors.filter((selector) => typeof selector === 'string')
        .join(',');
    } else if (typeof options.selectors === 'string') {
      selectors = options.selectors;
    } else {
      return callback(new gutil.PluginError(PLUGIN_NAME, `Invalid option: selectors must be either string or Array`));
    }

    const $ = cheerio.load(file.contents.toString());
    let didInline = false;

    $(selectors)
      .each(function() {
        let img = $(this);
        const src = img.attr('src');
        const absSrc = path.resolve(path.join(options.root, src));

        if (src
          && fs.existsSync(absSrc)
          && fs.statSync(absSrc).isFile()) {
          try {
            const svg = $(fs.readFileSync(absSrc, 'utf8'));
            if (options.attrs) {
              Object.keys(img[0].attribs).filter((attr) => options.attrs.test(attr))
                .forEach((attr) => svg.attr(attr, img.attr(attr)));
            }
            img.after($(svg));
            img.remove();
            didInline = true;
          } catch (e) {
            return callback(new gutil.PluginError(PLUGIN_NAME, e));
          }
        } else {
          return callback(new gutil.PluginError(PLUGIN_NAME, `Invalid source path: ${src}`));
        }
      });

    if (didInline) {
      file.contents = new Buffer($.html());
    }

    callback(null, file);
  });
