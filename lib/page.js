/*
 * a new benalman.com, maybe
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * http://benalman.com/about/license/
 */

'use strict';

var path = require('path');
var yaml = require('./yaml');
var render = require('./render');

exports.Page = function(basepath) {
  this.basepath = path.resolve(basepath);
};

exports.create = function(basepath) {
  return new exports.Page(basepath);
};

exports.Page.prototype.toString = function() {
  return '<<PAGE:' + (this.meta && this.meta.title || this.basepath) + '>>';
};

var define = Object.defineProperty.bind(null, exports.Page.prototype);

// The index filepath.
define('index', {
  enumerable: true,
  get: function() {
    return path.resolve(this.basepath, 'index.md');
  },
});

// An array of parsed YAML documents.
define('_documents', {writable: true, configurable: true});
define('documents', {
  enumerable: true,
  get: function() {
    if (!this._documents) {
      this._documents = yaml.parseDocsFile(this.index);
    }
    return this._documents;
  },
});

// Metadata from the first YAML document that's an object, otherwise
// an empty object.
define('_meta', {writable: true, configurable: true});
define('meta', {
  enumerable: true,
  get: function() {
    var i;
    if (!this._meta) {
      this._meta = {};
      for (i = 0; i < this.documents.length; i++) {
        if (this.documents[i] instanceof Object) {
          this._meta = this.documents[i];
        }
      }
    }
    return this._meta;
  },
});

// Content from the first YAML document that's a string, otherwise
// an empty string.
define('_content', {writable: true, configurable: true});
define('content', {
  enumerable: true,
  get: function() {
    var i;
    if (!this._content) {
      this._content = '';
      for (i = 0; i < this.documents.length; i++) {
        if (typeof this.documents[i] === 'string') {
          this._content = this.documents[i];
        }
      }
    }
    return this._content;
  },
});

define('rendered', {
  enumerable: true,
  get: function() {
    return render.render(this);
  },
});
