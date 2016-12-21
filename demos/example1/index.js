var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var program = require('commander');

var d = jsdom('<body><div id="container"></div></body>');
var window = d.defaultView;

var anychart = require('./../../anychart/anychart.js')(window);
var anychart_export = require('./../../anychart-export/lib/anychart-export.js')(anychart);

program
    .version('0.0.1')
    .option('-i, --input [value]', 'path to input data file with chart, stage or svg')
    .option('-o, --output [value]', 'path to output image or svg file.', 'image')
    .option('-t, --type [value]', 'type of output data.', 'png');

program.parse(process.argv);

if (!program.input) {
  console.log('Input data not found.');
} else {
  fs.readFile(program.input, 'utf8', function(err, data) {
    if (err) {
      console.log(err.message);
    } else {
      var chart;
      try {
        chart = eval(data);
      } catch (e) {
        console.log(e.message);
        chart = null;
      }

      if (chart) {
        anychart_export.exportTo(chart, program.type).then(function(image) {
          fs.writeFile(program.output, image, function(err) {
            if (err) {
              console.log(err.message);
            } else {
              console.log('Written to file');
            }
            process.exit(0);
          });
        }, function(err) {
          console.log(err.message);
        });
      }
    }
  });
}





