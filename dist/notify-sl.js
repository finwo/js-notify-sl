(function ( factory, exports ) {
  
  // Use requirejs if possible
  if((typeof define == 'function') && define.amd ) {
    return define('notify-sl', ['jquery'], factory);
  }
  
  // Try to fetch jquery
  var jq = window.$ || window.jQuery;
  
  // We really need it
  if (!jq) {
    throw new Error("jQuery is required for notify-sl");
  }

  // Let's export it the normal way
  exports.notifysl = factory(jq);
  
})(function ( $ ) {
  
  // Generates a unique ID on the page
  var uniqueId        = function () {
    var output = '0';
    while ( !isNaN(output) )                     output  = uniqueId.randomChar(); // First char must not be numeric
    while ( output.length < uniqueId.minLength ) output += uniqueId.randomChar(); // Satisfy minimum length
    while ( document.getElementById(output) )    output += uniqueId.randomChar(); // And uniqueness
    return output;
  };
  uniqueId.randomChar = function () {
    return uniqueId.alphabet.charAt(Math.round(Math.random() * (uniqueId.alphabet.length - 1)));
  };
  uniqueId.minLength  = 8;
  uniqueId.alphabet   = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  
  // Allow attaching events to almost any object
  var eventObject = function(sourceObject) {
    var listeners = {};
    sourceObject = sourceObject || {};
    sourceObject.trigger = function(name, data) {
      data = data || true;
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
  };
  
  // Our module
  var notify = eventObject(function () {
    return notify.open.apply(null, arguments);
  });
  
  notify.animateDuration = 250;
  notify.openBoxes = {};
  notify.style          = {
    'background': document.body.style.background || '#1f1d1d',
    'border'    : '1px solid #292929',
    'color'     : '#FFF',
    'padding'   : '1em',
    'top'       : '1em',
    'max-width' : '50%',
    'position'  : 'fixed',
    'z-index'   : 1060
  };
  
  // Close a single notification
  function close( box, callback ) {
    delete notify.openBoxes[ box.id ];
    $(box).css({ right: -box.offsetWidth });
    setTimeout(function () {
      if ( typeof box.dataset.cb == 'function' ) {
        box.dataset.cb(false);
      }
      if ( box.parentNode ) {
        box.parentNode.removeChild(box);
      }
      if ( typeof callback === 'function' ) {
        callback();
      }
    }, notify.animateDuration);
  }
  
  // Close all notifications
  notify.closeAll = function () {
    Object.keys(notify.openBoxes).forEach(function ( key ) {
      close(notify.openBoxes[ key ]);
    });
  };
  
  // Open a notification
  notify.open = function ( options ) {
    
    options = notify.trigger('open', options);
    
    if ( options.closeAll ) {
      notify.closeAll();
    }
    
    var box      = document.createElement("div"),
        $box     = $(box),
        callback = options.callback || function () {};
    
    box.id         = uniqueId();
    box.dataset.cb = callback;
    $box.addClass('notify-box');
    
    // Make sure we can close again
    if ( !options.buttons && !options.timeout ) {
      throw new Error("Either buttons or timeout required");
    }
    
    // Run some styling on the box
    $box.css(notify.style);
    if ( options.style ) {
      $box.css(options.style);
    }
    
    // Either provided contents or texts
    if ( options.contents ) {
      $box.append(options.contents);
    } else {
      // Build title/message structure
      var title    = document.createElement("h2"),
          message  = document.createElement("p"),
          $title   = $(title),
          $message = $(message);
      //translate sentence
      $title.text(notify.trigger('locale',options.title || ""));
      $message.text(notify.trigger('locale',options.message || ""));
      $title.css({marginTop:'0'});
      // Append message to notification box
      if ($title.text().length)   $box.append($title);
      if ($message.text().length) $box.append($message);
    }
    
    // Handle buttons
    if ( options.buttons ) {
      var firstButton = true;
      $.each(options.buttons, function ( text, value ) {
        var $button = $(document.createElement("button"));
        
        //translate sentence
        $button
          .addClass('btn')
          .addClass('btn-default')
          .text(notify.trigger('locale',text));
        
        if (firstButton) {
          $button.addClass('btn-primary');
          firstButton = false;
        }
        
        // Attach callbacks
        $button
          .on('click', callback.bind(null, value))
          .on('click', function () {
            box.dataset.cb = '';
            close(box);
          });
        $box.append($button);
      });
    }
    
    // Let's show the box
    document.body.appendChild(box);
    notify.openBoxes[ box.id ] = box;
    
    // Animate into view
    $box
      .css({ left: '-100%' })
      .css({ left: '', right: -box.offsetWidth })
      .css({ transition: 'right ' + animateDuration + 'ms ease' });
    setTimeout(function () {
      $box.css({ right: '1em' })
        .each(function () {
          if ( options.timeout ) {
            setTimeout(function () {
              close(box, callback.bind(null, 'timeout'));
            }, options.timeout)
          }
        })
    }, 10);
  };
  
  // A simple alert
  notify.alert = function ( message, title, data, callback ) {
    
    if ( typeof data == 'function' ) {
      callback = data;
      data     = {};
    }
    
    data = data || {};
    
    notify({
      closeAll: true,
      buttons : data.timeout && {} || { ok: true },
      title   : title,
      message : message,
      callback: callback,
      data    : data,
      timeout : data.timeout || 0
    });
  };
  
  // Confirm... Yes or no
  notify.confirm = function ( message, title, data, callback ) {
    
    if ( typeof data == 'function' ) {
      callback = data;
      data     = {};
    }
    
    data = data || {};
    
    notify.open({
      closeAll: true,
      buttons : { 'labels.ok': true, 'labels.cancel': false },
      title   : title,
      message : message,
      callback: callback,
      data    : data
    });
  };
  
  notify.prompt = function ( message, title, data, callback ) {
    
    if ( typeof data == 'function' ) {
      callback = data;
      data     = {};
    }
    
    data = data || {};
    
    // We'll make this worth our while
    var contents = [];
    
    var $title   = $("<h2></h2>"),
        $message = $("<p></p>");
    $title.text(notify.trigger('locale',title || ''));
    $message.text(notify.trigger('locale',message || ''));
    
    var $form  = $("<form onsubmit='return false;'></form>");
    var $input = $('<input/>');
    Object.keys(data).forEach(function ( key ) {
      $input.prop(key, data[ key ]);
    });
    $input.prop('name', 'prompt');
    $form.addClass('');
    $form.append($input);
    
    if($title.text().length)   contents.push($title);
    if($message.text().length) contents.push($message);
    contents.push($form);
    
    notify.open({
      closeAll: true,
      buttons : { 'ok': true, 'cancel': false },
      contents: contents,
      callback: function ( value ) {
        if ( value ) {
          callback($input.val());
          return true;
        }
        callback(false);
        return true;
      },
      data    : data
    });
    
  };
  
  
  // Return our module
  return notify;
}, typeof exports === 'object' ? exports : this);
