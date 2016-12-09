// Load Highcharts
var Highcharts = require('highcharts');

// Alternatively, this is how to load Highstock or Highmaps
// var Highcharts = require('highcharts/highstock');
// var Highcharts = require('highcharts/highmaps');

// This is how a module is loaded. Pass in Highcharts as a parameter.
require('highcharts/modules/exporting')(Highcharts);

// Generate the chart
var chart = Highcharts.chart('container', {
  series: [{
    data: [1, 3, 2, 4]
  }]
});

console.log(chart.toSVG());