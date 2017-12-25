var chai = require('chai');
var crypto = require('crypto');
const should = chai.should();
const expect = chai.expect;
var app = require('../lib/anychart-node');

describe('Exporting', function() {
  describe('exportTo', function() {
    describe('Second param as string (output type)', function() {
      var outputType = 'pdf';

      it('check promise', function(done) {
        var data = "anychart.onDocumentReady(function() {var chart = anychart.pie([10, 20, 8, 5, 12, 9]); chart.container('container').draw();});";

        app.exportTo(data, outputType).then(function(image) {
          image.should.to.not.be.empty;
          image.should.be.instanceof(Buffer);

          done();
        }, function(err) {
          console.log(err);
        });
      });

      it('javascript -> pdf', function(done) {
        var data = "anychart.onDocumentReady(function() {var chart = anychart.pie([10, 20, 8, 5, 12, 9]); chart.labels(false).legend(false).title(false); chart.container('container').draw();});";

        app.exportTo(data, outputType, function(err, image) {
          image.should.to.not.be.empty;
          image.should.be.instanceof(Buffer);
          expect(err).to.be.null;

          done();
        });
      });

      it('xml -> pdf', function(done) {
        var data = '<anychart xmlns="http://anychart.com/schemas/8.1.0/xml-schema.xsd"><chart enabled="true" type="pie"><credits enabled="false"/><data><point><![CDATA[10]]></point><point><![CDATA[20]]></point><point><![CDATA[8]]></point><point><![CDATA[5]]></point><point><![CDATA[12]]></point><point><![CDATA[9]]></point></data><normal><labels enabled="true" disable_pointer_events="true"/></normal></chart></anychart>';

        app.exportTo(data, outputType, function(err, image) {
          image.should.to.not.be.empty;
          image.should.be.instanceof(Buffer);
          expect(err).to.be.null;

          done();
        });
      });

      it('json -> pdf', function(done) {
        var data = '{"chart":{"enabled":true,"credits":{"enabled":false},"type":"pie","data":[10,20,8,5,12,9],"normal":{"labels":{"enabled":true,"disablePointerEvents":true}}}}';

        app.exportTo(data, outputType, function(err, image) {
          image.should.to.not.be.empty;
          image.should.be.instanceof(Buffer);
          expect(err).to.be.null;

          done();
        });
      });

      it('object -> pdf', function(done) {
        var doc = require('jsdom').jsdom();
        var anychart = require('anychart')(doc.defaultView);

        var chart = anychart.pie([10, 20, 8, 5, 12, 9]);
        chart.container('container').draw();

        app.exportTo(chart, outputType, function(err, image) {
          image.should.to.not.be.empty;
          image.should.be.instanceof(Buffer);
          expect(err).to.be.null;

          done();
        });
      });

    });

    describe('Second param as object', function() {
      var trueHash = "150e7d527bb8530324518495ca4f718c";
      var params = {
        type: 'pdf'
      };

      it('check promise', function(done) {
        var data = "anychart.onDocumentReady(function() {var chart = anychart.pie([10, 20, 8, 5, 12, 9]); chart.container('container').draw();});";

        app.exportTo(data, params).then(function(image) {
          image.should.to.not.be.empty;
          image.should.be.instanceof(Buffer);

          done();
        }, function(err) {
          expect(err).to.be.null;
          done();
        });
      });

      it('javascript -> pdf', function(done) {
        var data = "anychart.onDocumentReady(function() {var chart = anychart.pie([10, 20, 8, 5, 12, 9]); chart.container('container').draw();});";

        app.exportTo(data, params, function(err, image) {
          image.should.to.not.be.empty;
          image.should.be.instanceof(Buffer);
          expect(err).to.be.null;

          done();
        });
      });

      it('xml -> pdf', function(done) {
        var data = '<anychart xmlns="http://anychart.com/schemas/8.1.0/xml-schema.xsd"><chart enabled="true" type="pie"><credits enabled="false"/><data><point><![CDATA[10]]></point><point><![CDATA[20]]></point><point><![CDATA[8]]></point><point><![CDATA[5]]></point><point><![CDATA[12]]></point><point><![CDATA[9]]></point></data><normal><labels enabled="true" disable_pointer_events="true"/></normal></chart></anychart>';

        app.exportTo(data, params, function(err, image) {
          image.should.to.not.be.empty;
          image.should.be.instanceof(Buffer);
          expect(err).to.be.null;

          done();
        });
      });

      it('json -> pdf', function(done) {
        var data = '{"chart":{"enabled":true,"credits":{"enabled":false},"type":"pie","data":[10,20,8,5,12,9],"normal":{"labels":{"enabled":true,"disablePointerEvents":true}}}}';

        app.exportTo(data, params, function(err, image) {
          image.should.to.not.be.empty;
          image.should.be.instanceof(Buffer);
          expect(err).to.be.null;

          done();
        });
      });

      it('object -> pdf', function(done) {
        var doc = require('jsdom').jsdom();
        var anychart = require('anychart')(doc.defaultView);

        var chart = anychart.pie([10, 20, 8, 5, 12, 9]);
        chart.container('container').draw();

        app.exportTo(chart, params, function(err, image) {
          image.should.to.not.be.empty;
          image.should.be.instanceof(Buffer);
          expect(err).to.be.null;

          done();
        });
      });


    })
  })
});