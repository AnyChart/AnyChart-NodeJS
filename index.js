var fs = require('fs');
var jsdom = require('jsdom');
var opentype = require('opentype.js');
// window = jsdom.jsdom().defaultView;
// document = window.document;
var spawn = require('child_process').spawn;
var loadedFonts = {};
var font;
var anychart = require("../ACDVF/out/anychart-bundle.min.js").anychart;

// var any = fs.readFileSync("../ACDVF/out/anychart-bundle.min", "utf-8");
// var anychart = require('../ACDVF/out/anychart-bundle.min');
function anychartify(window) {
  window.document.createElementNS = function(ns, tagName) {
    var elem = window.document.createElement(tagName);
    elem.getBBox = function() {
      var text = window.$(elem).text();
      var fontSize = parseFloat(elem.getAttribute('font-size'));
      var fontFamily = elem.getAttribute('font-family');
      var fonts = fontFamily.split(', ');
      // var font;
      // for (var i = 0, len = fonts.length; i < len; i++) {
      //   if (font = loadedFonts[fonts[i]])
      //     break;
      // }
      // if (!font)
      //   font = loadedFonts['verdana'];


      var scale = 1 / font.unitsPerEm * fontSize;

      var top = -font.ascender * scale;
      var height = Math.abs(top) + Math.abs(font.descender * scale);

      var width = 0;

      font.forEachGlyph(text, 0, 0, fontSize, undefined, function(glyph, x, y, fontSize, options) {
        var metrics = glyph.getMetrics();
        metrics.xMin *= scale;
        metrics.xMax *= scale;
        metrics.leftSideBearing *= scale;
        metrics.rightSideBearing *= scale;

        width += Math.abs(metrics.xMax - metrics.xMin) + metrics.leftSideBearing + metrics.rightSideBearing
      });

      console.log({x: 0, y: top,  width: width, height: height});

      return {x: 0, y: top,  width: width, height: height};
    };
    return elem;
  };
}


function drawAnyChart(window) {
  var chart = anychart.column([1, 2, 3, 4, 5]);
  chart.a11y(false);
  chart.title('canvg is a SVG parser and renderer. It takes a URL to a SVG file or the text of an SVG file, parses it in JavaScript, and renders the result on a Canvas element. The rendering speed of the examples is about as fast as native SVG.');
  chart.bounds(0, 0, 800, 600);
  chart.container('container').draw();
}


function drawHighchart(window) {
  var Highcharts = require('highcharts');

// Load module after Highcharts is loaded
  require('highcharts/modules/exporting')(Highcharts);

// Create the chart
  Highcharts.chart('container', {
    chart: {
      width: 1000,
      height: 300
    },
    title: {
      text: 'Monthly Average Temperature',
      x: -20 //center
    },
    subtitle: {
      text: 'Source: WorldClimate.com',
      x: -20
    },
    xAxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    yAxis: {
      title: {
        text: 'Temperature (°C)'
      },
      plotLines: [{
        value: 0,
        width: 1,
        color: '#808080'
      }]
    },
    tooltip: {
      valueSuffix: '°C'
    },
    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
      borderWidth: 0
    },
    series: [{
      name: 'Tokyo',
      data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
    }, {
      name: 'New York',
      data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
    }, {
      name: 'Berlin',
      data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
    }, {
      name: 'London',
      data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
    }]

  });
}


opentype.load('/Library/Fonts/Verdana.ttf', function(err, font_) {
  if (err) {
    alert('Could not load font: ' + err);
  } else {
    font = font_;
    jsdom.env(
        '<div id="container"></div>',
        [
          // "https://cdn.anychart.com/js/7.12.0/anychart-bundle.min.js",
          "http://cdn.anychart.com/geodata/1.2.0/countries/united_states_of_america/united_states_of_america.js"
        ],
        function(errors, window) {
          var $ = require("jquery")(window);
          var svg, convert, buffer;

          try {
            document = window.document;

            anychartify(window);

            // var anychart = window.anychart;

            // drawAnyChart(window);

            var Highcharts = require('highcharts');

// Load module after Highcharts is loaded
            require('highcharts/modules/exporting')(Highcharts);

// Create the chart
            Highcharts.chart('container', {
              chart: {
                width: 1000,
                height: 300
              },
              title: {
                text: 'Monthly Average Temperature',
                x: -20 //center
              },
              subtitle: {
                text: 'Source: WorldClimate.com',
                x: -20
              },
              xAxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
              },
              yAxis: {
                title: {
                  text: 'Temperature (°C)'
                },
                plotLines: [{
                  value: 0,
                  width: 1,
                  color: '#808080'
                }]
              },
              tooltip: {
                valueSuffix: '°C'
              },
              legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
              },
              series: [{
                name: 'Tokyo',
                data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
              }, {
                name: 'New York',
                data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
              }, {
                name: 'Berlin',
                data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
              }, {
                name: 'London',
                data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
              }]

            });




            var $container = $('#container svg')[0];
            svg = $container.outerHTML;


            fs.writeFile('gg.svg', svg, function() {
              console.log('Written to gg.svg');
            });

            // Start convert
            convert = spawn('convert', ['svg:-', 'png:-']);

            // Pump in the svg content
            convert.stdin.write(svg);
            convert.stdin.end();

            // Write the output of convert straight to the response
            convert.stdout.on('data', function(data) {
              try {
                var prevBufferLength = (buffer ? buffer.length : 0),
                    newBuffer = new Buffer(prevBufferLength + data.length);

                if (buffer) {
                  buffer.copy(newBuffer, 0, 0);
                }

                data.copy(newBuffer, prevBufferLength, 0);

                buffer = newBuffer;
              } catch (e) {
                console.log(e);
              }
            });

            convert.on('exit', function(code) {
              fs.writeFile('chart.png', buffer, function() {
                console.log('Written to chart.png');
                process.exit(0);
              });
            });
          } catch(e) {
            console.log(e);
            process.exit(0);
          }
        }
    );
  }
});


