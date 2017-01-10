var fs = require('fs');
var jsdom = require('jsdom').jsdom;
var express = require('express');
var bodyParser = require('body-parser');

var d = jsdom('<body><div id="chart-container"></div></body>');
var window = d.defaultView;

var anychart = require('anychart')(window);
var anychart_export = require('../../lib/anychart-export.js')(anychart);
var indexTemplate = fs.readFileSync('template.html', 'utf-8');

var app = express();
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.get('/', function (req, res) {
  res.send(indexTemplate)
});

app.post('/export', function (req, res) {
  var chart;
  try {
    chart = eval(req.body.code);
  } catch (e) {
    console.log(e.message);
    chart = null;
  }
  if (chart) {
    anychart_export.exportTo(chart, 'png', function(err, data) {
      var base64Data = data.toString('base64');
      var result = {data: base64Data};
      res.send(JSON.stringify(result));
    });
  } else {
    res.send('');
  }
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});





