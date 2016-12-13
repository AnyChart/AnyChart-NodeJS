// (function(anychart, factory) {
//   if (typeof module === 'object' && typeof module.exports === 'object') {
//     if (typeof anychart.getGlobal == 'function') {
//       factory.call(this, anychart);
//     } else {
//       module.exports = function(a) {
//         if (typeof a.getGlobal != 'function') {
//           throw new Error('anychart-export requires a anychart');
//         }
//
//         return factory.call(this, a);
//       };
//     }
//   } else {
//     factory.call(this, anychart)
//   }
// })(typeof anychart !== 'undefined' ? anychart : this, function(anychart) {
//   debugger;
//   var window = anychart.getGlobal();
//   var document = window.document;


(function () {
  var fs = require('fs');
  var opentype = require('opentype.js');
  var spawnSync = require('child_process').spawnSync;
  var spawn = require('child_process').spawn;
  var extend = require('util')._extend;
  // var $ = require("jquery")(window);

  var fonts = {};

// var im = require('imagemagick');
// var Stream = require('stream').Stream;
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
// var Inkscape = require('inkscape');
// var svink = require('svink').svink;


// var document = jsdom('<div id="container"></div>');
// var window = document.defaultView;

// var anychart = require('anychart')(window);

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

  function convertSvgToImageData(svg, params, callback) {
    var convert	= spawn('convert', ['svg:-', params.type + ':-']);
    var imageData;

    convert.stdin.write(svg);
    convert.stdin.end();

    convert.stdout.on('data', function(data) {
      imageData = data;
    });

    convert.on('exit', function(code) {
      callback.call(null, imageData);
    });
  }

  function convertSvgToImageDataSync(svg, params) {
    var outputSize = '-size ' + parseFloat(params.width) + 'x' + parseFloat(params.height);

    var convert = spawnSync('convert',
        ['svg:-', params.type + ':-'],
        {
          input: svg
        });

    return convert.stdout;


    // var opt = {
    //   input: './gg.svg',
    //   output: './graphics.png'
    // };
    //
    // svink(opt);


    // var svgToPdfConverter = new Inkscape(['--export-pdf', '--export-width=1024']);
    //
    // fs.writeFile('./gg.svg', svg, function() {
    //   console.log('Written to gg.svg');
    //   var rs = fs.createReadStream('./gg.svg');
    //   var ws = fs.createWriteStream('./foo.pdf');
    //
    //   rs.on('open', function () {
    //     rs.pipe(svgToPdfConverter).pipe(ws);
    //
    //     console.log('Written to foo.pdf');
    //     process.exit(0);
    //   });
    // });
  }

  function exportTo(target, options, callback) {
    var params = getParams(arguments);
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
})();