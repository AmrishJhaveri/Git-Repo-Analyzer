const parseDiff=require('parse-diff');
const fs=require('fs');

var diff = fs.readFileSync('diff.txt',{encoding: 'utf8'}) // input diff string
//console.log(diff);
var files = parseDiff(diff);
console.log(files.length); // number of patched files

module.exports = 
{
	checkReplaceParameter: function(str1, str2)
	{
		//console.log('checking if parameters replaced');
		var arr1 = str1.split(/[\(\)]/);
		var arr2 = str2.split('(');

		console.log(arr1);
		console.log(arr2);
	}
};