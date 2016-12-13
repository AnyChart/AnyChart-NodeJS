var fs = require('fs');
var jsdom = require('jsdom').jsdom;
// var spawnSync = require('child_process').spawnSync;

var document = jsdom('<body><div id="container"></div></body>');
var window = document.defaultView;

var $ = require("jquery")(window);

var anychart = require('anychart')(window);
var anychart_export = require('./anychart-export/lib/anychart-export.js');


// $('<div></div>').attr('id', 'container').appendTo('body');

// $('body').append('<div id="container"></div>');
  var chart = anychart.column([1, 2, 3, 4, 5]);
  chart.title('canvg is a SVG parser and renderer. It takes a URL to a SVG file or the text of an SVG file, parses it in JavaScript, and renders the result on a Canvas element. The rendering speed of the examples is about as fast as native SVG.');
  chart.bounds(0, 0, 500, 600);
  chart.container('container').draw();

// anychart_export.exportTo(chart, null, function(image) {
//   fs.writeFile('./image.png', image, function() {
//     console.log('Written to png');
//     process.exit(0);
//   });
// });

  var options = {
    type: 'png',
    width: 1000,
    height: 500
  };

  // var svg = anychart_export.exportToSync(chart, 'svg');
  anychart_export.exportTo(chart, options.type, function(svg) {
    fs.writeFile('./image.' + options.type, svg, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Written to file');
      }
      process.exit(0);
    });
  });

// var image = anychart_export.exportToSync(chart, options);
//
// fs.writeFile('./image.' + options.type, image, function(err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log('Written to file');
//   }
//   // spawnSync('convert',
//   //     ['-', '-resize "200%"', 'bigchart.jpg'],
//   //     {
//   //       input: image
//   //     });
//   // process.exit(0);
// });

// var startDate = new Date().getTime() / 1000;
// for (var i = 0, len = 1; i < len; i++) {
//   var $container = $('#container' + i);
//   $('body').append($container);
//
//   var chart = anychart.column([1, 2, 3, 4, 5]);
//   chart.title('canvg is a SVG parser and renderer. It takes a URL to a SVG file or the text of an SVG file, parses it in JavaScript, and renders the result on a Canvas element. The rendering speed of the examples is about as fast as native SVG.');
//   chart.bounds(0, 0, 500, 600);
//   chart.container('container' + i).draw();
//
//   console.log(chart.container());
//
//   chart.listen(anychart.enums.EventType.CHART_DRAW, function(e) {
//
//     anychart_export.exportTo(this, options, function(image) {
//       var endDate = new Date().getTime() / 1000;
//       console.log(endDate - startDate);
//     });
//
//   });
// }






