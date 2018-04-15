import json
import understandscript as undScr
import os

repoData = json.load(open('RepoData.json'))
repoName = repoData["iluwatar/java-design-patterns"]['name']

changeData = json.load(open('RequiredData.json'))

matches = changeData["REMOVE_IMPORT"]["matches"]

for match in matches:

	#prepare arguments to be passed to understandscript
	change = match["change"]
	relPath = repoName + "/" + match['file']
	fileName = relPath.split("/")[-1]
	fName = fileName.split(".")[0]
	targetEnt = match["change"]["findImpactFor"]
	
	#op=[]
	try:
		op = undScr.getImpacts(relPath,targetEnt,fileName)
	except:
		continue
	#op = os.system("python .\understandscript.py {filePath} {targEnt} {fileName}".format(filePath=relPath,targEnt=targetEnt, fileName=fileName))
	if op:
		print(targetEnt,"\t",op)