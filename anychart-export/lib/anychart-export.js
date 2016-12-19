(function(anychart, factory){
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
  debugger;
  // var window = anychart.getGlobal();
  var document = anychart.getGlobal().document;

  var fs = require('fs');
  var opentype = require('opentype.js');
  var spawnSync = require('child_process').spawnSync;
  var spawn = require('child_process').spawn;
  var execSync = require('child_process').execSync;
  var extend = require('util')._extend;
  var async = require('async');
  var defaultFontsDir = __dirname + '/../fonts';
  var promiseLibrary = typeof global.Promise == 'function' ? global.Promise : require('es6-promise').Promise;

  // var exec = require('exec-queue');
  //
  // var queue = require('queue');
  // var q = queue();
  // q.concurrency = 4;
  // q.timeout = 1;

  // var ChildPool = require('child-pool');
  // ChildPool.isBackground(true);
  // var convertersPool;

  // var $ = require("jquery")(window);
  // var im = require('imagemagick');
  // var Stream = require('stream').Stream;
  // var Inkscape = require('inkscape');
  // var svink = require('svink').svink;

  // var document = jsdom('<div id="container"></div>');
  // var window = document.defaultView;

  // var anychart = require('anychart')(window);


  var convertQueue = async.queue(workerForConverting, getAvailableProcessesCount());
  var fonts = {};
  var defaultImageSettings = [
    {
      name: 'type',
      value: 'png'
    },
    {
      name: 'width',
      value: 1024
    },
    {
      name: 'height',
      value: 768
    },
    {
      name: 'quality',
      value: 92
    }
  ];
  var loadingDefaultFontsStarted = false;
  var fontsCount = 0;
  var loadedFonts = 0;


//region --- Utils and settings
  function isPercent(value) {
    var l = value.length - 1;
    return (typeof value == 'string') && l >= 0 && value.indexOf('%', l) == l;
  }

  function isFunction(value) {
    return typeof(value) == 'function';
  }

  function checkIfAllFontsLoaded(callback) {
    loadedFonts++;
    if (fontsCount == loadedFonts) {
      loadingDefaultFontsStarted = false;
      callback();
    }
  }

  function concurrency(count) {
    var availableProcForExec = getAvailableProcessesCount();

    if (count > availableProcForExec) {
      count = availableProcForExec;
      console.log('Warning! You can spawn only ' + availableProcForExec + ' process at a time.');
    }

    convertQueue.concurrency = count;
  }

  function anychartify(doc) {
    doc.createElementNS = function(ns, tagName) {
      var elem = document.createElement(tagName);
      elem.getBBox = function() {
        var text = elem.innerHTML;
        var fontSize = parseFloat(elem.getAttribute('font-size'));
        var fontFamily = elem.getAttribute('font-family');
        var fontsArr = fontFamily.split(', ');

        var font;
        for (var i = 0, len = fontsArr.length; i < len; i++) {
          if (font = fonts[fontsArr[i]])
            break;
        }
        if (!font)
          font = fonts['Verdana'];

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

        // console.log({x: 0, y: top,  width: width, height: height});

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

    extend(params, defaultImageSettings);
    if (typeof options == 'string') {
      params.type = options;
    } else if (typeof options == 'object') {
      extend(params, options)
    }

    return params;
  }

  function getSvg(target, params) {
    var svg;
    if (typeof target == 'string') {
      svg = target;
    } else {
      var container = target.container();
      if (!container) {
        console.log('Warning! Target chart has not container. Use container() method to set it.');
        return '';
      }
      var bounds = target.bounds();
      if (isPercent(bounds.left) || isPercent(bounds.top) || isPercent(bounds.width) || isPercent(bounds.height)) {
        console.log('Warning! Bounds of chart should be set in pixels. See https://api.anychart.com/7.12.0/anychart.core.Chart#bounds how do it.');
      }

      var svgElement = container.container().getElementsByTagName('svg')[0];
      svg = svgElement.outerHTML;
    }
    return svg;
  }

  function getAvailableProcessesCount() {
    // var proclimit = +spawnSync('ulimit',['-u']).stdout.toString();
    // var procExec = +spawnSync('wc',['-l'], {
    //   input: spawnSync('ps',['ax']).stdout
    // }).stdout;

    var procMetrics = execSync('ulimit -u && ps ax | wc -l').toString().trim().split(/\n\s+/g);
    return procMetrics[0] - procMetrics[1];
  }

  function workerForConverting(task, done) {
    var childProcess;
    try {
      childProcess = spawn('convert', ['svg:-', task.params.type + ':-']);
      var buffer;
      if (typeof childProcess.pid != 'undefined') {
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
            done(err, null, task.params.target);
          }
        });

        childProcess.on('close', function(code) {
          done(null, buffer, task.params.target);
        });
      }
    } catch (err) {
      done(err, null, task.params.target);
    }
  }

  function loadDefaultFonts(callback) {
    if (!loadingDefaultFontsStarted) {
      loadingDefaultFontsStarted = true;

      fs.readdir(defaultFontsDir, function(err, files) {
        //This needs for opentype lib for loading fonts from local.
        fontsCount = files.length;
        loadedFonts = 0;
        for (var i = 0, len = fontsCount; i < len; i++) {
          var fileName = files[i];
          var fontName = fileName.split('.')[0];

          if (!fonts[fontName]) {
            opentype.load(defaultFontsDir + '/' + fileName, function(err, font) {
              var fontName = font.names.fullName.en;
              fonts[fontName] = font;
              checkIfAllFontsLoaded(callback);
            });
          } else {
            checkIfAllFontsLoaded(callback);
          }
        }
      });
    } else {
      console.log('Warning! Loading default fonts already started.');
    }
  }

  function loadDefaultFontsSync() {
    var fontFilesList = fs.readdirSync(defaultFontsDir);

    for (var i = 0, len = fontFilesList.length; i < len; i++) {
      var fileName = fontFilesList[i];
      var fontName = fileName.split('.')[0];
      if (!fonts[fontName]) {
        fonts[fontName] = opentype.loadSync(defaultFontsDir + '/' + fileName);
      }
    }
    return fonts;
  }

  function convertSvgToImageData(svg, params, callback) {
    // var availableProcForExec = getAvailableProcessesCount();
    // if (convertQueue.concurrency > availableProcForExec) {
    //   convertQueue.concurrency = availableProcForExec;
    //   console.log('concurrency changed: ' + availableProcForExec);
    // }
    // convertWorker({svg: svg, params: params}, callback);
    convertQueue.push({svg: svg, params: params}, callback);
  }

  function convertSvgToImageDataSync(svg, params) {
    // var outputSize = '-size ' + parseFloat(params.width) + 'x' + parseFloat(params.height);

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
    var params = getParams(arguments);
    params.target = target;

    if (typeof callback == 'function') {
      if (params.type == 'svg') {
        process.nextTick(function() {
          var svg = getSvg(target, params);
          if (callback) {
            callback.call(null, svg);
          }
        })
      } else {
        var svg = getSvg(target, params);
        convertSvgToImageData(svg, params, callback);
      }
    } else {
      return new promiseLibrary(function(resolve, reject) {
        if (params.type == 'svg') {
          process.nextTick(function() {
            var svg = getSvg(target, params);
            resolve(svg);
          })
        } else {
          var svg = getSvg(target, params);
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
    var svg = getSvg(target, params);

    return params.type == 'svg' ? svg : convertSvgToImageDataSync(svg, params);
  }

  function loadFont(path, callback) {
    if (typeof callback == 'function') {
      opentype.load(path, function(err, font) {
        if (!err)
          fonts[font.names.fullName.en] = font;

        callback(err, font);
      });
    } else {
      console.log(22);
      return new promiseLibrary(function(resolve, reject) {
        console.log(path);
        var window = undefined;
        opentype.load(path, function(err, font) {
          // console.log(err, font);
          if (err) {
            reject(err);
          } else {
            fonts[font.names.fullName.en] = font;
            resolve(font);
          }
        });
      })
    }
  }

  function loadFontSync(path) {
    return fonts[font.names.fullName.en] = opentype.loadSync(path);
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