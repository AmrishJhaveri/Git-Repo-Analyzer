# Git-Repo-Analyzer

Git-Repo-Analyzer automatically obtains fixes to the source code that developers performed to address bug/issue reports for software applications on Github.

## Salient Features

----------

-  Multiple HTTP requests can be processed in parallel with Node.js non-blocking I/O model.

## Process Flow
----------
1. Query the GitHub API for getting the repository meta data based on search parameters. 
2. 

## Getting Started

----------

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 

### Prerequisites

- System must have Docker installed
- Docker must not have any running containers. Also there must be no stopped/exited containers with the name "jenkins" or "gitlab"
- Github repository must be of "master" branch
- Must have registered email address with Understand license key

### Installing

There are 2 ways to install this:

- **Automatically by script provided**


	1. Download entire project zip of `Amrish_Jhaveri_Chinmay_Gangal_hw1_CS540` and extract all contents
	2. If my-jenkins_home.tgz is not present inside `DockerImages/Jenkins/` then only download the file from this location : [Jenkins_home](https://drive.google.com/file/d/1yi8tRf4TkfdWijsg37Au_vhKKN0MFfud/view?usp=sharing) and place it in `DockerImages\Jenkins` inside the above extracted project.
	3.	In Docker terminal, go to the path of the parent directory of the above extracted structure.
	4. Run the setup file using the command: 
		
		```
		./install_script.sh
		``` 
	
	This should get everything setup automatically in a few minutes.   

	If there is an existing gitlab image `gitlab/gitlab:9.1.0-ce.0`, this would expedite the setup. Otherwise the setup file would download it directly.


- **Manually**

	Refer to the [Installation_Config.md](https://bitbucket.org/ajhave5/amrish_jhaveri_chinmay_gangal_hw1_cs540/src/master/Installation_Config.md?at=master&fileviewer=file-view-default) file for detailed steps regarding manual installation

To verify installation, do the following:

- In Docker terminal, type `docker-machine ip` to know the IP address of your Docker virtual machine. This is your <docker-ip>
- Go to your browser, and access the url in this format: `<docker-ip>:9080`, then use credentias provided below to login. This should lead you to the Jenkins homepage, where you would see 1 job created: "Git\_to\_Gitlab"

	![Jenkins_Home](https://bitbucket.org/ajhave5/amrish_jhaveri_chinmay_gangal_hw1_CS540/raw/master/images/sr_1.JPG)

- Also open another url in this format: `<docker-ip>:30080`. This should lead you to the Gitlab homepage. Login with credentials specified below

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

* [Docker](https://www.docker.com/) - Serves as platform for various application containers
* [Jenkins](https://jenkins.io/) - Server to automate building, testing and deploying software
* [GitLab](https://about.gitlab.com/) - fully featured Git Server which can be installed on your system. 
* [Understand](https://scitools.com/features/) - Tool for static code analysis
* [Redis](https://redis.io/) - In-memory data structure support for database & cache
* [JGit](https://www.eclipse.org/jgit/) - Java API for GIT commands

## Authors

----------

* [**Amrish Jhaveri**](https://github.com/AmrishJhaveri)
* [**Chinmay Gangal**](https://github.com/chinmay2312)