
function Dummy(cp) {
  this._cp = cp;
}

Dummy.prototype.doNoParams = function(callback) {
  var self = this;

  setTimeout(function() {
    var res = self._cp;
    callback(null, res);
  }, 1);
}

Dummy.prototype.doWithMultipleResults = function(callback) {
  var self = this;

  setTimeout(function() {
    callback(null, 'RES1', 'RES2');
  }, 1);
}

Dummy.prototype.doWithParams = function(p1, p2, callback) {
  var self = this;

  setTimeout(function() {
    var res = p1 + ' ' + p2 + ' ' + self._cp;
    callback(null, res);
  }, 1);
}

Dummy.prototype.doNoCallback = function(p) {
  return this._cp + ' ' + p;
}

Dummy.prototype.doNoCallbackNoParams = function() {
  return this._cp;
}

Dummy.prototype.doBiMode = function(p, callback) {

  // Sync mode
  if(!callback) {
    return 'SYNC ' + p;
  }

  // Async mode
  setTimeout(function() {
    callback(null, 'ASYNC ' + p);
  }, 1);
}

exports.Dummy = Dummy;
