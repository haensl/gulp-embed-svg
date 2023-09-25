const { basename, join, resolve } = require('path');
const expect = require('chai').expect;
const gulp = require('gulp');
const through = require('through2');
const fs = require('fs');
const cheerio = require('cheerio');
const inlineSvg = require('../lib');
const fixtures = (glob) => join(__dirname, 'fixtures', glob);

describe('gulp-inline-svg', () => {
  describe('svg tag with src attribute', () => {
    let output;

    beforeEach((done) => {
      gulp.src(fixtures('svg.html'))
        .pipe(inlineSvg({
          root: resolve(__dirname, '..')
        }))
        .pipe(through.obj((file) => {
          output = file.contents.toString();
          done();
        }));
    });

    it('replaces the svg tag with the svg file', () => {
      expect(/class="github-icon"/.test(output)).to.be.true;
    });

    it('retains all attributes except src', () => {
      expect(/some-attr="test"/.test(output)).to.be.true;
      expect(/src=/.test(output)).to.be.false;
    });
  });

  describe('cyrillic text', () => {
    let output;

    describe('with decodeEntities set to false', () => {
      beforeEach((done) => {
        gulp.src(fixtures('cyrillic-svg.html'))
          .pipe(inlineSvg({
            root: resolve(__dirname, '..')
          }))
          .pipe(through.obj((file) => {
            output = file.contents.toString();
            done();
          }));
      });

      it('replaces the svg tag with the svg file', () => {
        expect(/class="github-icon"/.test(output)).to.be.true;
      });

      it('retains all attributes except src', () => {
        expect(/some-attr="test"/.test(output)).to.be.true;
        expect(/src=/.test(output)).to.be.false;
      });

      it('does not replace the cyrillic text with entities', () => {
        expect(/Узнай о нас больше/g.test(output)).to.be.true;
      });
    });

    describe('with decodeEntities set to true', () => {
      beforeEach((done) => {
        gulp.src(fixtures('cyrillic-svg.html'))
          .pipe(inlineSvg({
            root: resolve(__dirname, '..'),
            decodeEntities: true
          }))
          .pipe(through.obj((file) => {
            output = file.contents.toString();
            done();
          }));
      });

      it('replaces the svg tag with the svg file', () => {
        expect(/class="github-icon"/.test(output)).to.be.true;
      });

      it('retains all attributes except src', () => {
        expect(/some-attr="test"/.test(output)).to.be.true;
        expect(/src=/.test(output)).to.be.false;
      });

      it('replaces the cyrillic text with entities', () => {
        console.log(output);
        expect(/&#x423;&#x437;&#x43d;&#x430;&#x439; &#x43e; &#x43d;&#x430;&#x441; &#x431;&#x43e;&#x43b;&#x44c;&#x448;&#x435;/.test(output)).to.be.true;
      });
    });
  });

  describe('img tag with svg src attribute', () => {
    let output;

    beforeEach((done) => {
      gulp.src(fixtures('img.html'))
        .pipe(inlineSvg({
          root: resolve(__dirname, '..')
        }))
        .pipe(through.obj((file) => {
          output = file.contents.toString();
          done();
        }));
    });

    it('replaces the svg tag with the svg file', () => {
      expect(/class="github-icon"/.test(output)).to.be.true;
    });

    it('retains all attributes except src', () => {
      expect(/some-attr="test"/.test(output)).to.be.true;
      expect(/alt="a svg"/.test(output)).to.be.true;
      expect(/src=/.test(output)).to.be.false;
    });
  });

  describe('no img tag', () => {
    let output;
    let input;

    beforeEach((done) => {
      input = fs.readFileSync(fixtures('no-img.html'), 'utf8');
      gulp.src(fixtures('no-img.html'))
        .pipe(inlineSvg({
          root: resolve(__dirname, '..')
        }))
        .pipe(through.obj((file) => {
          output = file.contents.toString();
          done();
        }));
    });

    it('Bypasses the input', () => {
      expect(output).to.equal(input);
    });
  });

  describe('no input', () => {
    it('does not throw', () => {
      expect(inlineSvg).not.to.throw;
    });
  });

  describe('nonexistent src', () => {
    it('throws an exception', () => {
      expect(() => gulp.src(fixtures('nonexistent-src.html'))
        .pipe(inlineSvg())).to.throw;
    });
  });

  describe('nonclosing img tag', () => {
    let output;

    beforeEach((done) => {
      gulp.src(fixtures('non-closing-img-tag.html'))
      .pipe(inlineSvg({
        root: './test/fixtures/svg-root'
      }))
      .pipe(through.obj((file) => {
        output = file.contents.toString();
        done();
      }));
    });

    it('embeds the svg', () => {
      expect(/svg/.test(output)).to.be.true;
    });

    it('preserves the header preceeding it', () => {
      expect(/header/.test(output)).to.be.true;
    });

    it('does not preserve the container following it', () => {
      expect(/div/.test(output)).to.be.false;
    });
  });

  describe('self-closing img tag', () => {
    let output;

    beforeEach((done) => {
      gulp.src(fixtures('self-closing-img-tag.html'))
      .pipe(inlineSvg({
        root: './test/fixtures/svg-root'
      }))
      .pipe(through.obj((file) => {
        output = file.contents.toString();
        done();
      }));
    });

    it('embeds the svg', () => {
      expect(/svg/.test(output)).to.be.true;
    });

    it('preserves the header preceeding it', () => {
      expect(/header/.test(output)).to.be.true;
    });

    it('preserves the container following it', () => {
      expect(/div/.test(output)).to.be.true;
    });
  });

  describe('options', () => {
    describe('selectors', () => {
      let output;

      describe('string', () => {
        beforeEach((done) => {
          gulp.src(fixtures('custom-selectors.html'))
            .pipe(inlineSvg({
              root: resolve(__dirname, '..'),
              selectors: '.select-me'
            }))
            .pipe(through.obj((file) => {
              output = file.contents.toString();
              done();
            }));
        });

        it('should process custom selected tags', () => {
          expect(/svg class="select-me"/.test(output)).to.be.true;
        });

        it('should not process default selectors', () => {
          expect(/svg src="do-not-select-me.svg"/.test(output)).to.be.true;
        });
      });

      describe('array of strings', () => {
        beforeEach((done) => {
          gulp.src(fixtures('custom-selectors.html'))
            .pipe(inlineSvg({
              root: resolve(__dirname, '..'),
              selectors: ['.select-me', '.also-select-me']
            }))
            .pipe(through.obj((file) => {
              output = file.contents.toString();
              done();
            }));
        });

        it('should process tags with select-me class', () => {
          expect(/svg class="select-me"/.test(output)).to.be.true;
        });

        it('should process tags with also-select-me class', () => {
          expect(/svg class="also-select-me"/.test(output)).to.be.true;
        });

        it('should not process default selectors', () => {
          expect(/svg src="do-not-select-me.svg"/.test(output)).to.be.true;
        });
      });

      describe('invalid selectors', () => {
        it('should throw an exception', () => {
          expect(() => gulp.src(fixtures('custom-selectors.html'))
            .pipe(inlineSvg({
              selectors: {
                foo: 'bar'
              }
            }))).to.throw;
        });
      });
    });

    describe('decodeEntities', () => {
      describe('non boolean', () => {
        it('should throw an exception()', () => {
          expect(() => fixtures('cyrillic-svg.html')
            .pipe(inlineSvg({
              decodeEntities: 'foobar'
            }))).to.throw;
        });
      });
    });

    describe('attrs', () => {
      describe('retain all attrs', () => {
        let output;

        describe('string', () => {
          beforeEach((done) => {
            gulp.src(fixtures('svg.html'))
              .pipe(inlineSvg({
                root: resolve(__dirname, '..'),
                attrs: '.*'
              }))
              .pipe(through.obj((file) => {
                output = file.contents.toString();
                done();
              }));
          });

          it('preserves some-attr attribute', () => {
            expect(/some-attr="test"/.test(output)).to.be.true;
          });

          it('preserves src attribute', () => {
            expect(/src=".+"/.test(output)).to.be.true;
          });
        });

        describe('RegExp', () => {
          beforeEach((done) => {
            gulp.src(fixtures('svg.html'))
              .pipe(inlineSvg({
                root: resolve(__dirname, '..'),
                attrs: /.*/
              }))
              .pipe(through.obj((file) => {
                output = file.contents.toString();
                done();
              }));
          });

          it('preserves some-attr attribute', () => {
            expect(/some-attr="test"/.test(output)).to.be.true;
          });

          it('preserves src attribute', () => {
            expect(/src=".+"/.test(output)).to.be.true;
          });
        });
      });

      describe('specific attr', () => {
        let output;

        describe('string', () => {
          beforeEach((done) => {
            gulp.src(fixtures('specific-attr.html'))
              .pipe(inlineSvg({
                root: resolve(__dirname, '..'),
                attrs: 'some-attr'
              }))
              .pipe(through.obj((file) => {
                output = file.contents.toString();
                done();
              }));
          });

          it('preserves some-attr attribute', () => {
            expect(/some-attr="test"/.test(output)).to.be.true;
          });

          it('discards src attribute', () => {
            expect(/src=".+"/.test(output)).to.be.false;
          });

          it('discards another-attr attribute', () => {
            expect(/another-attr/.test(output)).to.be.false;
          });
        });

        describe('RegExp', () => {
          beforeEach((done) => {
            gulp.src(fixtures('specific-attr.html'))
              .pipe(inlineSvg({
                root: resolve(__dirname, '..'),
                attrs: /some-attr/
              }))
              .pipe(through.obj((file) => {
                output = file.contents.toString();
                done();
              }));
          });

          it('preserves some-attr attribute', () => {
            expect(/some-attr="test"/.test(output)).to.be.true;
          });

          it('discards src attribute', () => {
            expect(/src=".+"/.test(output)).to.be.false;
          });

          it('discards another-attr attribute', () => {
            expect(/another-attr/.test(output)).to.be.false;
          });
        });
      });

      describe('non string or RegExp', () => {
        it('throws an error', () => {
          expect(() => gulp.src(fixtures('svg.html'))
            .pipe(inlineSvg({
              attrs: {
                foo: 'bar'
              }
            }))).to.throw;
        });
      });
    });

    describe('root', () => {
      describe('string', () => {
        describe('valid path', () => {
          let output;
          beforeEach((done) => {
            gulp.src(fixtures('svg-root.html'))
              .pipe(inlineSvg({
                root: './test/fixtures/svg-root'
              }))
              .pipe(through.obj((file) => {
                output = file.contents.toString();
                done();
              }));
          });

          it('searches for the svg root in the given root folder', () => {
            expect(/class="github-icon"/.test(output)).to.be.true;
          });
        });

        describe('invalid path', () => {
          it('throws an error', () => {
            expect(() => gulp.src(fixtures('svg-root.html'))
              .pipe(inlineSvg({
                root: './test/fixtures/does-not-exist'
              }))).to.throw;
          });
        });
      });

      describe('non string', () => {
        it('throws an error', () => {
          expect(() => gulp.src(fixtures('svg-root.html'))
            .pipe(inlineSvg({
              root: {
                foo: 'bar'
              }
            }))).to.throw;
        });
      });
    });

    describe('createSpritesheet', () => {
      describe('true', () => {
        let output;
        beforeEach((done) => {
          gulp.src(fixtures('three-svgs.html'))
            .pipe(inlineSvg({
              root: resolve(__dirname, '..'),
              createSpritesheet: true
            }))
            .pipe(through.obj((file) => {
              output = file.contents.toString();
              done();
            }));
        });

        it('inserts an svg spritesheet into the body', () => {
          expect(/<svg class="svg-sprites"/.test(output)).to.be.true;
        });

        it('inserts an svg referencing the first symbol', () => {
          expect(/<svg[^>]+><use xlink:href="#svg-sprite-0"/.test(output)).to.be.true;
        });

        it('inserts an svg referencing the second symbol', () => {
          expect(/<svg[^>]+><use xlink:href="#svg-sprite-1"/.test(output)).to.be.true;
        });
      });

      describe('svg with gradient', () => {
        let output;
        let $;

        beforeEach((done) => {
          gulp.src(fixtures('gradient.html'))
            .pipe(inlineSvg({
              root: resolve(__dirname, '..'),
              createSpritesheet: true
            }))
            .pipe(through.obj((file) => {
              output = file.contents.toString();
              $ = cheerio.load(output, {
                xmlMode: true
              });
              done();
            }));
        });

        it('extracts the gradient into the spritesheet', () => {
          expect($('.svg-sprites').find('linearGradient').length).to.equal(2);
        });

        it('removes the gradient from the symbol', () => {
          expect($('.svg-sprites symbol linearGradient').length).to.equal(0);
        });
      });

      describe('non-boolean', () => {
        it('throws an error', () => {
          expect(() => gulp.src(fixtures('three-svgs.html'))
            .pipe(inlineSvg({
              createSpritesheet: 'foo'
            }))).to.throw;
        });
      });
    });

    describe('spritesheetClass', () => {
      describe('string', () => {
        let output;
        beforeEach((done) => {
          gulp.src(fixtures('three-svgs.html'))
            .pipe(inlineSvg({
              root: resolve(__dirname, '..'),
              createSpritesheet: true,
              spritesheetClass: 'my-sprites'
            }))
            .pipe(through.obj((file) => {
              output = file.contents.toString();
              done();
            }));
        });

        it('inserts an svg spritesheet into the body with the given class', () => {
          expect(/<svg class="my-sprites"/.test(output)).to.be.true;
        });

        it('inserts an svg referencing the first symbol', () => {
          expect(/<svg[^>]+><use xlink:href="#svg-sprite-0"/.test(output)).to.be.true;
        });

        it('inserts an svg referencing the second symbol', () => {
          expect(/<svg[^>]+><use xlink:href="#svg-sprite-1"/.test(output)).to.be.true;
        });
      });

      describe('non-string', () => {
        it('throws an error', () => {
          expect(() => gulp.src(fixtures('three-svgs.html'))
            .pipe(inlineSvg({
              spritesheetClass: 123
            }))).to.throw;
        });
      });
    });

    describe('spriteIdFn', () => {
      describe('function', () => {
        let output;
        beforeEach((done) => {
          gulp.src(fixtures('three-svgs.html'))
            .pipe(inlineSvg({
              root: resolve(__dirname, '..'),
              createSpritesheet: true,
              spriteIdFn: (path) => basename(path, '.svg')
            }))
            .pipe(through.obj((file) => {
              output = file.contents.toString();
              done();
            }));
        });

        it('inserts an svg spritesheet into the body', () => {
          expect(/<svg class="svg-sprites"/.test(output)).to.be.true;
        });

        it('sets the id property of the first sprite correcty', () => {
          expect(/<symbol id="test"/.test(output)).to.be.true;
        });

        it('sets the id property of the second sprite correcty', () => {
          expect(/<symbol id="test2"/.test(output)).to.be.true;
        });
      });

      describe('non-function', () => {
        it('throws an error', () => {
          expect(() => gulp.src(fixtures('three-svgs.html'))
            .pipe(inlineSvg({
              spriteIdFn: {}
            }))).to.throw;
        });
      });
    });
  });
});
