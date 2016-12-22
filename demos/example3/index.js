var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var program = require('commander');

var document = jsdom('<body><div id="container"></div></body>');
var window = document.defaultView;

var anychart = require('./../../anychart/anychart.js')(window);
var anychart_export = require('./../../anychart-export/lib/anychart-export.js')(anychart);

program
    .version('0.0.1')
    .option('-i, --input [value]', 'path to input data file with chart, stage or svg', 'chart.js')
    .option('-o, --output [value]', 'path to output directory for reports.', 'reports')
    .option('-n, --name [value]', 'name of report.', 'report.html');

program.parse(process.argv);


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

    var isExistOutputReportDir = fs.existsSync(program.output);
    if (!isExistOutputReportDir) {
      fs.mkdirSync(program.output);
    }

    if (chart) {
      anychart_export.exportTo(chart, 'png').then(function(data) {
        var templateFile = fs.readFileSync('./template.html', 'utf8');

        jsdom.env(
            templateFile,
            function (err, window) {
              var doc = window.document;
              var containerElement = doc.getElementById('container');
              var imageElement = doc.createElement('image');
              imageElement.setAttribute('src', 'data:image/png;base64,' + data.toString('base64'));
              containerElement.appendChild(imageElement);

              fs.writeFile(program.output + '/' + program.name, doc.documentElement.outerHTML, function(err) {
                if (err) {
                  console.log(err.message);
                } else {
                  console.log('Written to file');
                }
                process.exit(0);
              });
            }
        );

      }, function(err) {
        console.log(err.message);
      });
    }
  }
});





