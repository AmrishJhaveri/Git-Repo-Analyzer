**Note:**	Please view this file in a web browser.

# Git-Repo-Analyzer

Git-Repo-Analyzer automatically obtains fixes to the source code that developers performed to address bug/issue reports for software applications on Github.

## Getting Started

----------

### Prerequisites

- Node `v9.9.0`(NPM is installed with Node)
- Python `v3.6.1`
- Scitools Understand 4.0(Build 925)
- Must have registered email address with Understand license key

### Installing

1. Make sure node and npm is installed on the system. To check run the following commands from command prompt or shell.
	`node -v` and `npm -v`
2. Run `npm install` from the directory where `package.json` is present.
This will install the required modules present in `package.json` into the project directory inside `node_modules` directory.

### Starting the Application
- Run `npm start` will start the application and fetch the repository details and clone the repositories in the project directory. This will generate 2 JSON files.
	
File Name|Purpose
--|--
RequiredData.json|JSON file which contains the output of the analyzer. The structure is explained later under Output section.
RepoData.json|JSON file which contains the Github repository details. This file and its data is used for cloning the repositories.

- Run the python script which will read the `RequiredData.json` and modify it to incorporate the impact for the code changes determined by SciTools Understand.

## Process Flow
----------

![](https://bitbucket.org/ajhave5/amrish_jhaveri_chinmay_gangal_hw2/raw/master/diagrams/Process_Flow.PNG)
 
## Output

----------
The output present in RequiredData.json will have the following structure :

Attribute Name|Attribute of|Data Type|Purpose
--|--|--|--
PATTERN_ID|None|JSON Object|This identifies the type of pattern which is under consideration which can be any of `ADD_IMPORT`, `REMOVE_IMPORT`, `CHANGE_PARAMETERS`
frequency|`PATTERN_ID`|JSON Number|This provides the number of occurrences of the pattern with PATTERN_ID for the given number of repositories which were analyzed.
matches|`PATTERN_ID`|JSON Array|This array has all the data about the change which matched a particular pattern.
file|each element of `matches`|JSON String|This gives the file name in which the change can be found.
change|each element of `matches`|JSON Object|Provides details like line number, content1, content2(in case of replacement) and entity for which impact needs to be found.
ln|`change`|JSON Number|This provides the line number in the `file` at which this change is present
content1|`change`|JSON String|Provides the content of the change under consideration.
content2|`change`|JSON String|Provides the content of the change with same line number as the one under consideration.It will be present in patterns which consider replacement. If content1 is with + i.e. the content is added, then content2 is with - i.e. content is deleted and vice versa.
findImpactFor|`change`|JSON String | Provides the entity which can be used by Understand to find the impact of the change in the file.
pull_request|each element of `matches`|JSON Object|Provides the data fetched from using Github API for the pull request of the repository. It also contains the issue data fetched for the particular pull request.

Sample JSON output looks like this:

	{
		 "ADD_IMPORT": {
		    "frequency": 1208,
		    "matches": [
		      {
		        "file": "interpreter/src/test/java/com/iluwatar/interpreter/ExpressionTest.java",
		        "change": {
		          "ln": 26,
		          "content1": "+import org.junit.jupiter.api.TestInstance;",
		          "findImpactFor": "TestInstance"
		        },
		        "pull_request": {
					...
				}
			 }	
			...
			]
		}
		"CHANGE_PARAMETERS": {
	    	"frequency": 59,
		    "matches": [
		      {
		        "file": "prototype/src/main/java/com/iluwatar/prototype/App.java",
		        "change": {
		          "ln": 55,
		          "content1": "-    factory = new HeroFactoryImpl(new ElfMage(), new ElfWarlord(), new ElfBeast());",
		          "content2": "+    factory = new HeroFactoryImpl(new ElfMage(\"cooking\"), new ElfWarlord(\"cleaning\"), new ElfBeast(\"protecting\"));",
		          "findImpactFor": "    factory = new HeroFactoryImpl"
		        },
		        "pull_request": {
					...
				}
			 }	
			...
			]
		}
	}	


## Built With

----------

* [Node](https://nodejs.org/en/) - Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient.
* [Understand](https://scitools.com/static-analysis-tool/) -  Helps to quickly and easily understand and visualize complex code, perform impact analysis, and deliver powerful metrics.
* [Octokit](https://github.com/octokit/rest.js) - GitHub REST API client for Node.js

## Authors

----------

* [**Amrish Jhaveri**](https://github.com/AmrishJhaveri)
* [**Chinmay Gangal**](https://github.com/chinmay2312)