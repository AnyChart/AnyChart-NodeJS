// generete data
var rawData = [];
for (x = -180; x < 180; x++) {
  rawData.push([x, -12.6 * (1 - Math.cos(x * 1.14 / 180)), -12.6 * (1 - Math.cos(x * 2.14 / 180)), -12.6 * (1 - Math.cos(x * 3.14 / 180))]);
};

// create a data set
var series = anychart.data.mapAsTable(rawData, "area");

// create polar chart
chart = anychart.polar();
chart.bounds(0, 0, 600, 500);

// add series
chart.defaultSeriesType("area");
chart.addSeries(series[0], series[1], series[2]);

// set series names
chart.getSeries(0).name("SMM58");
chart.getSeries(1).name("NTT1A");
chart.getSeries(2).name("sE4400a IV");

// set strokes
chart.getSeries(0).stroke("SMM58");
chart.getSeries(1).name("NTT1A");
chart.getSeries(2).name("sE4400a IV");

// set chart yScale settings
chart.yScale().ticks().interval(5);
chart.yScale().minimum(-25);
chart.yScale().maximum(0);
chart.startAngle(180);

// set chart xScale settings
chart.xScale().minimum(-180);
chart.xScale().maximum(180);
chart.xScale().ticks().interval(30);

// set xAxis formatting settings
chart.xAxis().labels().textFormatter(function() {
  return Math.abs(this['value']) + '°';
});

var grid = chart.grid(0);
// color odd and even rows
grid.evenFill("white 0.9");
grid.oddFill("lightgray 0.3");
// set layout type
grid.layout("circuit");

// disable chart title
chart.title("Microphones Sensitivity Polar Pattern");
chart.legend(true);
chart.legend().position("bottom");

// set container id for the chart
chart.container('chart-container');
// initiate chart drawing
chart.draw();
