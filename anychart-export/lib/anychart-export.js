var fs = require('fs');
// var jsdom = require('jsdom').jsdom;
var opentype = require('opentype.js');
var spawnSync = require('child_process').spawnSync;
var fonts = {};
var document = window.document;
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
// var $ = require("jquery");
// $(window);


(function(global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    if (global.document) {
      factory.call(global);
    } else {
      module.exports = function(w) {
        if (!w.document) {
          throw new Error('anychart-export requires a window with a document');
        }
        window = w;
        document = w.document;

        factory.call(w);

        return w.anychart;
      };
    }
  } else {
    factory.call(global)
  }
})(typeof window !== 'undefined' ? window : this, function() {

});


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

      return {x: 0, y: top,  width: width, height: height};
    };
    return elem;
  };
}

anychartify();

function drawAnyChart() {
  var chart = anychart.column([1, 2, 3, 4, 5]);
  chart.a11y(false);
  chart.title('canvg is a SVG parser and renderer. It takes a URL to a SVG file or the text of an SVG file, parses it in JavaScript, and renders the result on a Canvas element. The rendering speed of the examples is about as fast as native SVG.');
  chart.bounds(0, 0, 800, 600);
  chart.container('container').draw();
}

// drawAnyChart();

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

  var endIndex = callback ? arrLength - 2 : arrLength - 1;
  var optionsArr = Array.prototype.slice.call(args, 1, endIndex);
  var options = {};

  defaultImageSettings.forEach(function(item, index) {
    var option = optionsArr[index];
    options[item.name] = option === void 0 || option === null ? item.value : option;
  });

  return options;
}

function getSvg(target, params) {
  var bounds = target.bounds();
  target.bounds(bounds.left(), bounds.top(), params.width, params.height);
  target.container('container').draw();

  // var $container = $('#container svg')[0];
  var svgElement = document.getElementsByTagName('svg')[0];
  var svg = svgElement.outerHTML;
  return svg;
}

function convertSvgToImageData(svg, params) {
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
  var buffer = exportToSync(target, options);
  callback.call(null, buffer);
}

function exportToSync(target, options) {
  var params = getParams(arguments);
  var svg = getSvg(target, params);
  return convertSvgToImageData(svg, params);
}

function loadFont(path, callback) {

}

function loadFontSync(path, callback) {

}


exports.exportTo = exportTo;
exports.exportToSync = exportToSync;
exports.loadFont = loadFont;
exports.loadFontSync = loadFontSync;