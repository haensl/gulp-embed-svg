const through = require('through2');
const cheerio = require('cheerio');
const gutil = require('gulp-util');
const fs = require('fs');
const join = require('path').join;

const PLUGIN_NAME = require('./package').name;
const defaults = {
  selectors: [
    'img[src$=".svg"]',
    'svg[src$=".svg"]'
  ],
  attrs: /^(?!src).*$/
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
    console.log('options', options);

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
        const absSrc = join(__dirname, src);

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
