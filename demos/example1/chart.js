// create data set on our data
  var dataSet = anychart.data.set([
    ['Lip gloss', 22998, 12043],
    ['Eyeliner', 12321, 15067],
    ['Eyeshadows', 12998, 12043],
    ['Powder', 10261, 14419],
    ['Mascara', 11261, 10419],
    ['Foundation', 10342, 10119],
    ['Rouge', 11624, 7004]
  ]);

// map data for the first series, take x from the zero column and value from the first column of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

// map data for the second series, take x from the zero column and value from the second column of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [2]});

// create column chart
  chart = anychart.column3d();

// set container id for the chart
  chart.container('container');

// turn on chart animation
  chart.animation(true);

// set chart title text settings
  chart.title('Top 7 Products by Revenue in two Regions');
  chart.title().padding([0, 0, 10, 0]);

// temp variable to store series instance
  var series;

// create first series with mapped data
  series = chart.column(seriesData_1);
  series.name('Florida');
  series.hatchFill('dashedForwardDiagonal');

// create second series with mapped data
  series = chart.column(seriesData_2);
  series.name('Texas');
  series.hatchFill('divot');

  chart.yAxis().labels().textFormatter(function() {
    return this.value.toLocaleString();
  });

// set titles for Y-axis
  chart.yAxis().title('Revenue in Dollars');
// turn on legend
  chart.legend().enabled(true).fontSize(13).padding([0, 0, 20, 0]);

  chart.interactivity().hoverMode('single');

  chart.tooltip().valuePrefix('$');

  chart.grid();
  chart.grid(1).layout('vertical');

// initiate chart drawing
  chart.draw();