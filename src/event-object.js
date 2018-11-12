function(sourceObject) {
  var listeners = {};
  sourceObject = sourceObject || {};
  sourceObject.trigger = function(name, data) {
    data = ( typeof data == 'string' ) ? data : data || true;
    (listeners[name]||[]).forEach(function(callback) {
      data = data && callback(data);
    });
    return data;
  };
  sourceObject.on = function(name, callback) {
    (listeners[name]=listeners[name]||[]).push(callback);
    return sourceObject;
  };
  return sourceObject;
}
