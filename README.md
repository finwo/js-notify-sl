# finwo / notify-sl

[![npm](https://img.shields.io/npm/v/notify-sl.svg?style=flat-square)](https://npmjs.com/package/notify-sl/)
[![npm](https://img.shields.io/npm/l/notify-sl.svg?style=flat-square)](https://npmjs.com/package/notify-sl/)

Simple notification library

## Why

another notification library, you ask?

Because most don't provide a clear interface AND are theme-able with simple css.

## Installation

```
npm install --save notify-sl
```

---

## Usage

#### Browser

First, you'll need to include either of these scripts inside your page. If requirejs' `define` function was found, it will register itself under the name `notify-sl`.

```
<script type="text/javascript" src="/path/to/bower/components/notify-sl/dist/notify-sl.js"></script>
<script type="text/javascript" src="/path/to/bower/components/notify-sl/dist/notify-sl.min.js"></script>
```

After including it on your page, you can start sending notifications to your users as follows:

```
notifysl.alert(  'message', 'title', options, callback);
notifysl.confirm('message', 'title', options, callback);
notifysl.prompt( 'message', 'title', options, callback);

// For if you want more control:
notifysl.open({
  closeAll: <boolean>, // Indicates if you want to close all other notifications
  callback: <function>,
  buttons: {
    'buttonText': <value>,      // Gets the classes: btn btn-default btn-primary
    'someOtherButton': <value>, // Gets the classes: btn btn-default
  },
  timeout: <milliseconds>,
  
  // Either contents or message+title
  contents: <html, jq object, jq object array>,
  
  message: 'notification text',
  title: 'notification title'
});
```

### Node.JS

Sorry, this package is not intended for usage outside of a browser.

## Contributing

After checking the [Github issues](https://github.com/finwo/js-notify-sl/issues) and confirming that your request isn't already being worked on, feel free to spawn a new fork of the develop branch & send in a pull request.

The develop branch is merged periodically into the master after confirming it's stable, to make sure the master always contains a production-ready version.
