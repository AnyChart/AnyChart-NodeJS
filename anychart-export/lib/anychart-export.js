var fs = require('fs');
// var jsdom = require('jsdom').jsdom;
var opentype = require('opentype.js');
var spawn = require('child_process').spawn;
var fonts = {};

// var document = jsdom('<div id="container"></div>');
// var window = document.defaultView;

// var anychart = require('anychart')(window);
var $ = require("jquery");
$(window);


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

function anychartify(window) {
  window.document.createElementNS = function(ns, tagName) {
    var elem = window.document.createElement(tagName);
    elem.getBBox = function() {
      var text = $(elem).text();
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

anychartify(window);

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

function exportTo(target, option, callback) {
  target.container('container').draw();

  var $container = $('#container svg')[0];
  var svg = $container.outerHTML;
  var convert, buffer;

  convert = spawn('convert', ['svg:-', 'png:-']);

  convert.stdin.write(svg);
  convert.stdin.end();

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
    callback.call(null, buffer);
  });
}

function exportToSync(target, option) {


}

function loadFont(path, callback) {

}

function loadFontSync(path, callback) {

}


exports.exportTo = exportTo;
exports.exportToSync = exportToSync;
exports.loadFont = loadFont;
exports.loadFontSync = loadFontSync;