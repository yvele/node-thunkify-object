var assert = require('assert');
var EventEmitter = require('events').EventEmitter;

var WrapperBuilder = require('../../lib').WrapperBuilder;
var Dummy = require('./Dummy').Dummy;


/**
 * @param {Object} context The Transformation function context (this).
 * @param {Object!} wrapper The wrapper instance to be compared with.
 */
function assertTransformationContext(context, wrapper) {
  assert.strictEqual(context, wrapper,
    'Transformation functions must be called'
    + ' with the wrapper instance as a context (this).');
};


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
            assertTransformationContext(this, dummy);
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


  it('add() should work with a post transformation (transformations.post)', function(done) {

    var Dummy = function() {};
    Dummy.prototype.do = function(callback) {
      // Only one param, err is voluntarily omitted.
      callback('RES');
    };

    var wb = new WrapperBuilder();
    var DummyWrapper = wb.getWrapper();

    var dummy = new DummyWrapper(new Dummy('CP'));

    wb.add('do', {
        transformations: {
          post: function(args) {
            assertTransformationContext(this, dummy);

            args.unshift(null);
            return args;
          }
        }
      });

    dummy.do()(function(err, res) {
      assert(!err);
      assert.equal(res, 'RES');
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


  it('add() should work with options.sync', function(done) {

    var DummyWrapper = new WrapperBuilder()
      .add('doBiMode', {
        sync: true
      })
      .getWrapper();

    var dummy = new DummyWrapper(new Dummy());

    // Sync mode
    var syncRes = dummy.doBiModeSync('P');
    assert.equal(syncRes, 'SYNC P');

    // Async mode
    dummy.doBiMode('P')(function(err, asyncRes) {
      assert(!err);
      assert.equal(asyncRes, 'ASYNC P');
      done();
    });
  });


  it('add() should work with options.sync and a transformation', function(done) {

    var wb = new WrapperBuilder();
    var DummyWrapper = wb.getWrapper();
    var dummy = new DummyWrapper(new Dummy());

    wb.add('doBiMode', {
      sync: {
        transformation: function(res) {
          assertTransformationContext(this, dummy);
          return res + ' TRANSFORMED';
        }
      }
    });


    // Sync mode
    var syncRes = dummy.doBiModeSync('P');
    assert.equal(syncRes, 'SYNC P TRANSFORMED');

    // Async mode
    dummy.doBiMode('P')(function(err, asyncRes) {
      assert(!err);
      assert.equal(asyncRes, 'ASYNC P');
      done();
    });
  });


  it('add() should work with options.sync and custom prototype format', function(done) {

    var DummyWrapper = new WrapperBuilder()
      .add('doBiMode', {
        sync: {
          prototypeNameFormat: '%sAnotherSuffix'
        }
      })
      .getWrapper();

    var dummy = new DummyWrapper(new Dummy());

    // Sync mode
    var syncRes = dummy.doBiModeAnotherSuffix('P');
    assert.equal(syncRes, 'SYNC P');

    // Async mode
    dummy.doBiMode('P')(function(err, asyncRes) {
      assert(!err);
      assert.equal(asyncRes, 'ASYNC P');
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


  it('addPassThrough() should work with a transformation', function() {

    var wb = new WrapperBuilder();
    var DummyWrapper = wb.getWrapper();
    var dummy = new DummyWrapper(new Dummy());

    wb.addPassThrough('doNoCallback', {
        transformation: function(res) {
          assertTransformationContext(this, dummy);
          return res + ' TRANSFORMED';
        }
      });

    var dummy = new DummyWrapper(new Dummy('CP'));

    var res = dummy.doNoCallback('P1');
    assert.equal(res, 'CP P1 TRANSFORMED');
  });


  it('addEvent() should work with a callback (native mode)', function(done) {

    var DummyWrapper = new WrapperBuilder()
      .addEvent('on')
      .addPassThrough('emit')
      .getWrapper();

    var dummy = new DummyWrapper(new EventEmitter());
    dummy.on('test', done);
    dummy.emit('test');
  });


  it('addEvent() should work with an array of methods', function(done) {

    var DummyWrapper = new WrapperBuilder()
      .addEvent(['on', 'once'])
      .addPassThrough('emit')
      .getWrapper();

    var dummy = new DummyWrapper(new EventEmitter());
    dummy.once('test', done);
    dummy.emit('test');
  });


  it('addEvent() should work with a callback (native mode) and transformations', function(done) {

    var DummyWrapper = new WrapperBuilder()
      .addPassThrough('emit')
      .addEvent('on', {
        events: {
          test: {
            transformations: {
              0: function(p) { return p + ' TRANSFORMED1' },
              1: function(p) { return p + ' TRANSFORMED2' },
              post: function(args) { args.push('P4'); return args; }
            }
          }
        }
      })
      .getWrapper();

    var dummy = new DummyWrapper(new EventEmitter());

    dummy.on('test', function(p1, p2, p3) {
      assert.equal(p1, 'P1 TRANSFORMED1');
      assert.equal(p2, 'P2 TRANSFORMED2');
      assert.equal(p3, 'P3');
      done();
    });

    dummy.emit('test', 'P1', 'P2', 'P3', 'P4');
  });


  it('addEvent() should work with no callback (thunk mode)', function(done) {

    var DummyWrapper = new WrapperBuilder()
      .addEvent('on')
      .addPassThrough('emit')
      .getWrapper();

    var dummy = new DummyWrapper(new EventEmitter());

    dummy.on('test')(function(err, p) {
      assert(!err);
      assert.equal(p, 'P');
      done();
    });

    dummy.emit('test', 'P');
  });


  it('addEvent() should work with no callback (thunk mode) and transformations', function(done) {

    var DummyWrapper = new WrapperBuilder()
      .addPassThrough('emit')
      .addEvent('on', {
        events: {
          test: {
            transformations: {
              0: function(p) { return p + ' TRANSFORMED1' },
              1: function(p) { return p + ' TRANSFORMED2' }
            }
          }
        }
      })
      .getWrapper();

    var dummy = new DummyWrapper(new EventEmitter());

    dummy.on('test')(function(err, p1, p2, p3) {
      assert(!err);
      assert.equal(p1, 'P1 TRANSFORMED1');
      assert.equal(p2, 'P2 TRANSFORMED2');
      assert.equal(p3, 'P3');
      done();
    });

    dummy.emit('test', 'P1', 'P2', 'P3');
  });

});
