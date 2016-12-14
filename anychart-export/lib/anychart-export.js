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
  var window = anychart.getGlobal();
  var document = window.document;

  var fs = require('fs');
  var opentype = require('opentype.js');
  var spawnSync = require('child_process').spawnSync;
  var spawn = require('child_process').spawn;
  var extend = require('util')._extend;
  var async = require('async');

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


  function isPercent(value) {
    var l = value.length - 1;
    return (typeof value == 'string') && l >= 0 && value.indexOf('%', l) == l;
  }

  function loadDefaultFonts(callback) {

  }

  function loadDefaultFontsSync() {
    var fontFilesList = fs.readdirSync(__dirname + '/../fonts');

    for (var i = 0, len = fontFilesList.length; i < len; i++) {
      var fileName = fontFilesList[i];
      var fontName = fileName.split('.')[0];
      if (!fonts[fontName]) {
        fonts[fontName] = opentype.loadSync(__dirname + '/../fonts/' + fileName);
      }
    }
    return fonts;
  }

  loadDefaultFontsSync();

  function anychartify() {
    document.createElementNS = function(ns, tagName) {
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

  anychartify();

  function exportToPng_() {
    var $container = $('#container svg')[0];
    var svg = $container.outerHTML;
    var convert, buffer;

    fs.writeFile('gg.svg', svg, function() {
      console.log('Written to gg.svg');
    });

// Start convert
    convert = spawn('convert', ['svg:-', 'png:-']);

// Pump in the svg content
    convert.stdin.write(svg);
    convert.stdin.end();

// Write the output of convert straight to the response
    convert.stdout.on('data', function(data) {
      try {
        var prevBufferLength = (buffer ? buffer.length : 0),
            newBuffer = new Buffer(prevBufferLength + data.length);

        if (buffer) {
          buffer.copy(newBuffer, 0, 0);
        }

        data.copy(newBuffer, prevBufferLength, 0);

        buffer = newBuffer;
      } catch (e) {
        console.log(e);
      }
    });

    convert.on('exit', function(code) {
      fs.writeFile('chart.png', buffer, function() {
        console.log('Written to chart.png');
        process.exit(0);
      });
    });
  }

  function isFunction(value) {
    return typeof(value) == 'function';
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
    var svg = svgElement.outerHTML;
    return svg;
  }

  // function getImageConverter() {
  //   if (!convertersPool)
  //     convertersPool = new ChildPool(__dirname + '/image-converter-worker');
  //   return convertersPool;
  // }


  function setup_R_job(job, done) {
    var R = spawn('convert', ['svg:-', job.params.type + ':-']);
    var buffer;

    R.stdin.write(job.svg);
    R.stdin.end();

    R.stdout.on('data', function(data) {
      // console.log(job.params.target.id, 'onData', data);
      try {
        buffer = data;
      } catch (err) {
        job.callback(err, null);
        done();
      }
    });

    R.on('close', function(code) {
      // console.log(job.params.target.id, 'onExit', code, buffer);
      job.callback(null, buffer, job.params.target);
      done();
    });
  }

  var course_queue = async.queue(setup_R_job, 10);


  function convertSvgToImageData(svg, params, callback) {
    course_queue.push({svg: svg, params: params, callback: callback});

    // exec('ls', function(err, stdout, stderr) {
    //   console.log(stdout);
    // });
    // q.push(function(cb) {
    //   console.log('!!!');
    //   // callback(null, convertSvgToImageDataSync(svg, params), params.target);
    //   // cb();
    //
    //   var convert = spawn('convert', ['svg:-', params.type + ':-']);
    //   var buffer;
    //
    //   convert.stdin.write(svg);
    //   convert.stdin.end();
    //
    //   convert.stdout.on('data', function(data) {
    //     console.log('+++');
    //     try {
    //       buffer = data;
    //     } catch (err) {
    //       callback(err, null);
    //       cb();
    //     }
    //   });
    //
    //   convert.on('exit', function(code) {
    //     console.log(code, buffer);
    //     callback(null, buffer, params.target);
    //     cb();
    //   });
    // });
    //
    // q.start();
    //
    // console.log('length: ' + q.length);


    // var convert = spawn('convert', ['svg:-', params.type + ':-']);
    // var buffer;
    //
    // // console.log(convert);
    //
    // convert.stdin.write(svg);
    // convert.stdin.end();
    //
    // convert.stdout.on('data', function(data) {
    //   try {
    //     buffer = data;
    //   } catch (err) {
    //     callback(err, null);
    //   }
    // });
    //
    // convert.on('exit', function(code) {
    //   callback(null, buffer);
    // });
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

  function exportTo(target, options, callback) {
    var params = getParams(arguments);
    params.target = target;
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
  }

  function exportToSync(target, options) {
    var params = getParams(arguments);
    var svg = getSvg(target, params);

    return params.type == 'svg' ? svg : convertSvgToImageDataSync(svg, params);
  }

  function loadFont(path, callback) {

  }

  function loadFontSync(path, callback) {

  }

  exports.exportTo = exportTo;
  exports.exportToSync = exportToSync;
  exports.loadFont = loadFont;
  exports.loadFontSync = loadFontSync;

  return exports;
});