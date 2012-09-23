/*
 * yaml-literal-hack
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * http://benalman.com/about/license/
 */

'use strict';

var fs = require('fs');

var yaml = module.exports = require('js-yaml');

// https://github.com/nodeca/js-yaml/issues/53
var hack = function(src) {
  return String(src).split(/^\-{3}/gm).map(function(s) {
    var matches = s.match(/^\s+([\|\^].*?)\n([\s\S]*?)\n$/);
    if (!matches) { return s; }
    var literal = matches[1];
    var indented = matches[2].split('\n').map(function(s) {
      return '  ' + s;
    }).join('\n');
    return '\n__LITERALLY_AWESOME__: ' + literal + '\n' + indented + '\n';
  }).join('---');
};

var unhack = function(docs) {
  return docs.map(function(doc) {
    return doc && doc.__LITERALLY_AWESOME__ || doc;
  });
};

// This seems to do what I want it to.
yaml.parseDocs = function(src) {
  var docs = [];
  yaml.loadAll(hack(src), function(doc) {
    docs.push(doc);
  });
  return unhack(docs);
};

// So does this.
yaml.parseDocsFile = function(filepath) {
  return yaml.parseDocs(fs.readFileSync(filepath));
};
