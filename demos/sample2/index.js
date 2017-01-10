var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var program = require('commander');


var document = jsdom('<body><div id="chart-container"></div></body>');
var window = document.defaultView;

var anychart = require('anychart')(window);
var anychart_export = require('../../lib/anychart-export.js')(anychart);

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
        var templateFile = fs.readFileSync('template.html', 'utf8');
        var base64Data = data.toString('base64');

        templateFile = templateFile.replace('{{chart}}', '<img class="img-responsive" src="data:image/png;base64,' + base64Data + '">');

        fs.writeFile(program.output + '/' + program.name, templateFile, function(err) {
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





