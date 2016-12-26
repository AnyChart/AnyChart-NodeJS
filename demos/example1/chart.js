
  // create data set on our data
  var dataSet = anychart.data.set([
    ['1996', 300, 162, 242],
    ['1997', 300, 90,  254],
    ['1998', 330, 50,  226],
    ['1999', 342, 77,  232],
    ['2000', 348, 35,  268],
    ['2001', 334, 45,  254],
    ['2002', 325, 88,  235],
    ['2003', 316, 120, 266],
    ['2004', 318, 156, 288],
    ['2005', 330, 123, 220],
    ['2006', 355, 88,  215],
    ['2007', 366, 66,  236],
    ['2008', 337, 45,  247],
    ['2009', 352, 29,  172],
    ['2010', 377, 45,  137],
    ['2011', 383, 88,  123],
    ['2012', 344, 102, 134],
    ['2013', 366, 46, 146],
    ['2014', 389, 69, 159],
    ['2015', 334, 84, 104]
  ]);

  // map data for the first series, take x from the zero area and value from the first area of data set
  var seriesData_1 = dataSet.mapAs({x: [0], value: [1]});

  // map data for the second series, take x from the zero area and value from the second area of data set
  var seriesData_2 = dataSet.mapAs({x: [0], value: [3]});

  // map data for the third series, take x from the zero area and value from the third area of data set
  var seriesData_3 = dataSet.mapAs({x: [0], value: [2]});

  // create area chart
  chart = anychart.area3d();

  // set container id for the chart
  chart.container('container');

  // turn on chart animation
  chart.animation(true);

  // turn off the crosshair
  chart.crosshair(false);

  // set chart title text settings
  chart.title('Company Profit Dynamic in Regions by Year');
  chart.title().padding([0,0,5,0]);

  // set interactivity and tooltips settings
  chart.interactivity().hoverMode('byX');
  chart.tooltip().displayMode('union');


  chart.yAxis().title('Profit in Dollars');
  chart.yAxis().labels().textFormatter(function(){
    if (this.value == 0) return this.value;
    return this.value + 'k.';
  });

  // create zero line
  var zeroLine = chart.lineMarker(0);
  zeroLine.stroke("#ddd");
  zeroLine.scale(chart.yScale());
  zeroLine.value(0);

  // helper function to setup label settings for all series
  var setupSeries = function(series, name) {
    series.name(name);
    series.markers(false);
    series.hoverMarkers(false);
  };

  // temp variable to store series instance
  var series;

  // create first series with mapped data
  series = chart.area(seriesData_1);
  setupSeries(series, 'Florida');

  // create second series with mapped data
  series = chart.area(seriesData_2);
  setupSeries(series, 'Texas');

  // create third series with mapped data
  series = chart.area(seriesData_3);
  setupSeries(series, 'Nevada');

  // turn on legend
  chart.legend().enabled(true).fontSize(13).padding([0,0,20,0]);

  chart.grid();
  chart.grid(1).layout('vertical');

  chart.zAspect('70%');
  chart.zPadding(0);
  chart.zAngle(45);

  // initiate chart drawing
  chart.draw();
