var fs = require('fs');
var jsdom = require('jsdom').jsdom;

var d = jsdom('<body><div id="container"></div></body>');
var window = d.defaultView;

// var $ = require("jquery")(w);
var anychart = require('./anychart/anychart.js')(window);
var anychart_export = require('./anychart-export/lib/anychart-export.js')(anychart);
anychart_export.concurrency(100);

// $('<div></div>').attr('id', 'container').appendTo('body');
// $('body').append('<div id="container"></div>');

// var chart = anychart.column([1, 2, 3, 4, 5]);
// chart.title('canvg is a SVG parser and renderer. It takes a URL to a SVG file or the text of an SVG file, parses it in JavaScript, and renders the result on a Canvas element. The rendering speed of the examples is about as fast as native SVG.');
// chart.bounds(0, 0, 500, 600);
// chart.container('container').draw();

var options = {
  type: 'png'
};


// anychart_export.loadFont('/Library/Fonts/Webdings.ttf', function(err, font) {
//   console.log(err, font);
// });

anychart_export.loadFont('/Library/Fonts/Verdana Bold Italic.ttf').then(function(font) {
  // console.log(font.names.fullName.en);
  // console.log(font.names);

  var chart = anychart.column([1, 2, 3, 4, 5]);
  // chart.id = i;
  chart.title()
      .enabled(true)
      .text('Bla-bla')
      .fontStyle('italic')
      .fontWeight('bold')
      .fontFamily(font.names.fontFamily.en)
      .fontSize(42);
  chart.bounds(0, 0, 500, 600);
  chart.container('container').draw();

  // console.log(i);

  anychart_export.exportTo(chart, options).then(function(image) {
    // var endDate = new Date().getTime() / 1000;
    // console.log(endDate - startDate);

    fs.writeFile('./images/bla' + '.' + options.type, image, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Written to file');
      }
    });
  }, function(err) {
    console.log(err);
  });


  chart.dispose();

}, function(err) {
  console.log(err);
});

// anychart_export.exportTo(chart, options.type, function(err, image) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(image);
//     fs.writeFile('./image.' + options.type, image, function(err) {
//       if (err) {
//         console.log(err);
//       } else {
//         console.log('Written to file');
//       }
//       process.exit(0);
//     });
//   }
// });

// var image = anychart_export.exportToSync(chart, options);
// fs.writeFile('./image.' + options.type, image, function(err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log('Written to file');
//   }
//   // spawnSync('convert',
//   //     ['-', '-resize "200%"', 'bigchart.jpg'],
//   //     {
//   //       input: image
//   //     });
//   // process.exit(0);
// });

// var chart = anychart.column([1, 2, 3, 4, 5]);
// chart.id = 0;
// chart.title('' + 0);
// chart.bounds(0, 0, 500, 600);
// chart.container('container').draw();

// var chart = '<svg xmlns="http://www.w3.org/2000/svg" border="0" data-ac-wrapper-id="468" width="100%" height="100%" role="presentation" class="anychart-ui-support" style="display: block;"><defs><clipPath clip-rule="nonzero" id="#ac_clip_1"><path data-ac-wrapper-id="632" d="M 33 78 L 780 78 780 555 33 555 33 78 Z" fill="none" stroke="black"></path></clipPath><clipPath clip-rule="nonzero" id="#ac_clip_3"><path data-ac-wrapper-id="637" d="M 32 78 L 780 78 780 556 32 556 32 78 Z" fill="none" stroke="black"></path></clipPath></defs><g data-ac-wrapper-id="471"><g data-ac-wrapper-id="476" aria-hidden="true"><g data-ac-wrapper-id="479"><path data-ac-wrapper-id="480" d="M 0 0 L 800 0 800 0 800 600 800 600 0 600 0 600 0 0 0 0 Z" fill="#ffffff" stroke="none"></path></g><g data-ac-wrapper-id="613" clip-path="url(##ac_clip_1)" clipPathUnits="userSpaceOnUse"><path data-ac-wrapper-id="621" d="M 65.5 476.5 L 148.5 476.5 148.5 555.5 65.5 555.5 Z" fill="#64b5f6" fill-opacity="0.85" stroke="#64b5f6" stroke-width="1.5"></path><path data-ac-wrapper-id="623" d="M 214.5 396.5 L 297.5 396.5 297.5 555.5 214.5 555.5 Z" fill="#64b5f6" fill-opacity="0.85" stroke="#64b5f6" stroke-width="1.5"></path><path data-ac-wrapper-id="625" d="M 364.5 317.5 L 447.5 317.5 447.5 555.5 364.5 555.5 Z" fill="#64b5f6" fill-opacity="0.85" stroke="#64b5f6" stroke-width="1.5"></path><path data-ac-wrapper-id="627" d="M 514.5 237.5 L 597.5 237.5 597.5 555.5 514.5 555.5 Z" fill="#64b5f6" fill-opacity="0.85" stroke="#64b5f6" stroke-width="1.5"></path><path data-ac-wrapper-id="629" d="M 663.5 157.5 L 746.5 157.5 746.5 555.5 663.5 555.5 Z" fill="#64b5f6" fill-opacity="0.85" stroke="#64b5f6" stroke-width="1.5"></path></g><path data-ac-wrapper-id="535" d="M 32.5 555.5 L 779.5 555.5" fill="none" stroke="#CECECE"></path><path data-ac-wrapper-id="374" d="M 32.5 556 L 32.5 562 M 182.5 556 L 182.5 562 M 331.5 556 L 331.5 562 M 481.5 556 L 481.5 562 M 630.5 556 L 630.5 562 M 779.5 556 L 779.5 562" fill="none" stroke="#CECECE"></path><g data-ac-wrapper-id="546"><g data-ac-wrapper-id="547"><text data-ac-wrapper-id="550" font-style="normal" font-variant="normal" font-family="Verdana, Helvetica, Arial, sans-serif" font-size="12" font-weight="normal" fill="#7c868e" letter-spacing="normal" text-decoration="none" direction="ltr" text-anchor="start" x="102.6875" y="578" aria-hidden="true" style="user-select: none; opacity: 1;"><tspan dy="0">0</tspan></text></g><g data-ac-wrapper-id="553"><text data-ac-wrapper-id="556" font-style="normal" font-variant="normal" font-family="Verdana, Helvetica, Arial, sans-serif" font-size="12" font-weight="normal" fill="#7c868e" letter-spacing="normal" text-decoration="none" direction="ltr" text-anchor="start" x="251.6875" y="578" aria-hidden="true" style="user-select: none; opacity: 1;"><tspan dy="0">1</tspan></text></g><g data-ac-wrapper-id="559"><text data-ac-wrapper-id="562" font-style="normal" font-variant="normal" font-family="Verdana, Helvetica, Arial, sans-serif" font-size="12" font-weight="normal" fill="#7c868e" letter-spacing="normal" text-decoration="none" direction="ltr" text-anchor="start" x="401.6875" y="578" aria-hidden="true" style="user-select: none; opacity: 1;"><tspan dy="0">2</tspan></text></g><g data-ac-wrapper-id="565"><text data-ac-wrapper-id="568" font-style="normal" font-variant="normal" font-family="Verdana, Helvetica, Arial, sans-serif" font-size="12" font-weight="normal" fill="#7c868e" letter-spacing="normal" text-decoration="none" direction="ltr" text-anchor="start" x="551.6875" y="578" aria-hidden="true" style="user-select: none; opacity: 1;"><tspan dy="0">3</tspan></text></g><g data-ac-wrapper-id="571"><text data-ac-wrapper-id="574" font-style="normal" font-variant="normal" font-family="Verdana, Helvetica, Arial, sans-serif" font-size="12" font-weight="normal" fill="#7c868e" letter-spacing="normal" text-decoration="none" direction="ltr" text-anchor="start" x="700.6875" y="578" aria-hidden="true" style="user-select: none; opacity: 1;"><tspan dy="0">4</tspan></text></g></g><path data-ac-wrapper-id="577" d="M 32.5 78.5 L 32.5 555.5" fill="none" stroke="#CECECE"></path><path data-ac-wrapper-id="398" d="M 32 555.5 L 26 555.5 M 32 396.5 L 26 396.5 M 32 236.5 L 26 236.5 M 32 78.5 L 26 78.5" fill="none" stroke="#CECECE"></path><g data-ac-wrapper-id="586"><g data-ac-wrapper-id="587"><text data-ac-wrapper-id="590" font-style="normal" font-variant="normal" font-family="Verdana, Helvetica, Arial, sans-serif" font-size="12" font-weight="normal" fill="#7c868e" letter-spacing="normal" text-decoration="none" direction="ltr" text-anchor="start" x="14.375" y="560" aria-hidden="true" style="user-select: none; opacity: 1;"><tspan dy="0">0</tspan></text></g><g data-ac-wrapper-id="593"><text data-ac-wrapper-id="596" font-style="normal" font-variant="normal" font-family="Verdana, Helvetica, Arial, sans-serif" font-size="12" font-weight="normal" fill="#7c868e" letter-spacing="normal" text-decoration="none" direction="ltr" text-anchor="start" x="14.375" y="401" aria-hidden="true" style="user-select: none; opacity: 1;"><tspan dy="0">2</tspan></text></g><g data-ac-wrapper-id="599"><text data-ac-wrapper-id="602" font-style="normal" font-variant="normal" font-family="Verdana, Helvetica, Arial, sans-serif" font-size="12" font-weight="normal" fill="#7c868e" letter-spacing="normal" text-decoration="none" direction="ltr" text-anchor="start" x="14.375" y="241" aria-hidden="true" style="user-select: none; opacity: 1;"><tspan dy="0">4</tspan></text></g><g data-ac-wrapper-id="605"><text data-ac-wrapper-id="608" font-style="normal" font-variant="normal" font-family="Verdana, Helvetica, Arial, sans-serif" font-size="12" font-weight="normal" fill="#7c868e" letter-spacing="normal" text-decoration="none" direction="ltr" text-anchor="start" x="14.375" y="82" aria-hidden="true" style="user-select: none; opacity: 1;"><tspan dy="0">6</tspan></text></g></g><g data-ac-wrapper-id="482" transform="matrix(1,0,0,1,10,10)"><text data-ac-wrapper-id="483" font-style="normal" font-variant="normal" font-family="Verdana, Helvetica, Arial, sans-serif" font-size="16" font-weight="normal" fill="#7c868e" letter-spacing="normal" text-decoration="none" direction="ltr" text-anchor="middle" x="385" y="16" aria-hidden="true" style="user-select: none; opacity: 1;"><tspan dy="0">canvg is a SVG parser and renderer. It takes a URL to a SVG file or the text of an SVG file, par</tspan><tspan x="385" dy="19.296875">ses it in JavaScript, and renders the result on a Canvas element. The rendering speed of the e</tspan><tspan x="385" dy="19.296875">xamples is about as fast as native SVG.</tspan></text></g><g data-ac-wrapper-id="633" clip-path="url(##ac_clip_3)" clipPathUnits="userSpaceOnUse"></g></g></g></svg>';

// var startDate = new Date().getTime() / 1000;
// var charts = [];
// for (var i = 0, len = 1; i < len; i++) {
//   var chart = anychart.column([1, 2, 3, 4, 5]);
//   chart.id = i;
//   chart.title().text('Bla-bla').enabled(true).fontFamily('Webdings');
//   chart.bounds(0, 0, 500, 600);
//   chart.container('container').draw();
//
//   console.log(i);

  // var image = anychart_export.exportToSync(chart, options);
  // fs.writeFileSync('./images/image' + chart.id + '.' + options.type, image);
  // var endDate = new Date().getTime() / 1000;
  // console.log(endDate - startDate);

  // anychart_export.exportTo(chart, options, function(err, image, chart) {
  //   if (err) console.log(err);
  //   var endDate = new Date().getTime() / 1000;
  //   console.log(endDate - startDate);
  //
  //   fs.writeFile('./images/image' + chart.id + '.' + options.type, image, function(err) {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       console.log('Written to file');
  //     }
  //   });
  // });


  // anychart_export.exportTo(chart, options).then(function(image) {
  //   var endDate = new Date().getTime() / 1000;
  //   console.log(endDate - startDate);
  //
  //   fs.writeFile('./images/bla' + '.' + options.type, image, function(err) {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       console.log('Written to file');
  //     }
  //   });
  // }, function(err) {
  //   console.log(err);
  // });
  //
  //
  // chart.dispose();
// }






