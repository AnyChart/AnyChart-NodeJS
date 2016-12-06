var fs = require('fs');
var jsdom = require('jsdom');
// window = jsdom.jsdom().defaultView;
// document = window.document;
var spawn	= require('child_process').spawn;
//
//
// document.createElementNS = function(ns, tagName) {
//   var elem = window.document.createElement(tagName);
//   elem.getBBox = function() {
//     return {
//       x: elem.offsetLeft,
//       y: elem.offsetTop,
//       width: elem.offsetWidth,
//       height: elem.offsetHeight
//     };
//   };
//   return elem;
// };

// var anychart = require('../ACDVF/out/anychart-bundle.min');

jsdom.env(
    '<div id="container"></div>',
    ["https://cdn.anychart.com/js/7.12.0/anychart-bundle.min.js"],
    function (errors, window) {
      var $ = require("jquery")(window);
      var chart, svg, convert, buffer;
      document = window.document;

      document.createElementNS = function(ns, tagName) {
        var elem = window.document.createElement(tagName);
        elem.getBBox = function() {
          return {
            x: elem.offsetLeft,
            y: elem.offsetTop,
            width: elem.offsetWidth,
            height: elem.offsetHeight
          };
        };
        return elem;
      };

      var anychart = window.anychart;

      chart = anychart.column([1, 2, 3, 4, 5]);
      chart.container('container').draw();

      var $container = $('#container svg')[0];
      svg = $container.outerHTML;

      console.log(svg);

      // Start convert
      convert	= spawn('convert', ['svg:-', 'png:-']);

      // Pump in the svg content
      convert.stdin.write(svg);
      convert.stdin.end();

      // Write the output of convert straight to the response
      convert.stdout.on('data', function(data) {
        console.log('onData', data);
        try {
          var prevBufferLength = (buffer ? buffer.length : 0),
              newBuffer = new Buffer(prevBufferLength + data.length);

          if (buffer) {
            buffer.copy(newBuffer, 0, 0);
          }

          data.copy(newBuffer, prevBufferLength, 0);

          buffer = newBuffer;
        } catch(e) {
          console.log(e);
        }
      });

      convert.on('exit', function(code) {
        console.log(code, buffer);
        fs.writeFile('chart.png', buffer, function() {
          console.log('Written to chart.png');
        });
      });
    }
);



// Load scripts
// jsdom.jQueryify(window, 'http://code.jquery.com/jquery-1.4.2.min.js', function(w,jq) {
//   var filename = 'file:///' + __dirname + '/highcharts/highcharts.src.js';
//   script.src = filename;
//   script.onload = function() {
//     callback(window);
//   }
//   window.document.body.appendChild(script);
// });
//
// container.appendTo(document.body);


// var chart = anychart.column([1, 2, 3, 4, 5]);
// chart.container('container').draw();