[<img src="https://cdn.anychart.com/images/logo-transparent-segoe.png?2" width="234px" alt="AnyChart - Robust JavaScript/HTML5 Chart library for any project">](https://anychart.com)

# AnyChart NodeJS module.

AnyChart NodeJS module provides an easy way to generate SVG, JPG and PNG images of the charts.
It perfectyly suits to email reporting systems and social networks sharing applications.

## Table of Contents

* [Download and install](#download-and-install)
* [General Notes](#general-notes)
* [Usage Notes](#usage-notes)
* [Quick start](#quick-start)
* [AnyChart Export Module API](#anychart-export-module-api)
* [Demos Overview](#demos-overview)
* [Contacts](#contacts)
* [Links](#links)
* [License](#license)

## Download and install
You can install AnyChart NodyJS export module using **npm**, **bower** or **yarn**:

* `npm install anychart-export`
* `bower install anychart-export`
* `yarn add anychart-export`

AnyChart NodeJS module require [ImageMagic](https://www.imagemagick.org) to build JPG and PNG images.
Please, visit Image Magic [install](https://www.imagemagick.org/script/index.php) page for detaild

## Quick start 
To generate JPG image of the simple Pie Chart, create index.js file with following content:
```javascript
// require file system and jsdom
var fs = require('fs');
var jsdom = require('jsdom').jsdom;

// create default jsdom view
var d = jsdom('<body><div id="container"></div></body>');
var w = d.defaultView;

// require anychart and anychart export modules
var anychart = require('anychart')(w);
var anychartExport = require('anychart-export')(anychart);

// create and draw Pie Chart to the jsdom defaultView 
var chart = anychart.pie([10, 20, 7, 18, 30]);
chart.container('container');
chart.draw();

// generate JPG image and save to a file
anychartExport.exportTo(chart, 'jpg').then(function(image) {
  fs.writeFile('anychart.jpg', image, function(fsWriteError) {
    if (fsWriteError) {
      console.log(fsWriteError.message);
    } else {
      console.log('Complete');
    }
    process.exit(0);
  });
}, function(generationError) {
  console.log(generationError.message);
});
```

Run the following command in command line
```
$ node index.js
>> Complete
```


## AnyChart Export Module API
#### `exportTo(target, options, callback):Promise`
Generate an image asynchronously.
Parameters:
Name | Type | Description
 --- | --- | ---
`target` | SVG string, Chart or Stage instance | Input data.
`outputType` | string | Output type, possible values are: svg, jpg, png.
`callback` | Function | The result callback.
Returns:
Promise if no callback passed.

#### `exportToSync(target, options):Object`
Synchronous image generation. Returns converted image.

Input parameters:

Parameter Name | Type | Description
--- | --- | ---
`target` | SVG, Chart, Stage | Instance of what to export.
`options` | Object, string | Options object of string that represents export image type.


#### `loadFont(path, callback):Promise`
Asynchronously loads the specified font. Gets result with font object, returns Promise.

Input parameters:

Parameter Name | Type | Description
--- | --- | ---
`path` | string | Path to font.
`callback` | Function | Async Callback function that contains result.


#### `loadFontSync(path):Object`
Synchronously loads the specified font. Returns the font object.

Input parameters:

Parameter Name | Type | Description
--- | --- | ---
`path` | string | Path to font.


#### `loadDefaultFonts(callback):Promise`
Asynchronously loads default fonts. Gets result as array of resulting
font objects that are available in callback, returns Promise.

Input parameters:

Parameter Name | Type | Description
--- | --- | ---
`callback` | Function | Async Callback function that contains result.


#### `loadDefaultFontsSync():Array.<Object>`
Synchronously loads default fonts. Gets result as array of resulting
font objects, returns Promise.
No input parameters are provided.
 
 
## Demos overview 
* [NodeJS utility for reports generation](https://github.com/anychart-integrations/nodejs-reports-generation-console-utilily-sample)
* [NodeJS export server](https://github.com/anychart-integrations/nodejs-export-server-sample)
* [NodeJS exporting utility](https://github.com/anychart-integrations/nodejs-exporting-console-utility-sample)


## Contacts

* Web: [www.anychart.com](www.anychart.com)
* Email: [contact@anychart.com](mailto:contact@anychart.com)
* Twitter: [anychart](https://twitter.com/anychart)
* Facebook: [AnyCharts](https://www.facebook.com/AnyCharts)
* LinkedIn: [anychart](https://www.linkedin.com/company/anychart)

## Links

* [AnyChart Website](http://www.anychart.com)
* [Download AnyChart](http://www.anychart.com/download/)
* [AnyChart Licensing](http://www.anychart.com/buy/)
* [AnyChart Support](http://www.anychart.com/support/)
* [Report Issues](http://github.com/AnyChart/anychart/issues)
* [AnyChart Playground](http://playground.anychart.com)
* [AnyChart Documentation](http://docs.anychart.com)
* [AnyChart API Reference](http://api.anychart.com)
* [AnyChart Sample Solutions](http://www.anychart.com/solutions/)
* [AnyChart Integrations](http://www.anychart.com/integrations/)

## License

[© AnyChart.com - JavaScript charts](http://www.anychart.com). All rights reserved.












