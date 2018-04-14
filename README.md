**Note:**	Please view this file in a web browser.

# Git-Repo-Analyzer

Git-Repo-Analyzer automatically obtains fixes to the source code that developers performed to address bug/issue reports for software applications on Github.

## Process Flow
----------
1. Query the GitHub API for getting the repository meta data based on search parameters. 
2. 

## Getting Started

----------

### Prerequisites

- Node `v9.9.0`
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


## Output

----------
The output present in RequiredData.json will have the following structure :

Attribute Name|Attribute of|Data Type|Purpose
--|--|--|--
PATTERN_ID|None|JSON Object|This identifies the type of pattern which is under consideration which can be any of `ADD_IMPORT`, `REMOVE_IMPORT`, `CHANGED_PARAMETERS`
frequency|`PATTERN_ID`|JSON Number|This provides the number of occurrences of the pattern with PATTERN_ID for the given number of repositories which were analyzed.
matches|`PATTERN_ID`|JSON Array|This array has all the data about the change which matched a particular pattern.
file|each element of `matches`|JSON String|This gives the file name in which the change can be found.
change|each element of `matches`|JSON Object|Provides details like line number, content1, content2(in case of replacement) and entity for which impact needs to be found.
ln|`change`|JSON Number|This provides the line number in the `file` at which this change is present
content1|`change`|JSON String|Provides the content of the change under consideration.


## Simple Happy Flow

----------


## Running the tests

----------


## Future Work

----------
- Customized Understand reports for project metrics


## Built With

----------

* [Node](https://nodejs.org/en/) - Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient.
* [Understand](https://scitools.com/static-analysis-tool/) -  Helps to quickly and easily understand and visualize complex code, perform impact analysis, and deliver powerful metrics.

## Authors

----------

* [**Amrish Jhaveri**](https://github.com/AmrishJhaveri)
* [**Chinmay Gangal**](https://github.com/chinmay2312)