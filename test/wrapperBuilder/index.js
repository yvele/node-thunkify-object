var assert = require('assert');

var WrapperBuilder = require('../../lib').WrapperBuilder;
var Dummy = require('./Dummy').Dummy;


describe('WrapperBuilder', function() {


  it('add() should work with no transformations', function(done) {

    var DummyWrapper = new WrapperBuilder()
      .add('doNoParams')
      .getWrapper();

    var dummy = new DummyWrapper(new Dummy('CP'));

    dummy.doNoParams()(function(err, res) {
      assert(!err);
      assert.equal(res, 'CP');
      done();
    });
  });

  it('add() should work with an array of methods', function(done) {

    var DummyWrapper = new WrapperBuilder()
      .add(['doNoParams', 'doWithParams'])
      .getWrapper();

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

    var wb = new WrapperBuilder();
    var DummyWrapper = wb.getWrapper();

    var dummy = new DummyWrapper(new Dummy('CP'));


    wb.add('doNoParams', {
        transformations: {
          1: function(res) {

            assert.strictEqual(this, dummy,
              'Transformation functions must be called'
              + 'with the wrapper instance as a context (this)');

            return res + ' TRANS';
          }
        }
      });



    dummy.doNoParams()(function(err, res) {
      assert(!err);
      assert.equal(res, 'CP TRANS');
      done();
    });
  });

  it('add() should work with multiple results', function(done) {

    var DummyWrapper = new WrapperBuilder()
      .add('doWithMultipleResults')
      .getWrapper();

    var dummy = new DummyWrapper(new Dummy());

    dummy.doWithMultipleResults()(function(err, res1, res2) {
      assert(!err);
      assert.equal(res1, 'RES1');
      assert.equal(res2, 'RES2');
      done();
    });
  });

  it('addPassThrough() should work', function() {

    var DummyWrapper = new WrapperBuilder()
      .addPassThrough('doNoCallback')
      .getWrapper();

    var dummy = new DummyWrapper(new Dummy('CP'));

    var res = dummy.doNoCallback('P1');
    assert.equal(res, 'CP P1');
  });


  it('addPassThrough() should work with an array of methods', function() {

    var DummyWrapper = new WrapperBuilder()
      .addPassThrough(['doNoCallback', 'doNoCallbackNoParams'])
      .getWrapper();

    var dummy = new DummyWrapper(new Dummy('CP'));

    var res = dummy.doNoCallback('P1');
    assert.equal(res, 'CP P1');

    res = dummy.doNoCallbackNoParams();
    assert.equal(res, 'CP');
  });

});
