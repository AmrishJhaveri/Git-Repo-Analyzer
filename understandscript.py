#Input: entity name
#Output: List of impacted entities

#arguments
#1: relative path of file to be analyzed
#2: entity to find impact for
#3: filename without extension
 
#from sys import argv
import understand
import subprocess

def getImpacts(a,b,c):
	#initialization of argv list of arguments
	argv=[1,2,3,4]
	argv[1] =a	#relative path of file to be analyzed
	argv[2] = b	#entity to find impact for
	argv[3] =c	#filename without extension
	#udb_path = '\\Project2'
	#language = 'java'
	project_root = '\\javaee7-sample-master'
	
	#create new Understand project for file to be analyzed
	subprocess.check_output("und create -db Temp -languages java",shell=True)
	
	#add desired file to project
	subprocess.check_output("und add -db Temp {project}".format(project=argv[1]), shell=True)
	
	#perform Understand analysis
	subprocess.check_output("und analyze Temp.udb",shell=True)
	#print("und add -db Temp {project}".format(project=argv[1]))
	#db = understand.open(".\\Project2\\CalcTest.udb")
	db = understand.open("Temp.udb")

	lineNums=[]
	#print('hey')
	fileEnts = []
	allEnts = db.ents()
	for ent in allEnts:
		#print()
		#if(ent.uniquename().startswith('jtestUnd')):
		#fileEnts.append(ent.uniquename())
		#if(ent.uniquename() == "jtestUnd.Calculator2.main.a"):
		#print(ent.name())
		#print(argv[2])
		if ent.name()==argv[2] and argv[3] in ent.uniquename():
			#print("Entity: ",ent.uniquename())
			#print("Type: ",ent.kind())
			
			#if entity has references
			if ent.refs():
				#print("\nReferences:")
				
				#iterate over dependent entities in reference of entity-in-focus
				for dep in ent.refs():
					#print()
					#print("Kind:",dep.kind())
					#print("Name:",dep.ent())
					#print("Line:",dep.line())
					
					#verify if this reference is the target entity
					if dep.kind().__str__()=='Use':
						#print('Line added: ',dep.line())
						
						#store line numbers, for later reference
						lineNums.append(dep.line())
			#break

	print()
	#for e in fileEnts:
	#	print(e)

	#initialize empty list of impacted entities
	impactList = []
	for ent in db.ents():
		#if(ent.uniquename().startswith('jtestUnd.Calculator2')):
		#print("Entity: ",ent.uniquename())
		if argv[3] not in ent.uniquename():
			continue
		for dep in ent.refs():
			if dep.kind().__str__()in ['Set','Define', 'Call'] and dep.line() in lineNums:
				#print(dep.kind(), "\t", dep.ent())
				#print(dep.ent())
				impact = dep.kind(),"\t",dep.ent()
				impactList.append(impact)

	#subprocess.check_output("pwd", shell=True)			
	#subprocess.check_output("rm Temp.udb", shell=True)			
	#db.close()
	return impactList