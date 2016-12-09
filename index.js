var fs = require('fs');
var jsdom = require('jsdom').jsdom;

var document = jsdom('<div id="container"></div>');
var window = document.defaultView;

var anychart = require('anychart')(window);
var anychart_export = require('./anychart-export/lib/anychart-export.js');

var chart = anychart.column([1, 2, 3, 4, 5]);
chart.a11y(false);
chart.title('canvg is a SVG parser and renderer. It takes a URL to a SVG file or the text of an SVG file, parses it in JavaScript, and renders the result on a Canvas element. The rendering speed of the examples is about as fast as native SVG.');
chart.bounds(0, 0, 800, 600);
// chart.container('container').draw();

anychart_export.exportToSync(chart, null, function(image) {
  fs.writeFile('./image.png', image);
});

