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
		var arr2 = str2.split(/[\(\)]/);

		console.log(arr1);
		console.log(arr2);

		//console.log(arr1 == arr2);
		if(arr1[0]!=arr2[0])
			return false;

		if (arr1.every(function(u, i){return u === arr2[i];})	) 
			return true
		else
			return false
	}
};