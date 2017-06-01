(function(anychart, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    if (typeof anychart.getGlobal == 'function') {
      factory.call(this, anychart);
    } else {
      module.exports = function(anychart) {
        if (typeof anychart.getGlobal != 'function') {
          throw new Error('anychart-export requires a anychart');
        }

        return factory.call(this, anychart);
      };
    }
  } else {
    factory.call(this, anychart)
  }
})(typeof anychart !== 'undefined' ? anychart : this, function(anychart) {
  var document = anychart.getGlobal().document;

  var fs = require('fs');
  var spawnSync = require('child_process').spawnSync;
  var spawn = require('child_process').spawn;
  var execSync = require('child_process').execSync;
  var extend = require('util')._extend;
  var opentype = require('opentype.js');
  var async = require('async');
  var defaultFontsDir = __dirname + '/../fonts';
  var promiseLibrary = typeof global.Promise == 'function' ? global.Promise : require('es6-promise').Promise;

  var isWin = /^win/.test(process.platform);
  var defaultParallelsTasks = 100;
  var convertQueue = async.queue(workerForConverting, defaultParallelsTasks);
  var fonts = {};
  var defaultBounds = {left: 0, top: 0, width: 1024, height: 768};

//region --- Utils and settings
  function isPercent(value) {
    if (value == null)
      return true;
    var l = value.length - 1;
    return (typeof value == 'string') && l >= 0 && value.indexOf('%', l) == l;
  }

  function isFunction(value) {
    return typeof(value) == 'function';
  }

  function concurrency(count) {
    // var availableProcForExec = getAvailableProcessesCount();
    //
    // if (count > availableProcForExec) {
    //   count = availableProcForExec;
    //   console.log('Warning! You can spawn only ' + availableProcForExec + ' process at a time.');
    // }
    convertQueue.concurrency = count;
  }

  function anychartify(doc) {
    doc.createElementNS = function(ns, tagName) {
      var elem = document.createElement(tagName);
      elem.getBBox = function() {
        var text = elem.textContent;
        var fontSize = parseFloat(elem.getAttribute('font-size'));
        var fontFamily = elem.getAttribute('font-family');
        if (fontFamily) fontFamily = fontFamily.toLowerCase();
        var fontWeight = elem.getAttribute('font-weight');
        if (fontWeight) fontWeight = fontWeight.toLowerCase();
        var fontStyle = elem.getAttribute('font-style');
        if (fontStyle) fontStyle = fontStyle.toLowerCase();

        var fontsArr = fontFamily.split(', ');

        var font;
        for (var i = 0, len = fontsArr.length; i < len; i++) {
          var name = fontsArr[i] + (fontWeight == 'normal' || !isNaN(+fontWeight) ? '' : ' ' + fontWeight) + (fontStyle == 'normal' ? '' : ' ' + fontStyle);
          if (font = fonts[name])
            break;
        }

        if (!font)
          font = fonts['verdana'];

        var scale = 1 / font.unitsPerEm * fontSize;

        var top = -font.ascender * scale;
        var height = Math.abs(top) + Math.abs(font.descender * scale);

        var width = 0;

        font.forEachGlyph(text, 0, 0, fontSize, undefined, function(glyph, x, y, fontSize, options) {
          var metrics = glyph.getMetrics();
          metrics.xMin *= scale;
          metrics.xMax *= scale;
          metrics.leftSideBearing *= scale;
          metrics.rightSideBearing *= scale;

          width += Math.abs(metrics.xMax - metrics.xMin) + metrics.leftSideBearing + metrics.rightSideBearing
        });

        return {x: 0, y: top, width: width, height: height};
      };
      return elem;
    };
  }

  function getParams(args) {
    var arrLength = args.length;
    var lastArg = args[arrLength - 1];
    var callback = isFunction(lastArg) ? lastArg : null;

    var options = arrLength == 1 ? undefined : callback ? args[arrLength - 2] : lastArg;
    var params = {};

    if (typeof options == 'string') {
      params.type = options;
    } else if (typeof options == 'object') {
      extend(params, options)
    }

    return params;
  }

  function fixSvg(svg) {
    return svg
        //jsdom bug - (https://github.com/tmpvar/jsdom/issues/620)
        .replace(/lineargradient/g, 'linearGradient')
        .replace(/radialgradient/g, 'radialGradient')
        .replace(/clippath/g, 'clipPath')
        .replace(/patternunits/g, 'patternUnits')
        //fixes for wrong id naming
        .replace(/(id=")#/g, '$1')
        .replace(/(url\()##/g, '$1#');
  }

  function getSvg(target) {
    var svg;
    if (typeof target == 'string') {
      svg = target;
    } else {
      var isChart = typeof target.draw == 'function';
      var isStage = typeof target.resume == 'function';
      var container, svgElement;
      if (isChart) {
        if (target.animation)
          target.animation(false);
        if (target.a11y)
          target.a11y(false);

        container = target.container();
        if (!container) {
          console.log('Warning! Target chart has not container. Use container() method to set it.');
          return '';
        }
        var bounds = target.bounds();
        if (isPercent(bounds.left()) || isPercent(bounds.top()) || isPercent(bounds.width()) || isPercent(bounds.height())) {
          target.bounds(defaultBounds);
          console.log('Warning! Bounds of chart should be set in pixels. See https://api.anychart.com/7.12.0/anychart.core.Chart#bounds how do it.');
        }
        target.draw();

        svgElement = container.container().getElementsByTagName('svg')[0];
        svg = svgElement.outerHTML;
      } else if (isStage) {
        container = target.container();
        if (!container) {
          console.log('Warning! Target chart has not container. Use container() method to set it.');
          return '';
        }

        svgElement = container.getElementsByTagName('svg')[0];
        svg = svgElement.outerHTML;
      } else {
        console.log('Warning! Wrong format of incoming data.');
        svg = '';
      }
    }

    return fixSvg(svg);
  }

  function getAvailableProcessesCount() {
    //nix way
    var procMetrics = execSync('ulimit -u && ps ax | wc -l').toString().trim().split(/\n\s+/g);
    return procMetrics[0] - procMetrics[1];
  }

  function workerForConverting(task, done) {
    var childProcess;
    try {
      childProcess = spawn(isWin ? 'magick' : 'convert', ['svg:-', task.params.type + ':-']);
      var buffer;
      childProcess.stdin.write(task.svg);
      childProcess.stdin.end();

      childProcess.stdout.on('data', function(data) {
        try {
          var prevBufferLength = (buffer ? buffer.length : 0),
              newBuffer = new Buffer(prevBufferLength + data.length);

          if (buffer) {
            buffer.copy(newBuffer, 0, 0);
          }

          data.copy(newBuffer, prevBufferLength, 0);

          buffer = newBuffer;
        } catch (err) {
          done(err, null);
        }
      });

      childProcess.on('close', function(code) {
        if (!code) {
          done(null, buffer);
        }
      });

      childProcess.on('error', function(err) {
        if (err.code == 'ENOENT') {
          console.log('Warning! Please install imagemagick utility. (https://www.imagemagick.org/script/binary-releases.php)');
        }
        done(err, null);
      });
    } catch (err) {
      done(err, null);
    }
  }

  function loadDefaultFontsSync() {
    var fontFilesList = fs.readdirSync(defaultFontsDir);

    for (var i = 0, len = fontFilesList.length; i < len; i++) {
      var fileName = fontFilesList[i];
      var font = opentype.loadSync(defaultFontsDir + '/' + fileName);
      fonts[font.names.fullName.en.toLowerCase()] = font;
    }

    return fonts;
  }

  function convertSvgToImageData(svg, params, callback) {
    convertQueue.push({svg: svg, params: params}, callback);
  }

  function convertSvgToImageDataSync(svg, params) {
    var convert = spawnSync('convert',
        ['svg:-', params.type + ':-'],
        {
          input: svg
        });

    return convert.stdout;
  }

//endregion utils

//region --- API
  function exportTo(target, options, callback) {
    if (!target) {
      console.log('Can\'t read input data for exporting.');
    }

    var params = getParams(arguments);
    // params.target = target;

    if (typeof callback == 'function') {
      if (params.type == 'svg') {
        process.nextTick(function() {
          var svg = getSvg(target);
          callback(null, svg);
        })
      } else {
        var svg = getSvg(target);
        convertSvgToImageData(svg, params, callback);
      }
    } else {
      return new promiseLibrary(function(resolve, reject) {
        if (params.type == 'svg') {
          process.nextTick(function() {
            var svg = getSvg(target);
            resolve(svg);
          })
        } else {
          var svg = getSvg(target);
          var done = function(err, image) {
            if (err) reject(err);
            else resolve(image);
          };
          convertSvgToImageData(svg, params, done);
        }
      })
    }
  }

  function exportToSync(target, options) {
    var params = getParams(arguments);
    var svg = getSvg(target);

    return params.type == 'svg' ? svg : convertSvgToImageDataSync(svg, params);
  }

  function loadFont(path, callback) {
    if (typeof callback == 'function') {
      opentype.load(path, function(err, font) {
        if (!err)
          fonts[font.names.fullName.en.toLowerCase()] = font;

        callback(err, font);
      });
    } else {
      return new promiseLibrary(function(resolve, reject) {
        opentype.load(path, function(err, font) {
          if (err) {
            reject(err);
          } else {
            fonts[font.names.fullName.en.toLowerCase()] = font;
            resolve(font);
          }
        });
      })
    }
  }

  function loadFontSync(path) {
    return fonts[font.names.fullName.en.toLowerCase()] = opentype.loadSync(path);
  }

//endregion

  loadDefaultFontsSync();
  anychartify(document);

  exports.exportTo = exportTo;
  exports.exportToSync = exportToSync;
  exports.loadFont = loadFont;
  exports.loadFontSync = loadFontSync;
  exports.concurrency = concurrency;

  return exports;
});