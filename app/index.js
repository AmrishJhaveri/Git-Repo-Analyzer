// NPM module for GitHub Api
const octokit = require('@octokit/rest')();

// NPM module(Node internal) for file reading & writing operations
const fs = require('fs');

// NPM module for easy to use utility functions of String, Array
const _ = require('lodash');

// NPM module for HTTP request
const axios = require('axios');

// NPM module for parsing the diff file of pull request and provide it in a eaasy to use form
const parse = require('parse-diff');

// NPM module(Node internal) for promise utility use with old JS functions
const util = require('util');

// NPM module(Node internal) for creating child process for executing shell commands.
const exec = util.promisify(require('child_process').exec);

// RequiredData.js file providing a array with add,set,get methods. 
//Used to store the required data in JS object form.
// const reqData = require('./RequiredData');

// Pattern.js which is responsible of detecting patterns and providing the output in the required JS object form.
const pattern = require('./Pattern');

// All valid pattern matches found are stored in JS object form in this array.
let finalJSONResult = [];

// Info about the repositories for which the pull requests are used is stored in this object. 
// This is later used to clone the repos.
let repoMap = {};

// Github Personal Access Token. Only Read access to public repos is provided with this token.
const accessToken = '76a1e4c56ede658b7bd1241ccfb51d6c5511f289';
// Token setup for Octokit to increase the read limit to 5000 requests every hour.
octokit.authenticate({
    type: 'token',
    token: accessToken
})

/**
 *  Constants for the file names.
 *  RepoData.json contains the repository details for analyzed pull requests.
 *  RequiredData.json contains the output of the analyzer with details of the patterns found and there occurences.
 */
var CONSTANTS = {
    REQUIRED_DATA_JSON: './RequiredData.json',
    REPO_DATA_JSON: './RepoData.json'
};

/**
 * This generates the JS object with the search parameters(q), sorting parameter(sort), 
 * ordering of result(order), page number of result(page), and no of requests per page(per_page).
 * This object is the input for octokit.search.repos.
 * 
 * @param {*} page_no page number of the search query to be considered for finding the repos
 */
function getParams(page_no) {
    // Search Java language projects with MIT license
    let q_param = "language:java license:mit";
    // let q_param = "mock language:java license:mit";
    // Sort by the stars of the Github project
    let sort_param = 'stars';
    // Order in descending order
    let order_param = 'desc';
    // Get 5 projects from this page
    let per_page_number = 1;

    return params = {
        q: q_param,
        sort: sort_param,
        order: order_param,
        page: page_no,
        per_page: per_page_number
    }
};

/**
 * Async function to fetch the repo data based on the input provided by getParams().
 * Uses octokit.search.repos to fetch the required repositories.
 * Await is used to wait till the repo result is available. 
 * Once available then only fetch the pull requests data of each repo.
 */
async function getRepoData() {
    try {
        // Make a HTTP call to fetch the Repo details using Octokit Git Api. 
        // Wait till the data is available.
        const result_data = await octokit.search.repos(getParams(1));
        console.log('after getRepoData()');


        //Once all the data is received, get the pull request data for each repo using pulls_url attribute.
        await getPullRequestsForRepos(result_data);
    }
    catch (e) {
        console.log(e);
    }
}

/**
 * Iterates over each repo , and calls the function getAndConvertData().
 * Once all the promises are resolved, it process the finalJSONResult array to get the required analyzer output.
 * Converts to string using JSON utility and writes synchronously into file RequiredData.json
 * The console.time and console.timeEnd are used to calculate the time taken for the entire operation.
 * repoMap is converted to string and written synchronously to RepoData.json
 * Once data is written to file, we clone the repos found in repoMap.
 * 
 * @param {*} repoDetails Repo details obtained from getRepoData()
 */
async function getPullRequestsForRepos(repoDetails) {
    //Start the timer for getAllPullRequests.
    console.time('getPullRequestsForRepos');
    // console.log('In getAllPullRequests'+JSON.stringify(repoDetails.data.items,undefined,2));
    //Iterate over each repo data object and call the function getAndConvertData()
    //Returns an array of promises
    const promises = repoDetails.data.items.map(getAndConvertData);
    //Wait till all promises are resolved.
    await Promise.all(promises);

    console.log('After iterating all the elements');

    //Create required output format from finalJSONResult, convert to string(with indent of 2 spaces) and write synchronously to file RequiredData.json.
    fs.writeFileSync(CONSTANTS.REQUIRED_DATA_JSON, JSON.stringify(await processFinalJSON(finalJSONResult), undefined, 2));
    //convert to string(with indent of 2 spaces) and write synchronously to file RepoData.json.
    fs.writeFileSync(CONSTANTS.REPO_DATA_JSON, JSON.stringify(repoMap, undefined, 2))

    //End the timer for getAllPullRequests.
    console.timeEnd('getPullRequestsForRepos');

    //start the timer for cloneRepos
    console.time('cloneRepos');
    // call the function which clones the repos in the repoMap. Wait till all the repos are cloned.
    // await cloneRepos();
    //end the timer for cloneRepos
    console.timeEnd('cloneRepos');

}

/**
 * This function is called for each repo object. The repo object and index(position) is passed to the function.
 * We add the repo details to the repoMap.
 * We need to fetch all(30 or max available pull requests) pull requests by calling getAllPullRequests function and passing owner name and repo name.
 * Wait till all the promises from getAllPullRequests() get fulfilled.
 * 
 * @param {*} element metadata of one repo.
 * @param {*} index position in the array of repo objects
 */
async function getAndConvertData(element, index) {

    // add the repo detail to repoMap(global data structure) with details like id, repo name, owner name and url.
    repoMap[element.full_name] = {
        id: element.id,
        name: element.name,
        owner: element.owner.login,
        url: element.html_url
    }

    //Wait till all pull requests are fetched with owner name and repo name.
    await getAllPullRequests(element.owner.login, element.name);
    console.log('after pull request call:' + index);
}

/**
 * This function gets the first 30 closed pull requests for the given owner name and repo name.
 * Waits till all the pull requests metadata is received and then process each pull request by calling function processEachPull().
 * @param {*} data_owner owner name of the repo for which pull requests need to be fetched
 * @param {*} data_name repo name
 */
async function getAllPullRequests(data_owner, data_name) {
    try {
        //Fetch first 30(or less) pull requests for given owner name and repo name.
        let resultant_pull_requests = await octokit.pullRequests.getAll({ owner: data_owner, repo: data_name, state: 'closed' });
        console.log('No. of pull requests:' + resultant_pull_requests.data.length + ' of repo:' + data_name);

        //process each pull request and call the function processEachPull
        const promises = resultant_pull_requests.data.map(processEachPull);
        
        //wait till all promises are fulfilled.
        await Promise.all(promises);

        console.log('After each diff captured for the repo');
        // return resultant_pull_requests;
    }
    catch (e) {
        console.log(e);
    }
}

/**
 * This function gets the issue data and diff file from the urls present in the pull request object.
 * Using the parse function of the parse-diff npm module, the diff data is converted into a suitable JSON format.
 * For a particular pull request, multiple files could be committed. 
 * For each file multiple sections could be present in the diff file.
 * So parse-diff module produces a array of objects for each file.
 * Each such object has an array 'chunks' for different sections in a file.
 * Each chunk has properties like, old start(starting line for the section in the old file), 
 *      old lines(number of lines in the section in the old file),
 *      new start(starting line for the section in the new file), 
 *      new lines(number of lines in the section in the new file)
 * 
 * @param {*} eachPR a single pull request of a repo
 */
async function processEachPull(eachPR) {
    try {

        let reqURL = [
            axios.get(eachPR.issue_url + "?access_token=" + accessToken),
            axios.get(eachPR.diff_url, { responseType: 'text' }),
            //axios.get(_.replace(eachPR.statuses_url, 'statuses', 'git/trees') + "?access_token=" + accessToken)
        ];
        // const result = await octokit.gitdata.getTree({ owner: eachPR.head.repo.owner.login, repo: eachPR.head.repo.name, sha: eachPR.head.sha, recursive: true });
        const [response_issue, response] = await Promise.all(reqURL);

        // getting the JSON after parsing the diff file
        let diff_data = parse(response.data);
        // eachPR['diff_data'] = diff_data;
        eachPR['issue_data'] = response_issue.data;

        //filtering : removing the objects with NORMAL type
        let promises = diff_data.map(eachFileWithParams(eachPR));
        await Promise.all(promises);

        // console.log('after parsing the data');
    }
    catch (e) {
        console.error(e);
    }
    return eachPR;
}

function eachFileWithParams(pullRequest) {
    return async function processEachFile(fileElement) {
        try {

            //TODO:check fileElement for the extension of the file (.java)
            if (fileElement.from.indexOf('.java') === -1) {
                return;
            }
            //process array of chunks in each file
            let promises = fileElement.chunks.map(eachChunkWithParams(fileElement.from, pullRequest));
            await Promise.all(promises);
        }
        catch (e) {
            console.log(e);
        }
    }
}

function eachChunkWithParams(fileName, pullRequest) {
    return async function processEachChunk(chunkElement) {
        try {
            //populating the add and delete changes map
            var addChangesMap = chunkElement.changes.reduce((changeMap, ele) => {
                if (ele.add) {
                    changeMap[ele.ln] = ele;
                }
                return changeMap;
            }, {});
            var deleteChangesMap = chunkElement.changes.reduce((map, ele) => {
                if (ele.del) {
                    map[ele.ln] = ele;
                }
                return map;
            }, {});

            chunkElement['addMap'] = addChangesMap;
            chunkElement['delMap'] = deleteChangesMap;

            //process each change array
            let promises = chunkElement.changes.map(eachChangeWithParams(addChangesMap, deleteChangesMap, chunkElement.newLines - chunkElement.oldLines, fileName, pullRequest));
            await Promise.all(promises);
        }
        catch (e) {
            console.log(e);
        }
    }
}

function eachChangeWithParams(addChangesMap, deleteChangesMap, lineDiff, fileName, pullRequest) {
    return async function processEachChange(eachChange) {

        //check normal change or not
        if (!eachChange.normal) {

            //Check for import added pattern        
            addToFinalJSON(await pattern.patternAddImport(eachChange, fileName), pullRequest);

            //check for import removed pattern
            addToFinalJSON(await pattern.patternRemoveImport(eachChange, fileName), pullRequest);

            //Promises.all needs to be used over here, else it will call one after the other.
            //check one change at a time


            //check add-del pair together
            if (eachChange.add && deleteChangesMap[eachChange.ln + lineDiff]) {
                addToFinalJSON(await pattern.patternChangedMethodParameters(eachChange, deleteChangesMap[eachChange.ln - lineDiff], fileName), pullRequest);
            }
            else if (eachChange.del && addChangesMap[eachChange.ln + lineDiff]) {
                addToFinalJSON(await pattern.patternChangedMethodParameters(eachChange, addChangesMap[eachChange.ln - lineDiff], fileName), pullRequest);
            }
        }
    }
}

function addToFinalJSON(result, pullRequest) {
    if (result) {
        result['pull_request'] = removeFieldsFromPullRequest(pullRequest);
        finalJSONResult.push(result);
    }
}

function removeFieldsFromPullRequest(eachPR) {
    eachPR['head'] = undefined;
    eachPR['repo'] = undefined;
    eachPR['base'] = undefined;
    eachPR['user'] = undefined;
    eachPR['_links'] = undefined;

    eachPR['locked'] = undefined;
    eachPR['requested_reviewers'] = undefined;
    eachPR['requested_teams'] = undefined;
    eachPR['milestone'] = undefined;
    eachPR['commits_url'] = undefined;
    eachPR['statuses_url'] = undefined;
    eachPR['comments_url'] = undefined;
    eachPR['review_comment_url'] = undefined;
    eachPR['review_comments_url'] = undefined;
    eachPR['author_association'] = undefined;
    eachPR['assignee'] = undefined;
    eachPR['assignees'] = undefined;
    eachPR['merge_commit_sha'] = undefined;

    eachPR['issue_data']['labels_url'] = undefined;
    eachPR['issue_data']['events_url'] = undefined;
    eachPR['issue_data']['html_url'] = undefined;
    eachPR['issue_data']['id'] = undefined;
    eachPR['issue_data']['pull_request'] = undefined;
    eachPR['issue_data']['author_association'] = undefined;
    eachPR['issue_data']['milestone'] = undefined;
    eachPR['issue_data']['assignee'] = undefined;
    eachPR['issue_data']['assignees'] = undefined;
    eachPR['issue_data']['closed_by'] = undefined;
    // eachPR['issue_data']['user'] = undefined;


    return eachPR;
    // eachPR['issue_data']=
}

async function processFinalJSON(finalJSONarray) {
    try {
        // let finalResultMap=new Map();
        return resultMap = finalJSONarray.reduce((finalResultMap, element) => {
            // console.log(element);
            let patternId = element.id;
            element.id = undefined;
            let changesForPattern = finalResultMap[patternId];
            if (changesForPattern) {
                changesForPattern.matches.push(element);
                finalResultMap[patternId] = {
                    frequency: changesForPattern.frequency + 1,
                    matches: changesForPattern.matches
                };
            } else {
                finalResultMap[patternId] = {
                    frequency: 1,
                    matches: [element]
                };
            }
            return finalResultMap;
        }, {});
    } catch (e) {
        console.log(e);
    }
}

async function cloneRepos() {
    try {

        for (var property in repoMap) {
            const { stdout, stderr } = await exec('git clone ' + repoMap[property].url);
            // console.log('stdout:', stdout);
            console.log('Repo:', stderr);
        }
    }
    catch (e) {
        console.log(e);
    }
}

// allRepoData();
console.log('Repo data collection in progress');

module.exports = {
    getParams,
    cloneRepos,
    processFinalJSON,
    addToFinalJSON,
    eachChangeWithParams,
    eachChunkWithParams,
    eachFileWithParams,
    processEachPull,
    getPullRequestsForRepos,
    getAndConvertData,
    getAllPullRequests,
    getRepoData
}