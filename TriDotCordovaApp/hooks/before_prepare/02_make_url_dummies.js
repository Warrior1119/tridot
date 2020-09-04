#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var rootdir = process.argv[2];

var src = "www/index.html";
var dests = [
    "www/login",
    "www/swim-profile-1",
    "www/swim-profile-2",
    "www/bike-profile",
    "www/run-profile",
    "www/support",
];

dests.forEach(function (dst) {
    deleteFolderRecursive(dst);
    createDirRecursively(dst);

    copyFile(
        src, 
        dst + '/index.html', 
        input => input.replace('<base href="./">', '<base href="/">')
    );
});

function deleteFolderRecursive(dir) {
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir).forEach((file, index) => {
        const curPath = path.join(dir, file);
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(dir);
    }
  };

function deleteFile(x) {
    if (fs.existsSync(x)) {
        fs.unlinkSync(x);
    }
}

function createDirRecursively(dir) {
    if (!fs.existsSync(dir)) {        
        createDirRecursively(path.join(dir, ".."));
        fs.mkdirSync(dir);
    }
}

function copyFile(source, target, processFunc) {
    var input = fs.readFileSync(source, 'utf8');
    fs.writeFileSync(target, processFunc ? processFunc(input) : input, {encoding: 'utf8'});
}
