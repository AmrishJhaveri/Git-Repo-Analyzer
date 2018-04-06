const parseDiff=require('parse-diff');
const fs=require('fs');

var diff = fs.readFileSync('diff.txt',{encoding: 'utf8'}) // input diff string
//console.log(diff);
var files = parseDiff(diff);
console.log(files.length); // number of patched files