var assert = require('assert');

var WrapperBuilder = require('../../lib').WrapperBuilder;
var Dummy = require('./Dummy').Dummy;


describe('WrapperBuilder', function() {


  it('add() should work with no transformations', function(done) {

    var wp = new WrapperBuilder();
    wp.add('doNoParams');

    var DummyWrapper = wp.getWrapper();
    var dummy = new DummyWrapper(new Dummy('CP'));

    dummy.doNoParams()(function(err, res) {
      assert(!err);
      assert.equal(res, 'CP');
      done();
    });
  });

  it('add() should work with an array of methods', function(done) {

    var wp = new WrapperBuilder();
    wp.add(['doNoParams', 'doWithParams']);

    var DummyWrapper = wp.getWrapper();
    var dummy = new DummyWrapper(new Dummy('CP'));

    dummy.doNoParams()(function(err, res) {
      assert(!err);
      assert.equal(res, 'CP');

      dummy.doWithParams('P1', 'P2')(function(err, res) {
        assert(!err);
        assert.equal(res, 'P1 P2 CP');

        done();
      });
    });
  });


  it('add() should work with transformations', function(done) {

    var wp = new WrapperBuilder();
    wp.add('doNoParams', {
      transformations: {
        1: function(res) { return res + ' TRANS'; }
      }
    });

    var DummyWrapper = wp.getWrapper();
    var dummy = new DummyWrapper(new Dummy('CP'));

    dummy.doNoParams()(function(err, res) {
      assert(!err);
      assert.equal(res, 'CP TRANS');
      done();
    });
  });

  it('add() should work with multiple results', function(done) {

    var wp = new WrapperBuilder();
    wp.add('doWithMultipleResults');

    var DummyWrapper = wp.getWrapper();
    var dummy = new DummyWrapper(new Dummy());

    dummy.doWithMultipleResults()(function(err, res1, res2) {
      assert(!err);
      assert.equal(res1, 'RES1');
      assert.equal(res2, 'RES2');
      done();
    });
  });

  it('add() should be chainable', function() {
    var wp = new WrapperBuilder();
    var res = wp.add('doNoParams');

    assert.strictEqual(res, wp);
  });


  it('addPassThrough() should work', function() {

    var wp = new WrapperBuilder();
    wp.addPassThrough('doNoCallback');

    var DummyWrapper = wp.getWrapper();
    var dummy = new DummyWrapper(new Dummy('CP'));

    var res = dummy.doNoCallback('P1');
    assert.equal(res, 'CP P1');
  });


  it('addPassThrough() should work with an array of methods', function() {

    var wp = new WrapperBuilder();
    wp.addPassThrough(['doNoCallback', 'doNoCallbackNoParams']);

    var DummyWrapper = wp.getWrapper();
    var dummy = new DummyWrapper(new Dummy('CP'));

    var res = dummy.doNoCallback('P1');
    assert.equal(res, 'CP P1');

    res = dummy.doNoCallbackNoParams();
    assert.equal(res, 'CP');
  });

  it('addPassThrough() should be chainable', function() {
    var wp = new WrapperBuilder();
    var res = wp.addPassThrough('doNoParams');

    assert.strictEqual(res, wp);
  });

});
