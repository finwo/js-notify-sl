/** global: define */
/** global: Node   */
(function ( factory ) {

    // Use requirejs if possible
    if ( (typeof define === 'function') && define.amd ) {
        return define(factory);
    }

    // Export for browser/node
    this.notifysl = factory();

    // Export for file inclusions
    return this.notifysl;

})(function () {

  function hooked(obj) {
    var list = {};
    obj = obj || {};
    obj.on= function(name,fn) {
      if ('function' !== typeof fn) return obj;
      (list[name]=list[name]||[]).push(fn);
      return obj;
    };
    obj.trigger = function(name,data) {
      if(!list[name]) return data;
      data = data || true;
      var self = this;
      args = [].slice.call(arguments);
      args.shift();
      list[name].forEach(function(fn) {
        data = fn.call(self,data);
      });
      return data;
    };
    return obj;
  }

  function uid(length) {
    length = length || 8;
    var output = 0;
    while(!isNaN(output))                  output  = Math.floor(Math.random()*36).toString(36);
    while(output.length<length)            output += Math.floor(Math.random()*36).toString(36);
    while(document.getElementById(output)) output += Math.floor(Math.random()*36).toString(36);
    return output;
  }

  function getElement( tag, id ) {
    tag = tag.toUpperCase();
    var element = document.getElementById(id) || document.createElement(tag);
    element.id = id;
    document.body.appendChild(element);
    return element;
  }

  function close( notification, callback ) {
    delete notify.openNotifications[ notification.id ];
    notification.element.style.right = '-' + (notification.element.offsetWidth*2) + 'px';
    setTimeout(function() {
      notification.element.parentNode.removeChild(notification.element);
    }, notification.animationDuration || notify.animationDuration);
  }

  function getStyle( property, element ) {
    element = element ||
      document.getElementById('notify-style') ||
      (document.getElementsByClassName('card')||[])[0] ||
      (document.getElementsByClassName('main')||[])[0] ||
      (document.getElementsByClassName('form')||[])[0] ||
      document.body;
    if ( element.currentStyle ) return element.currentStyle[property];
    return document.defaultView.getComputedStyle(element)[property];
  }

  function append( element, contents ) {
    if ( Array.isArray(contents) ) { return contents.map(append.bind(null,element)); }
    if ( 'string' === typeof contents ) { return element.innerHTML += contents; }
    if ( contents instanceof Node ) { return element.appendChild(contents); }
    return false;
  }

  function on( element, event, handler ) {
    if ( Array.isArray(event) )   { return event.map(function(e) { return on(element,e,handler); }); }
    if ( Array.isArray(handler) ) { return handler.map(on.bind(null,element,event)); }
    if ( 'function' !== typeof handler ) { return false; }
    if ( element.addEventListener ) {
      return element.addEventListener(event, handler);
    } else if ( element.attachEvent ) {
      return element.attachEvent( 'on' + event, handler );
    } else {
      return false;
    }
  }

  var notify = hooked(function() {
    return notify.alert.apply(this,arguments);
  });

  // Settings
  notify.animationDuration = 250;

  // A list of all open notifications
  notify.openNotifications = {};

  // Style to overwrite in all notifications
  notify.style = {};

  // Create a new container to put all notification in
  var container = getElement( 'div', 'notify-sl-container' );
  Object.assign(container.style,{
    background: 'transparent',
    position  : 'fixed',
    right     : '0px',
    top       : '0px',
  });

  // Close all notifications
  notify.closeAll = function() {
    Object.keys(notify.openNotifications).forEach(function(key) {
      close(notify.openNotifications[key]);
    });
  };

  // Open a new notification
  notify.open = function( options ) {
    options               = notify.trigger('open',Object.assign({},options));
    var callback          = options.callback || function(){};
    var animationDuration = options.animationDuration || notify.animationDuration;

    // Close other notifications if requested
    if(options.closeAll) notify.closeAll();

    // Build everything here
    var notification                = {id:uid()};
    notification.element            = getElement('div',notification.id);
    notification.callback           = options.callback || function(){};
    notification.element.className += ' notify-sl-notification';
    notification.animationDuration  = animationDuration;

    // Make sure we can close again
    if ( (!options.buttons) && (!options.timeout) ) {
      throw new Error("Either buttons or timeout required");
    }

    // TODO: default styling
    notification.element.style.background   = getStyle('background') || '#FFF';
    notification.element.style.borderRadius = getStyle('borderRadius') || '0.2em';
    notification.element.style.boxShadow    = '0 1px 2px rgba(0,0,0,0.5)';
    notification.element.style.color        = getStyle('color') || '#222';
    notification.element.style.marginTop    = '1em';
    notification.element.style.padding      = getStyle('padding') || '1em';
    notification.element.style.position     = 'relative';

    // Add user styling
    Object.assign(notification.element,notify.style,options.style||{});

    // Add functional styling
    options.data = notify.trigger('data', options.data || {});

    // Either provided content or header/body
    if (options.contents) {
      append(notification.element,options.contents);
    } else {
      var title   = document.createElement('h2');
      var message = document.createElement('p');
      append(title  ,document.createTextNode(notify.trigger('locale',options.title  ||'')));
      append(message,document.createTextNode(notify.trigger('locale',options.message||'')));
      title.style.marginTop = 0;
      title.style.paddingTop = 0;
      message.style.marginBottom = 0;
      message.style.paddingBottom = 0;
      if (title.innerHTML  ) append(notification.element,title  );
      if (message.innerHTML) append(notification.element,message);
    }

    // Handle buttons
    if (options.buttons) {
      var firstButton = true;
      Object.keys(options.buttons).forEach(function(key) {
        var btn  = document.createElement('button');
        btn.className = 'btn btn-default';
        if (firstButton) { btn.className += ' btn-primary'; firstButton = false; }
        btn.innerText = notify.trigger('locale',key);
        btn.value     = options.buttons[key];
        if (!options.contents) btn.style.marginTop = '1em';
        append(notification.element,btn);
        on(btn,'click',[
          callback.bind(null,options.buttons[key]),
          close.bind(null,notification),
        ]);
      });
    }

    // Add
    append(container,notification.element);
    notify.openNotifications[notification.id] = notification;

    // Animate into view
    notification.element.style.right      = '-' + (notification.element.offsetWidth*2) + 'px';
    notification.element.style.transition = 'right ' + animationDuration + 'ms ease';
    setTimeout(function () {
      notification.element.style.right = '1em';
      if ( options.timeout ) {
        setTimeout(function() {
          close(notification, callback.bind(null, 'timeout'));
        }, options.timeout + animationDuration);
      }
    }, 10);

  };

  // Open a new alert-style notification
  notify.alert = function( message, title, data, callback ) {
    data = data || {};
    if ('function' === typeof data) {
      callback = data;
      data     = {};
    }
    return notify.open({
      animationDuration: data.animationDuration || notify.animationDuration,
      closeAll         : false,
      buttons          : data.timeout || (data.buttons || { 'labels.ok': true }),
      title            : title,
      message          : message,
      callback         : callback,
      data             : data,
      timeout          : data.timeout || 0,
    });
  };


  // Open a new confirm-style notification
  notify.confirm = function(message, title, data, callback) {
    data = data || {};
    if ('function' === typeof data) {
      callback = data;
      data     = {};
    }
    return notify.open({
      animationDuration: data.animationDuration || notify.animationDuration,
      closeAll         : false,
      buttons          : data.buttons || { 'labels.ok': true, 'labels.cancel': false },
      title            : title,
      message          : message,
      callback         : callback,
      data             : data,
    });
  };

  notify.prompt = function(message, title, data, callback) {
    data = data || {};
    if ('function' === typeof data) {
      callback = data;
      data     = {};
    }

    var contents = [];

    var elTitle   = document.createElement('h2');
    var elMessage = document.createElement('p');
    append(elTitle  ,document.createTextNode(notify.trigger('locale',title  ||'')));
    append(elMessage,document.createTextNode(notify.trigger('locale',message||'')));

    var elForm  = document.createElement('form');
    var elInput = document.createElement('input');
    elForm.setAttribute('onsubmit','return false;');
    Object.keys(data).forEach(function(key) {
      elInput.setAttribute(key,data[key]);
    });
    elInput.setAttribute('name','prompt');
    append(elForm,elInput);

    if (elTitle.innerHTML  ) contents.push(elTitle  );
    if (elMessage.innerHTML) contents.push(elMessage);
    contents.push(elForm);

    return notify.open({
      animationDuration: data.animationDuration || notify.animationDuration,
      closeAll         : true,
      buttons          : data.buttons || {'labels.ok':true,'labels.cancel':false},
      contents         : contents,
      data             : data,
      callback         : function(value) {
        if (value) callback(elInput.value);
        else callback(false);
        return !!value;
      }
    });
  };

  // Return our module
  return notify;
});
