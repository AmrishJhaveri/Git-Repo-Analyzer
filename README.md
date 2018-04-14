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
- Must have registered email address with Understand license key

### Installing

1. Make sure node and npm is installed on the system. To check run the following commands from command prompt or shell.
	`node -v` and `npm -v`
2. Run `npm install` from the directory where `package.json` is present.
This will install the required modules present in `package.json` into the project directory inside `node_modules` directory.

### Starting the Application
1. Run `npm start` will start the application and fetch the repository details and clone the repositories in the project directory. This will generate 2 JSON files.

File Name|Purpose
--|--
RequiredData.json|xyz
RepoData.json|abc


2. Run the python script which will read the `RequiredData.json`.

### Credentials

System|Username|Password
---	|	---	|	---
Jenkins|admin|	`123456789`
Gitlab|root	|`123456789`

## Sample Run and Output

----------

For a sample run and the screenshots of the output, you can open the following link: 
>[**Screenshots**](https://bitbucket.org/ajhave5/amrish_jhaveri_chinmay_gangal_hw1_cs540/src/master/Sample_run_&_output_screenshots.md?at=master&fileviewer=file-view-default)

## Changing Configuration

----------
1.	Number of projects to be downloaded can be configured inside Jenkins 	Git_to_Gitlab Job shell configuration.

	`java -jar CloneRepo.jar 3 ./java-full-data.json ../output-project-names.json ../output-repo-issue-links.json ../`	
	
	The parameter 3 can be changed to -1 to download all the repos present in the json downloaded from Github API i.e. 30.

2. The URL for downloading the projects from Github can be customized:
	
	`curl -H "Content-Type:application/json" "https://api.github.com/search/repositories?q=maven%20language:$LANGUAGE+license:mit+size:%3C=10000&type=Repositories&sort=stars&order=desc" > java-full-data.json`

	This downloades the project metadata in json format for a Maven project with Java as a language, license as MIT and size <= 10MB.
	
	Change the URL accoridng to your needs.

## Issues

----------
- Must wait for a few minutes for GitLab server to be up & ready
- IP address conflict for containers.
	
	It is assumed that there are no running containers, hence the IPs `172.17.0.2`, `172.17.0.3` and `172.17.0.4` would not be allocated to any container. These would be used by the Jenkins, GitLab and Redis containers respectively.

## Running the tests

----------
1.  Jacoco reports for Maven projects downloaded from Github is present inside 	the Project specific Jenkins Job.
2.  Understand reports can be seen in the console of the jenkins project build as 	described.
3.  For Java projects used for cloning and finding re-test components, Jacoco 	Coverage can be found at
	1.  [My-Jgit-Project](https://bitbucket.org/ajhave5/amrish_jhaveri_chinmay_gangal_hw1_cs540/raw/master/MyJGitProject/Testing_output/Jacoco_HTML/)
	2.  [Git-Retest](https://bitbucket.org/ajhave5/amrish_jhaveri_chinmay_gangal_hw1_cs540/raw/master/GitRetest/cs540.hw1.gitRetest/Testing_output/Jacoco_HTML/)
	
	Open the location ProjectName/Testing_output/Jacoco_HTML/

## Future Work

----------
- Customized Understand reports for project metrics
- Expand number of repositories retrieved from GitHub by Pagination with GitHub 	API. 

	Currently, a maximum of 30 projects can be fetched from GitHub in a single API call. To increase this size, pagination would have to be incorporated.
- Trigger issue storage of Redis on every commit instead of one-time.
	
	The existing mechanism triggers issue storage on Redis database only on the 1st build after the setup.

- Assigning dynamic container IP for GitLab
	
	The current version allocates specific IP `172.17.0.3` for GitLab. Instead, this would be assigned dynamically based on IP availability depending on any other running containers.

## Built With

----------

* [Node](https://nodejs.org/en/) - Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient.


## Authors

----------

* [**Amrish Jhaveri**](https://github.com/AmrishJhaveri)
* [**Chinmay Gangal**](https://github.com/chinmay2312)