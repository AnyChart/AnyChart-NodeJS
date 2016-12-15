var fs = require('fs');
var jsdom = require('jsdom').jsdom;

var d = jsdom('<body><div id="container"></div></body>');
var w = d.defaultView;

// var $ = require("jquery")(w);
var anychart = require('anychart')(w);
var anychart_export = require('./anychart-export/lib/anychart-export.js')(anychart);
anychart_export.concurrency(10);

// $('<div></div>').attr('id', 'container').appendTo('body');
// $('body').append('<div id="container"></div>');

// var chart = anychart.column([1, 2, 3, 4, 5]);
// chart.title('canvg is a SVG parser and renderer. It takes a URL to a SVG file or the text of an SVG file, parses it in JavaScript, and renders the result on a Canvas element. The rendering speed of the examples is about as fast as native SVG.');
// chart.bounds(0, 0, 500, 600);
// chart.container('container').draw();

var options = {
  type: 'png',
  width: 1000,
  height: 500
};

// anychart_export.exportTo(chart, options.type, function(err, image) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(image);
//     fs.writeFile('./image.' + options.type, image, function(err) {
//       if (err) {
//         console.log(err);
//       } else {
//         console.log('Written to file');
//       }
//       process.exit(0);
//     });
//   }
// });

// var image = anychart_export.exportToSync(chart, options);
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

// var chart = anychart.column([1, 2, 3, 4, 5]);
// chart.id = 0;
// chart.title('' + 0);
// chart.bounds(0, 0, 500, 600);
// chart.container('container').draw();

var startDate = new Date().getTime() / 1000;
for (var i = 0, len = 100; i < len; i++) {
  var chart = anychart.column([1, 2, 3, 4, 5]);
  chart.id = i;
  chart.title('' + i);
  chart.bounds(0, 0, 500, 600);
  chart.container('container').draw();

  console.log(i);

  // var image = anychart_export.exportToSync(chart, options);
  // fs.writeFileSync('./images/image' + chart.id + '.' + options.type, image);
  // var endDate = new Date().getTime() / 1000;
  // console.log(endDate - startDate);

  anychart_export.exportTo(chart, options, function(err, image, chart) {
    if (err) console.log(err);
    var endDate = new Date().getTime() / 1000;
    console.log(endDate - startDate);

    fs.writeFile('./images/image' + chart.id + '.' + options.type, image, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Written to file');
      }
    });
  });
  chart.dispose();
}






