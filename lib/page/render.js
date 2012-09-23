/*
 * a new benalman.com, maybe
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * http://benalman.com/about/license/
 */

'use strict';

var path = require('path');
var fs = require('fs');

var ghm = require('github-flavored-markdown');
var ejs = require('ejs');

// Create a hyphenated slug from an arbitrary title string. (TODO: transliteration?)
var slugify = function(str) {
  return str.replace(/\W+/g, '-').replace(/^-|-$/g, '').toLowerCase();
};

// Build the TOC from the page content markdown.
var buildToc = function() {
  exports._toc = [];
  exports.raw = exports.raw.replace(/^(#+)\s+(.*)/gm, function(str, header, title) {
    exports._toc.push({title: title, depth: header.length});
    return header + ' <a name="' + slugify(title) + '"></a>' + title;
  });
};

exports.render = function(page, part) {
  exports.page = page;
  exports.meta = page.meta;
  exports.raw = page[part];

  buildToc();

  // Render page content as EJS template.
  var result = ejs.render(exports.raw, exports);
  // Parse result as GitHub-flavored-markdown.
  result = ghm.parse(result, exports.page.meta.github);

  return result;
};

var define = Object.defineProperty.bind(null, exports);

define('_toc', {writable: true, configurable: true});

// Render the TOC.
define('toc', {
  enumerable: true,
  get: function() {
    var fn = function(options) {
      if (!options) { options = {}; }
      return exports._toc.map(function(item) {
        var md = '';
        if (!options.flatten) {
          md += new Array(item.depth).join('  ');
        }
        md += '* [' + item.title + '](#' + slugify(item.title) + ')';
        return md;
      }).join('\n');
    };
    // If the function is accessed as `toc` it will be coerced to a string
    // by calling `toc()`.
    fn.toString = fn;
    // But it can be also called as `toc({...})` with options!
    return fn;
  },
});

var includer = function(filepath, options) {
  if (!options) { options = {}; }
  if (!options.type) {
    options.type = path.extname(filepath).replace(/^\./, '');
  }
  options.filepath = filepath;
  options.abspath = path.resolve(exports.page.basepath, filepath);
  return this(options);
};

// Source code.
exports.source = includer.bind(function(options) {
  var syntax = options.syntax || options.type;
  return '```' + syntax + '\n' + fs.readFileSync(options.abspath) + '\n```';
});

// Image.
exports.image = includer.bind(function(options) {
  var alt = options.alt || '';
  return '![' + alt + '](' + options.abspath + ')\n';
});

// Flickr photo.
exports.flickr = function(url/*, context*/) {
  return '![](' + url + ')\n';
};

// Soundcloud player.
exports.soundcloud = function(options) {
  return '[SOUNDCLOUD FIX ME](' + options.filepath + ')\n';
};

// Other file types.
exports.file = includer.bind(function(options) {
  var method = exports.file[options.type];
  if (method) {
    return method(options);
  } else {
    return 'Render error: File type "' + options.type + '" not found.';
  }
});

