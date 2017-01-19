[<img src="https://cdn.anychart.com/images/logo-transparent-segoe.png?2" width="234px" alt="AnyChart - Robust JavaScript/HTML5 Chart library for any project">](https://anychart.com)

AnyChart NodeJS export module.

=========

NodeJS module that provides an ability to generate SVG, JPG and PNG images 
from AnyCharts charts.

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

First of all, you have to install [ImageMagic](https://www.imagemagick.org/script/index.php)
util for your platform. AnyChart NodeJS export module uses it to generate images.

#### Package managers

You can install AnyChart NodyJS export module using **npm**, **bower** or **yarn**:

* `npm install anychart-export`
* `bower install anychart-export`
* `yarn add anychart-export`

## General Notes

* It is a module, not a server. It means that this solution 
can be easily integrated in any NodeJS project.
* Module is independent, so it doesn't require PhantomJS, 
Graphical Environment or somethin like that.
* It's pretty fast.



## Usage Notes 
Usage of this module simplifies simplifies implementation of solutions like:
* Your own export server.
* Console chart-to-image export util.
* Reports server.
* Reports generation console util.
* etc...


## Quick start 
Console export sample is available [here](https://github.com/anychart-integrations/nodejs-exporting-console-utility-sample). 
To run an image console export, exec index.js file with nodejs.

```
$ node index.js -i myChart.js -o myImage -t jpg
Written to myImage.jpg file  
```

In this sample anychart-export module can be used in simple way like this:
```javascript
var fs = require('fs');
var jsdom = require('jsdom').jsdom;

var d = jsdom('<body><div id="container"></div></body>');
var w = d.defaultView;

var anychart = require('anychart')(w);
var anychart_export = require('anychart-export')(anychart);
```

Another anychart-export integrations can be found in [Anychart Integrations Repo](https://github.com/AnyChart-Integrations)



## AnyChart Export Module API
#### `exportTo(target, options, callback):Promise`
Asynchronous image generation. Gets result in resulting callback, returns Promise.

Input parameters:

Parameter Name | Type | Description
--- | --- | ---
`target` | SVG, Chart, Stage | Instance of what to export.
`options` | Object, string | Options object of string that represents export image type.
`callback` | Function | Async Callback function that contains result.

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












