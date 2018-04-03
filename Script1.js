const fs = require('fs');
var jsonFileElements = fs.readFileSync('diff.json');
//console.log(JSON.parse(contents)[0].chunks);

JSON.parse(jsonFileElements).forEach(function(jsonFileElement){ //loop for repo
	var chunks = jsonFileElement.chunks;
	//console.log(chunks);

	chunks.forEach(function(chunk){ //loop for file
		var changes = chunk.changes;
		//console.log(changes);

		changes.forEach(function(change){

			if(change.type == "normal")
				return;

			var content = change.content;
			//console.log(content);
			
			var cont = JSON.stringify(content);
			console.log(JSON.stringify(content));
			var patts = fs.readFileSync('patterns.json');
			JSON.parse(patts).forEach(function(patt){ //loop for pattern recognition
				var regex = RegExp(patt.rgex);
				if(regex.test(cont))
				{
					console.log("found "+patt.id);
				}
			});
			//var regex = RegExp(JSON.parse(patts)[0].rgex);
			//var regex = RegExp('[+-][ ]*mockSettings\.name\(.*\)');
			//var regex =^[+-][ ]*mockSettings\.name\(.*\) ;
			//var matched = cont.match(/[+-][ ]*mockSettings\.name\(/g);
			//if(matched != null)
			//if(regex.test(cont))
				//console.log("found");
		});
	});

	console.log("\n");
});