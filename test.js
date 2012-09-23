/*
 * a new benalman.com, maybe
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * http://benalman.com/about/license/
 */

'use strict';

var fs = require('fs');
var path = require('path');

var ejs = require('ejs');
var dateformat = require('dateformat');

var Index = require('./lib/page/index').Index;

var src = '../benalman.com-content/new';
var indices = fs.readdirSync(src).map(function(dirname) {
  // console.log(dirname);
  var abspath = path.resolve(src, dirname);
  var index = new Index(abspath);
  var dest = path.resolve('./build', dirname + '.html');

  var options = Object.create(index);
  options.filename = './views/page.js';
  var html = ejs.render('<% include page %>', options);
  fs.writeFileSync(dest, html);

  return {href: dirname + '.html', meta: index.meta};
});

var options = {
  dateformat: dateformat,
  pages: indices,
  filename: './views/index.js'
};
var html = ejs.render('<% include index %>', options);
fs.writeFileSync('build/index.html', html);

// // var page = page.create('../benalman.com-content/new/jquery-throttle-debounce');
// var page = page.create('../benalman.com-content/new/iife');
// // var page = page.create('./new/');

// console.log(page.index);
// //console.log(page.documents);
// console.log(page.meta);
// console.log('title', page.meta.title);
// console.log('tags', page.meta.tags);
// page.meta.foo = 123;
// console.log('foo', page.meta.foo);

// var options = Object.create(page);
// options.filename = './views/page.js';
// var html = ejs.render('<% include page %>', options);
// // console.log(html);

// fs.writeFileSync('out.html', html);
