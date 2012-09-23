/*
 * a new benalman.com, maybe
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * http://benalman.com/about/license/
 */

'use strict';

var path = require('path');
var yaml = require('../yaml-literal-hack');
var render = require('./render');

var Index = exports.Index = function(basepath) {
  this.basepath = path.resolve(basepath);
};

Index.prototype.toString = function() {
  return '<<Index:' + (this.meta && this.meta.title || this.basepath) + '>>';
};

// The index filepath.
Object.defineProperty(Index.prototype, 'index', {
  enumerable: true,
  get: function() {
    return path.resolve(this.basepath, 'index.md');
  },
});

// An array of parsed YAML documents.
Object.defineProperties(Index.prototype, {
  _documents: {
    writable: true,
    configurable: true,
  },
  documents: {
    enumerable: true,
    get: function() {
      if (!this._documents) {
        this._documents = yaml.parseDocsFile(this.index);
      }
      return this._documents;
    },
  },
});

// Metadata from the first YAML document that's an object, otherwise
// an empty object.
Object.defineProperties(Index.prototype, {
  _meta: {
    writable: true,
    configurable: true,
  },
  meta: {
    enumerable: true,
    get: function() {
      var i;
      if (!this._meta) {
        this._meta = {};
        for (i = 0; i < this.documents.length; i++) {
          if (this.documents[i] instanceof Object) {
            this._meta = this.documents[i];
            break;
          }
        }
      }
      return this._meta;
    },
  },
});

// An array of all YAML documents that are strings.
Object.defineProperty(Index.prototype, 'contents', {
  enumerable: true,
  get: function() {
    return this.documents.filter(function(document) {
      return typeof document === 'string';
    });
  },
});

// All content, concatenated together.
Object.defineProperty(Index.prototype, 'content', {
  enumerable: true,
  get: function() {
    return this.contents.join('\n');
  },
});

// Excerpt. first string YAML doc, if there are multiples, otherwise an
// empty string (TODO: grab first N chars from body?)
Object.defineProperty(Index.prototype, 'excerpt', {
  enumerable: true,
  get: function() {
    return this.contents.length > 1 ? this.contents[0] : '';
  },
});

// Body content. first string YAML doc, if there is only one, otherwise
// all but the first joined.
Object.defineProperty(Index.prototype, 'body', {
  enumerable: true,
  get: function() {
    return this.contents.length === 1 ? this.contents[0] : this.contents.slice(1).join('\n');
  },
});

// Render content.
Index.prototype.render = function(part) {
  return render.render(this, part);
};
