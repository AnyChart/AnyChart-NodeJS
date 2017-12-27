[<img src="https://cdn.anychart.com/images/logo-transparent-segoe.png?2" width="234px" alt="AnyChart - Robust JavaScript/HTML5 Chart library for any project">](https://www.anychart.com)

[![NPM Version][npm-image]][npm-url] [![NPM Downloads][downloads-image]][downloads-url] [![Package Quality][quality-image]][quality-url]

# AnyChart NodeJS module.

AnyChart NodeJS module provides an easy way to generate SVG, JPG and PNG images of the charts on the server side.
Consider it for reporting systems that send charts by email or social networks sharing applications.

## Table of Contents

* [Download and install](#download-and-install)
* [Quick start](#quick-start)
* [Export Module API](#export-module-api)
* [Examples](#examples)
* [Contacts](#contacts)
* [Links](#links)
* [License](#license)

## Download and install
IMPORTANT: Requires Node.js 6 or newer.
You can install AnyChart NodeJS export module using **npm**, **bower** or **yarn**:

* `npm install anychart-nodejs`
* `bower install anychart-nodejs`
* `yarn add anychart-nodejs`

AnyChart NodeJS module requires [ImageMagick](https://www.imagemagick.org/script/index.php) and [librsvg](https://github.com/GNOME/librsvg) to create images. 

Install ImageMagick and librsvg on Linux:

```
apt-get install imagemagick librsvg2-dev
```

Install ImageMagick and librsvg on Mac OS X

```
brew install imagemagick librsvg
```

Install ImageMagick and librsvg on Windows:

- [imagemagick](https://www.imagemagick.org/script/download.php)<br>
- [GTK+ bundle](http://win32builder.gnome.org/gtk+-bundle_3.6.4-20131201_win64.zip)<br>
- [RSVG lib](https://downloads.sourceforge.net/project/tumagcc/converters/rsvg-convert.exe?r=https%3A%2F%2Fsourceforge.net%2Fprojects%2Ftumagcc%2Ffiles%2Frsvg-convert.exe%2Fdownload&ts=1500995628&use_mirror=netix)

## Quick start 
To generate JPG image a chart from chart instance, create index.js file with the following content:
```javascript
// require file system and jsdom
var fs = require('fs');
var jsdom = require('jsdom').jsdom;

// create default jsdom view (important - jsdom version ^9.9.1)
var document = jsdom('<body><div id="container"></div></body>');
var window = document.defaultView;

// require anychart and anychart export modules
var anychart = require('anychart')(window);
var anychartExport = require('anychart-nodejs')(anychart);

// create and a chart to the jsdom window.
// chart creating should be called only right after anychart-nodejs module requiring
var chart = anychart.pie([10, 20, 7, 18, 30]);
chart.bounds(0, 0, 800, 600);
chart.container('container');
chart.draw();

// generate JPG image and save it to a file
anychartExport.exportTo(chart, 'jpg').then(function(image) {
  fs.writeFile('anychart.jpg', image, function(fsWriteError) {
    if (fsWriteError) {
      console.log(fsWriteError);
    } else {
      console.log('Complete');
    }
  });
}, function(generationError) {
  console.log(generationError);
});
```

Run the following command in the command line:
```
$ node index.js
>> Complete
```

To generate PDF image a chart from Java Script string, create index.js file with the following content:
```javascript
// require file system and jsdom
var fs = require('fs');

// require only anychart export module
var anychartExport = require('anychart-nodejs');

// define javascript string that represent code of chart creating
var chart = "var chart = anychart.pie([10, 20, 7, 18, 30]); chart.bounds(0, 0, 800, 600); chart.container('container'); chart.draw()";

// generate PDF image and save it to a file
anychartExport.exportTo(chart, 'pdf').then(function(image) {
  fs.writeFile('anychart.pdf', image, function(fsWriteError) {
    if (fsWriteError) {
      console.log(fsWriteError);
    } else {
      console.log('Complete');
    }
  });
}, function(generationError) {
  console.log(generationError);
});
```

Run the following command in the command line:
```
$ node index.js
>> Complete
```


## Export Module API
### `exportTo(target, options, callback):Promise`
Generate an image asynchronously.  
**Parameters:**  

Name | Type | Description
--- | --- | ---
`target` | SVG string, XML string, Java Script string, a chart or a stage instance | **required** Data to be exported.
`outputType` | string | Output type, possible values are: svg, jpg, png, pdf. Default: 'jpg'
`dataType` | string | Type of target.
`document` | Document | Document object where was rendered chart or should be.
`containerId` | string | Id of container.
`resources` | Array.\<string\> | Links to external resources.
`callback` | Function | The result callback.

**Returns:**  
Promise if no callback passed.

### `exportToSync(target, options):Object`
Generate an image synchronously.  

**Parameters:**

Name | Type | Description
--- | --- | ---
`target` | SVG string, XML string, Java Script string, a chart or a stage instance | **required** Data to be exported.
`outputType` | string | Output type, possible values are: svg, jpg, png, pdf.
`dataType` | string | Type of target.
`document` | Document | Document object where was rendered chart or should be.
`containerId` | string | Id of container.
`resources` | Array.\<string\> | Links to external resources.

**Returns:**  
ArrayBuffer

### `loadFont(path, callback):Promise`
Loads the specified font asynchronously.

**Parameters:**

Name | Type | Description
--- | --- | ---
`path` | string | Path to the font.
`callback` | Function | The result callback.

**Returns:**  
Promise if no callback passed.


### `loadFontSync(path):Object`
Loads the specified font synchronously.

**Parameters:**

Name | Type | Description
--- | --- | ---
`path` | string | Path to font.
**Returns:**  
Object

## Examples 
Generating PDF image a chart with that requires external resources:
```javascript
// require file system and jsdom
var fs = require('fs');

// require only anychart export module
var anychartExport = require('anychart-nodejs');

// define javascript string that represent code of chart creating
var chart = "var chart = anychart.map(); chart.bounds(0, 0, 800, 600); chart.geoData('anychart.maps.united_states_of_america'); chart.container('container'); chart.draw()";

// exporting parameters
var params = {
	outputType: 'pdf',
	resources: [
		'https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.15/proj4.js',
		'https://cdn.anychart.com/releases/v8/geodata/countries/united_states_of_america/united_states_of_america.js'
	]
};

// generate PDF image and save it to a file
anychartExport.exportTo(chart, params).then(function(image) {
  fs.writeFile('anychart.pdf', image, function(fsWriteError) {
    if (fsWriteError) {
      console.log(fsWriteError);
    } else {
      console.log('Complete');
    }
  });
}, function(generationError) {
  console.log(generationError);
});
```

Run the following command in the command line:
```
$ node index.js
>> Complete
```

Please, take a look at examples:
* [Report Generation Utility](https://github.com/anychart-integrations/nodejs-report-generation-utilily)
* [Image Generation Utility](https://github.com/anychart-integrations/nodejs-image-generation-utility)
* [Export Server Application](https://github.com/anychart-integrations/nodejs-export-server-application)

## Contacts

* Web: [www.anychart.com](www.anychart.com)
* Email: [contact@anychart.com](mailto:contact@anychart.com)
* Twitter: [anychart](https://twitter.com/anychart)
* Facebook: [AnyCharts](https://www.facebook.com/AnyCharts)
* LinkedIn: [anychart](https://www.linkedin.com/company/anychart)

## Links

* [AnyChart Website](https://www.anychart.com)
* [Download AnyChart](https://www.anychart.com/download/)
* [AnyChart Licensing](https://www.anychart.com/buy/)
* [AnyChart Support](https://www.anychart.com/support/)
* [Report Issues](https://github.com/AnyChart/AnyChart-NodeJS/issues)
* [AnyChart Playground](https://playground.anychart.com)
* [AnyChart Documentation](https://docs.anychart.com)
* [AnyChart API Reference](https://api.anychart.com)
* [AnyChart Sample Solutions](https://www.anychart.com/solutions/)
* [AnyChart Integrations](https://www.anychart.com/integrations/)

## License

[© AnyChart.com - JavaScript charts](http://www.anychart.com). [![Analytics](https://ga-beacon.appspot.com/UA-228820-4/Plugins/NodeJS?pixel&useReferer)](https://github.com/igrigorik/ga-beacon)

[npm-image]: https://img.shields.io/npm/v/anychart-nodejs.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/anychart-nodejs
[downloads-image]: https://img.shields.io/npm/dm/anychart-nodejs.svg?style=flat-square
[downloads-url]: https://www.npmjs.com/package/anychart-nodejs
[quality-image]: http://npm.packagequality.com/shield/anychart-nodejs.svg?style=flat-square
[quality-url]: http://packagequality.com/#?package=anychart-nodejs
