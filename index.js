var fs = require('fs');
var jsdom = require('jsdom');
// window = jsdom.jsdom().defaultView;
// document = window.document;
var spawn = require('child_process').spawn;

// var any = fs.readFileSync("../ACDVF/out/anychart-bundle.min", "utf-8");
// var anychart = require('../ACDVF/out/anychart-bundle.min');

jsdom.env(
    '<html><head></head><body><div id="container" style="width: 800px; height: 600px;"></div></body></html>',
    // ["https://cdn.anychart.com/js/7.12.0/anychart-bundle.min.js"],
    ["../ACDVF/out/anychart-bundle.min.js"],
    function(errors, window) {
      var $ = require("jquery")(window);
      var chart, svg, convert, buffer;


      // this.measurement_ex = goog.dom.createDom(goog.dom.TagName.DIV);
      // this.virtualBaseLine_ = goog.dom.createDom(goog.dom.TagName.SPAN);
      // this.measurementText_ex = goog.dom.createDom(goog.dom.TagName.SPAN);
      //
      // goog.style.setStyle(this.measurement_ex, {'position': 'absolute', 'visibility': 'hidden', 'left': 0, 'top': 0});
      // goog.style.setStyle(this.measurementText_ex, {'font-size': '0px', 'border': '0 solid'});
      // this.measurementText_ex.innerHTML = 'a';
      // goog.style.setStyle(this.virtualBaseLine_, {'font-size': '0px', 'border': '0 solid'});
      // this.virtualBaseLine_.innerHTML = 'a';
      //
      // goog.dom.appendChild(document.body, this.measurement_ex);
      // goog.dom.appendChild(this.measurement_ex, this.virtualBaseLine_);
      // goog.dom.appendChild(this.measurement_ex, this.measurementText_ex);


      var measure_el = $('<div/>');
      var baseLine_el = $('<span/>');
      var measure_text_el = $('<span/>');

      measure_el.css({'position': 'absolute', 'left': 0, 'top': 0});
      measure_text_el.css({'border': '0 solid'});
      baseLine_el.css({'border': '0 solid'});

      measure_text_el.html('a');
      baseLine_el.html('a');

      $('body').append(measure_el);
      measure_el.append(baseLine_el);
      measure_el.append(measure_text_el);





      measure_el.css({'left': 0, 'top': 0, 'width': 'auto', 'height': 'auto'});
      // measure_text_el.css({
      //   'border': '0 solid',
      //   'position': 'absolute',
      //   'left': 0,
      //   'top': 0
      // });

      measure_text_el.html('sdfsdfs');

      // var boundsMicroText = goog.style.getBounds(this.virtualBaseLine_);
      // goog.style.setPosition(this.measurement_ex, 0, -(boundsMicroText.top + boundsMicroText.height));

      // var boundsTargetText = goog.style.getBounds(this.measurementText_ex);
      // this.measurementText_ex.innerHTML = '';

      // return boundsTargetText;
      //

      // var b = baseLine_el.getBoundingClientRect();
      console.log(measure_text_el[0].getClientRects());








      document = window.document;
      var anychart = window.anychart;

      anychart.onDocumentReady(function() {

        chart = anychart.column([1, 2, 3, 4, 5]);
        chart.bounds(0, 0, 800, 600);
        chart.container('container').draw();

        var $container = $('#container svg')[0];
        svg = $container.outerHTML;


        var renderer = anychart.graphics.getRenderer();
        console.log(renderer.measuringHTMLText('dsf', {}));

        fs.writeFile('gg.svg', svg, function() {

        });



        // // Start convert
        // convert = spawn('convert', ['svg:-', 'png:-']);
        //
        // // Pump in the svg content
        // convert.stdin.write(svg);
        // convert.stdin.end();
        //
        // // Write the output of convert straight to the response
        // convert.stdout.on('data', function(data) {
        //   try {
        //     var prevBufferLength = (buffer ? buffer.length : 0),
        //         newBuffer = new Buffer(prevBufferLength + data.length);
        //
        //     if (buffer) {
        //       buffer.copy(newBuffer, 0, 0);
        //     }
        //
        //     data.copy(newBuffer, prevBufferLength, 0);
        //
        //     buffer = newBuffer;
        //   } catch (e) {
        //     console.log(e);
        //   }
        // });
        //
        // convert.on('exit', function(code) {
        //   console.log(code, buffer);
        //   fs.writeFile('chart.png', buffer, function() {
        //     console.log('Written to chart.png');
        //     process.exit(0);
        //   });
        // });
      });
    }
);
