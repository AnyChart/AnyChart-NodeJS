// var jsdom = require('jsdom').jsdom;
var jsdom = require('jsdom').jsdom;
var opentype = require('opentype.js');
var spawn = require('child_process').spawn;

document = jsdom('<div id="container"></div>');
window = document.defaultView;

var anychart = require('anychart');

console.log(anychart);


