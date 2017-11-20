const join = require('path').join;
const expect = require('chai').expect;
const gulp = require('gulp');
const through = require('through2');
const fs = require('fs');
const inlineSvg = require('../');
const fixtures = (glob) => join(__dirname, 'fixtures', glob);

describe('gulp-inline-svg', () => {
  describe('svg tag with src attribute', () => {
    let output;

    beforeEach((done) => {
      gulp.src(fixtures('svg.html'))
        .pipe(inlineSvg())
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

  describe('img tag with svg src attribute', () => {
    let output;

    beforeEach((done) => {
      gulp.src(fixtures('img.html'))
        .pipe(inlineSvg())
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
        .pipe(inlineSvg())
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

  describe('options', () => {
    describe('selectors', () => {
      let output;

      describe('string', () => {
        beforeEach((done) => {
          gulp.src(fixtures('custom-selectors.html'))
            .pipe(inlineSvg({
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
          expect(() => gulp.src('custom-selectors.html')
            .pipe(inlineSvg({
              selectors: {
                foo: 'bar'
              }
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
      })

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
      let ouput;

      describe('string', () => {
        describe('valid path', () => {
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
  });
});
