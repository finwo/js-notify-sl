(function () {
  var module = function () {
    var output = Math.floor(Math.random()*36).toString(36);
    while ( !isNaN(output)                   ) { output  = Math.floor(Math.random()*36   ).toString(36); } // First char must not be numeric
    while ( output.length < module.minLength ) { output += Math.floor(Math.random()*36*36).toString(36); } // Satisfy minimum length
    while ( document.getElementById(output)  ) { output += Math.floor(Math.random()*36*36).toString(36); } // And uniqueness
    return output;
  };
  module.minLength  = 8;
  return module;
})()
