var mime = require('mime-types');
var DOMParser = require('xmldom').DOMParser;
var XMLparser = new DOMParser();
var fastXmlParser = require('fast-xml-parser');
var request = require('request');
// var FontFaceObserver = require('fontfaceobserver');
var deasync = require('deasync');
var xmlNs = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>';
var vm = require('vm2');
var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});
var spawnSync = require('child_process').spawnSync;
var spawn = require('child_process').spawn;
var execSync = require('child_process').execSync;
var extend = require('util')._extend;
var opentype = require('opentype.js');
var async = require('async');
var defaultFontsDir = __dirname + '/../fonts';
var promiseLibrary = typeof global.Promise === 'function' ? global.Promise : require('es6-promise').Promise;
var isWin = /^win/.test(process.platform);
var defaultParallelsTasks = 100;
var convertQueue = async.queue(workerForConverting, defaultParallelsTasks);
var fonts = {};
var defaultBounds = {left: 0, top: 0, width: 1024, height: 768};
var vectorImageParams = ['background', 'border', 'blur', 'contrast', 'crop', 'frame', 'gamma', 'monochrome', 'negative', 'noise', 'quality'];
var childProcess;

childProcess = spawn(isWin ? 'magick' : 'convert');
childProcess.on('error', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('Warning! Please install imagemagick utility. (https://www.imagemagick.org/script/binary-releases.php)');
  }
});
childProcess.stdin.on('error', function(err) {});
childProcess.stdin.write('');
childProcess.stdin.end();

childProcess = spawn('rsvg-convert');
childProcess.on('error', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('Warning! Please install rsvglib utility. (https://github.com/AnyChart/AnyChart-NodeJS)');
  }
});
childProcess.stdin.on('error', function(err) {});
childProcess.stdin.write('');
childProcess.stdin.end();

var uuidv4 = require('uuid/v4');
var JSDOM = require('jsdom').JSDOM;

var iframeDoc = null,
    rootDoc = null,
    iframes = {},
    anychart = typeof anychart === 'undefined' ? anychart : void 0;

if (anychart) {
  var doc = anychart.global() && anychart.global().document || createDocument();
  setAsRootDocument(doc);
} else {
  setAsRootDocument(createDocument());
  anychart = require('anychart')(rootDoc.defaultView);
}

//region --- Utils and settings
function setAsRootDocument(doc) {
  rootDoc = doc;
  var window = rootDoc.defaultView;
  window.setTimeout = function(code, delay, arguments) {};
  window.setInterval = function(code, delay, arguments) {};
  anychartify(rootDoc);

  return rootDoc
}

function createDocument() {
  return (new JSDOM('', {runScripts: 'dangerously'})).window.document;
}

function createSandbox(containerTd) {
  var iframeId = 'iframe_' + uuidv4();
  var iframe = rootDoc.createElement('iframe');
  iframes[iframeId] = iframe;
  iframe.setAttribute('id', iframeId);
  rootDoc.body.appendChild(iframe);
  iframeDoc = iframe.contentDocument;
  var div = iframeDoc.createElement('div');
  div.setAttribute('id', containerTd);
  iframeDoc.body.appendChild(div);

  return iframeId;
}

function clearSandbox(iframeId) {
  var iFrame = rootDoc.getElementById(iframeId);
  if (!iframeId || !iFrame) return;
  iframeDoc = iFrame.contentDocument;
  var iframeWindow = iframeDoc.defaultView;
  iframeWindow.anychart = null;
  iframeWindow.acgraph = null;
  iframeDoc.createElementNS = null;
  iframeDoc.body.innerHTML = '';
  iFrame.contentDocument = null;
  rootDoc.body.removeChild(iFrame);
  delete iframes[iframeId];
}

function isPercent(value) {
  if (value == null)
    return false;
  var l = value.length - 1;
  return (typeof value == 'string') && l >= 0 && value.indexOf('%', l) == l;
}

function isDef(value) {
  return value != void 0;
}

function isVectorFormat(type) {
  return type === 'pdf' || type === 'ps' || type === 'svg';
}

function applyImageParams(img, params) {
  for (var i = 0, len = vectorImageParams.length; i < len; i++) {
    var paramName = vectorImageParams[i];
    var value = params[paramName];
    if (value)
      img[paramName].apply(img, Object.prototype.toString.call(value) === '[object Array]' ? value : [value]);
  }
}

function isFunction(value) {
  return typeof(value) == 'function';
}

function concurrency(count) {
  // var availableProcForExec = getAvailableProcessesCount();
  //
  // if (count > availableProcForExec) {
  //   count = availableProcForExec;
  //   console.log('Warning! You can spawn only ' + availableProcForExec + ' process at a time.');
  // }
  convertQueue.concurrency = count;
}

function getBBox() {
  var text = this.textContent;
  var fontSize = parseFloat(this.getAttribute('font-size'));
  var fontFamily = this.getAttribute('font-family');
  if (fontFamily) fontFamily = fontFamily.toLowerCase();
  var fontWeight = this.getAttribute('font-weight');
  if (fontWeight) fontWeight = fontWeight.toLowerCase();
  var fontStyle = this.getAttribute('font-style');
  if (fontStyle) fontStyle = fontStyle.toLowerCase();

  var fontsArr = fontFamily.split(', ');

  var font;
  for (var i = 0, len = fontsArr.length; i < len; i++) {
    var name = fontsArr[i] + (fontWeight == 'normal' || !isNaN(+fontWeight) ? '' : ' ' + fontWeight) + (fontStyle == 'normal' ? '' : ' ' + fontStyle);
    if (font = fonts[name])
      break;
  }

  if (!font)
    font = fonts['verdana'];

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

  return {x: 0, y: top, width: width, height: height};
}

function anychartify(doc) {
  doc.createElementNS = function(ns, tagName) {
    var elem = doc.createElement(tagName);
    elem.getBBox = elem.getBBox || getBBox;
    return elem;
  };
}

function prepareDocumentForRender(doc) {
  anychartify(doc);

  var window = doc.defaultView;
  window.anychart = anychart;
  window.acgraph = anychart.graphics;
  window.isNodeJS = true;
  window.defaultBounds = defaultBounds;
  window.setTimeout = function(code, delay, arguments) {};
  window.setInterval = function(code, delay, arguments) {};
}

function getParams(args) {
  var arrLength = args.length;
  var lastArg = args[arrLength - 1];
  var callback = isFunction(lastArg) ? lastArg : null;

  var options = arrLength === 1 ? void 0 : callback ? arrLength > 2 ? args[arrLength - 2] : void 0: lastArg;
  var params = {};

  params.callback = callback;

  if (typeof options === 'string') {
    params.outputType = options;
  } else if (typeof options === 'object') {
    extend(params, options)
  }

  var target = args[0];
  if (target && !isDef(params.dataType)) {
    if (typeof target === 'string') {
      target = target.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');

      try {
        JSON.parse(target);
        params.dataType = 'json';
      } catch (e) {
        if (fastXmlParser.validate(target)) {
          if (target.lastIndexOf('<svg') !== -1) {
            params.dataType = 'svg';
          } else {
            params.dataType = 'xml';
          }
        } else {
          params.dataType = 'javascript';
        }
      }
    } else {
      var isChart = typeof target.draw === 'function';
      var isStage = typeof target.resume === 'function';
      params.dataType = isChart ? 'chart' : isStage ? 'stage' : void 0;
    }
  }

  if (!params.outputType) {
    params.outputType = 'jpg';
  }

  if (!isDef(params.containerId)) {
    if (params.dataType === 'javascript') {
      var regex = /\.container\(('|")(.*)('|")\)/g;
      var result = regex.exec(target);
      params.containerId = result ? result[2] : 'container';
    } else {
      params.containerId = 'container';
    }
  }

  return params;
}

function fixSvg(svg) {
  return svg
  //jsdom bug - (https://github.com/tmpvar/jsdom/issues/620)
      .replace(/textpath/g, 'textPath')
      .replace(/lineargradient/g, 'linearGradient')
      .replace(/radialgradient/g, 'radialGradient')
      .replace(/clippath/g, 'clipPath')
      .replace(/patternunits/g, 'patternUnits')
      //fixes for wrong id naming
      .replace(/(id=")#/g, '$1')
      .replace(/(url\()##/g, '$1#')
      //anychart a11y
      .replace(/aria-label=".*?"/g, '')
}

function applyResourcesToDoc(params, resources, callback) {
  var document = params.document;
  var head = document.getElementsByTagName('head')[0];
  var window = document.defaultView;
  var scripts = '';

  for (var i = 0, len = resources.length; i < len; i++) {
    var resource = resources[i];
    var type = resource.type;

    if (type == mime.contentType('css')) {
      var style = document.createElement('style');
      style.innerHTML = resource.body;
      head.appendChild(style);

      //todo font loading
      // var font = new FontFaceObserver('Conv_interdex');
      // font.load().then(function () {
      //
      // });
    } else if (type == mime.contentType('js')) {
      scripts += ' ' + resource.body + ';';
    }
  }

  var err = null;
  try {
    var script = new vm.VM({
      timeout: 5000,
      sandbox: window
    });
    script.run(scripts);
  } catch (e) {
    console.log(e);
    err = e;
  }

  return callback(err, params);
}

function loadExternalResources(resources, params, callback) {
  if (Object.prototype.toString.call(resources) === '[object Array]') {
    var loadedResources = [];
    for (var i = 0, len = resources.length; i < len; i++) {
      request
          .get(resources[i], function(err, response, body) {
            if (err) {
              loadedResources.push('');
            } else {
              loadedResources.push({
                type: mime.contentType(response.headers['content-type']),
                body: body
              });
            }

            if (resources.length === loadedResources.length) {
              return applyResourcesToDoc(params, loadedResources, callback);
            }
          });
    }
    if (resources.length === loadedResources.length) {
      return applyResourcesToDoc(params, loadedResources, callback);
    }
  } else {
    return callback(null, params);
  }
}

function getSvgString(svgElement, width, height) {
  var svg = '';
  if (svgElement) {
    if (!width || isPercent(width))
      width = defaultBounds.width;
    if (!height || isPercent(height))
      height = defaultBounds.height;

    svgElement.setAttribute('width', width);
    svgElement.setAttribute('height', height);
    svg = xmlNs + svgElement.outerHTML;
  }
  return svg;
}

function getSvg(target, params, callback) {
  var dataType = params.dataType;

  if (dataType === 'svg') {
    return callback(null, fixSvg(target), params);
  } else {
    var svg, container, svgElement;
    var res = params.resources;

    var isChart = dataType === 'chart';
    var isStage = dataType === 'stage';

    if (!params.document && !(isChart || isStage)) {
      params.iframeId = createSandbox(params.containerId);
      params.document = iframeDoc;
    }
    if (params.document)
      prepareDocumentForRender(params.document);

    return loadExternalResources(res, params, function(err, params) {
      var document = params.document;
      var window = document && document.defaultView;
      var bounds, width, height;

      if (window)
        anychart.global(window);

      if (dataType === 'javascript') {
        var script = new vm.VM({
          timeout: 10000,
          sandbox: {
            anychart: window.anychart
          }
        });
        script.run(target);

        var svgElements = document.getElementsByTagName('svg');
        var chartToDispose = [];
        for (var i = 0, len = svgElements.length; i < len; i++) {
          svgElement = svgElements[i];
          if (!svgElement) continue;
          var id = svgElement.getAttribute('ac-id');
          var stage = anychart.graphics.getStage(id);
          if (stage) {
            var charts = stage.getCharts();
            for (var chartId in charts) {
              var chart = charts[chartId];
              bounds = chart.bounds();
              svg = getSvgString(svgElement, bounds.width(), bounds.height());
              chartToDispose.push(chart);
            }
            stage.dispose();
          }
        }

        for (i = 0, len = chartToDispose.length; i < len; i++) {
          chartToDispose[i].dispose();
        }
      } else {
        if (dataType === 'json') {
          target = anychart.fromJson(target);
          isChart = true;
        } else if (dataType === 'xml') {
          target = anychart.fromXml(XMLparser.parseFromString(target));
          isChart = true;
        }
        target.container(params.containerId);

        if (isChart || isStage) {
          if (target.animation)
            target.animation(false);
          if (target.a11y)
            target.a11y(false);

          container = target.container();
          if (!container) {
            if (params.document) {
              var div = params.document.createElement('div');
              div.setAttribute('id', params.containerId);
              params.document.body.appendChild(div);
            } else if (isChart) {
              //todo (blackart) for resolve this case need to add link to chart instance for parent anychart object. while it's not true will be used this approach.
              params.iframeId = createSandbox(params.containerId);
              params.document = iframeDoc;
              prepareDocumentForRender(params.document);
              anychart.global(params.document.defaultView);
              target = anychart.fromJson(target.toJson());
            } else {
              console.warn('Warning! Cannot find context of executing. Please define \'document\' in exporting params.');
              return callback(null, '', params);
            }
            target.container(params.containerId);
            container = target.container();
          }

          if (isChart) {
            target.draw();

            bounds = target.bounds();
            width = bounds.width();
            height = bounds.height();
          } else {
            target.resume();

            bounds = target.getBounds();
            width = bounds.width;
            height = bounds.height;
          }

          svgElement = isChart ? container.getStage().domElement() : target.domElement();
          svg = getSvgString(svgElement, width, height);

          if (dataType === 'json' && dataType === 'xml') {
            target.dispose();
          }
        } else {
          console.warn('Warning! Wrong format of incoming data.');
          svg = '';
        }
      }
      clearSandbox(params.iframeId);

      return callback(null, fixSvg(svg), params);
    });
  }
}

function getAvailableProcessesCount() {
  //nix way
  var procMetrics = execSync('ulimit -u && ps ax | wc -l').toString().trim().split(/\n\s+/g);
  return procMetrics[0] - procMetrics[1];
}

function workerForConverting(task, done) {
  if (isVectorFormat(task.params.outputType)) {
    var childProcess;
    var callBackAlreadyCalled = false;
    try {
      var params = ['-f', task.params.outputType];
      if (isDef(task.params.width))
        params.push('-w', task.params.width);
      if (isDef(task.params.height))
        params.push('-h', task.params.height);
      if (isDef(task.params['aspect-ratio']) && String(task.params['aspect-ratio']).toLowerCase() != 'false')
        params.push('-a');
      if (isDef(task.params.background))
        params.push('-b', task.params.background);

      childProcess = spawn('rsvg-convert', params);
      var buffer;
      childProcess.stdout.on('data', function(data) {
        try {
          var prevBufferLength = (buffer ? buffer.length : 0),
              newBuffer = new Buffer(prevBufferLength + data.length);

          if (buffer) {
            buffer.copy(newBuffer, 0, 0);
          }

          data.copy(newBuffer, prevBufferLength, 0);

          buffer = newBuffer;
        } catch (err) {
          if (!callBackAlreadyCalled) {
            done(err, null);
            callBackAlreadyCalled = true;
          }
        }
      });

      childProcess.on('close', function(code, signal) {
        if (!code && !callBackAlreadyCalled) {
          done(null, buffer);
        } else {
          console.warn('Unexpected close of child process with code %s signal %s', code, signal);
        }
      });

      childProcess.stderr.on('data', function(data) {
        if (!callBackAlreadyCalled) {
          done(new Error(data), null);
          callBackAlreadyCalled = true;
        }
      });

      childProcess.on('error', function(err) {
        if (err.code === 'ENOENT') {
          console.warn('Warning! Please install librsvg package.');
        }
        if (!callBackAlreadyCalled) {
          done(err, null);
          callBackAlreadyCalled = true;
        }
      });

      childProcess.stdin.write(task.svg);
      childProcess.stdin.end();
    } catch (err) {
      if (!callBackAlreadyCalled) {
        done(err, null);
        callBackAlreadyCalled = true;
      }
    }
  } else {
    var img = gm(Buffer.from(task.svg, 'utf8'));
    applyImageParams(img, task.params);
    img.toBuffer(task.params.outputType, done);

    // var childProcess;
    // try {
    //   childProcess = spawn(isWin ? 'magick' : 'convert', ['svg:-', task.params.outputType + ':-']);
    //   var buffer;
    //   childProcess.stdout.on('data', function(data) {
    //     console.log('data');
    //     try {
    //       var prevBufferLength = (buffer ? buffer.length : 0),
    //           newBuffer = new Buffer(prevBufferLength + data.length);
    //
    //       if (buffer) {
    //         buffer.copy(newBuffer, 0, 0);
    //       }
    //
    //       data.copy(newBuffer, prevBufferLength, 0);
    //
    //       buffer = newBuffer;
    //     } catch (err) {
    //       done(err, null);
    //     }
    //   });
    //
    //   childProcess.on('close', function(code) {
    //     if (!code) {
    //       done(null, buffer);
    //     }
    //   });
    //
    //   childProcess.on('error', function(err) {
    //     if (err.code == 'ENOENT') {
    //       console.log('Warning! Please install imagemagick utility. (https://www.imagemagick.org/script/binary-releases.php)');
    //     }
    //     done(err, null);
    //   });
    //
    //   childProcess.stdin.write(task.svg);
    //   childProcess.stdin.end();
    // } catch (err) {
    //   done(err, null);
    // }
  }
}

function loadDefaultFontsSync() {
  var fontFilesList = fs.readdirSync(defaultFontsDir);

  for (var i = 0, len = fontFilesList.length; i < len; i++) {
    var fileName = fontFilesList[i];
    var font = opentype.loadSync(defaultFontsDir + '/' + fileName);
    fonts[font.names.fullName.en.toLowerCase()] = font;
  }

  return fonts;
}

function convertSvgToImageData(svg, params, callback) {
  convertQueue.push({svg: svg, params: params}, callback);
}

function convertSvgToImageDataSync(svg, params) {
  if (isVectorFormat(params.outputType)) {
    var convertParams = ['-f', params.outputType];
    if (isDef(params.width))
      convertParams.push('-w', params.width);
    if (isDef(params.height))
      convertParams.push('-h', params.height);
    if (isDef(params['aspect-ratio']) && String(params['aspect-ratio']).toLowerCase() !== 'false')
      convertParams.push('-a');
    if (isDef(params.background))
      convertParams.push('-b', params.background);

    return spawnSync('rsvg-convert', convertParams, {input: svg}).stdout;

  } else {
    // convert = spawnSync(isWin ? 'magick' : 'convert', ['svg:-', params.outputType + ':-'], {input: svg});
    var done = false, data = null, error = null;

    var img = gm(Buffer.from(svg, 'utf8'));
    applyImageParams(img, params);
    img.toBuffer(params.outputType, function(err, buffer) {
      data = buffer;
      error = err;
      done = true;
    });
    deasync.loopWhile(function() {
      return !done;
    });
    return data;
  }
}

//endregion utils

//region --- API
var AnychartExport = function() {
};

AnychartExport.prototype.exportTo = function(target, options, callback) {
  if (!target) {
    console.warn('Can\'t read input data for exporting.');
  }

  var params = getParams(arguments);
  callback = params.callback;

  if (typeof callback === 'function') {
    try {
      getSvg(target, params, function(err, svg, params) {
        if (params.outputType === 'svg') {
          process.nextTick(function() {
            callback(err, svg);
          });
        } else {
          convertSvgToImageData(svg, params, callback);
        }
      });
    } catch (e) {
      callback(e, null);
      return;
    }
  } else {
    return new promiseLibrary(function(resolve, reject) {
      try {
        getSvg(target, params, function(err, svg, params) {
          if (params.outputType === 'svg') {
            process.nextTick(function() {
              if (err) reject(err);
              else resolve(svg);
            });
          } else {
            var done = function(err, image) {
              if (err) reject(err);
              else resolve(image);
            };
            convertSvgToImageData(svg, params, done);
          }
        })
      } catch (e) {
        reject(e);
        return;
      }
    })
  }
};

AnychartExport.prototype.exportToSync = function(target, options) {
  var params = getParams(arguments);
  return getSvg(target, params, function(err, svg, params) {
    return params.outputType === 'svg' ? svg : convertSvgToImageDataSync(svg, params);
  });
};

AnychartExport.prototype.loadFont = function(path, callback) {
  if (typeof callback == 'function') {
    opentype.load(path, function(err, font) {
      if (!err)
        fonts[font.names.fullName.en.toLowerCase()] = font;

      callback(err, font);
    });
  } else {
    return new promiseLibrary(function(resolve, reject) {
      opentype.load(path, function(err, font) {
        if (err) {
          reject(err);
        } else {
          fonts[font.names.fullName.en.toLowerCase()] = font;
          resolve(font);
        }
      });
    })
  }
};

AnychartExport.prototype.loadFontSync = function(path) {
  return fonts[font.names.fullName.en.toLowerCase()] = opentype.loadSync(path);
};

AnychartExport.prototype.anychartify = anychartify;

var AnychartExportWrapper = function(anychartInst) {
  if (anychartInst) {
    anychart = anychartInst;
    setAsRootDocument(anychart.global().document);
  }
  return new AnychartExport();
};

AnychartExportWrapper.exportTo = AnychartExport.prototype.exportTo;

AnychartExportWrapper.exportToSync = AnychartExport.prototype.exportToSync;

AnychartExportWrapper.loadFont = AnychartExport.prototype.loadFont;

AnychartExportWrapper.loadFontSync = AnychartExport.prototype.loadFontSync;

AnychartExportWrapper.anychartify = AnychartExport.prototype.anychartify;

//endregion

loadDefaultFontsSync();

module.exports = AnychartExportWrapper;