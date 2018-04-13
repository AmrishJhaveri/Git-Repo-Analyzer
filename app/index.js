const octokit = require('@octokit/rest')();
const fs = require('fs');
const _ = require('lodash');
const axios = require('axios');
const parse = require('parse-diff');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const reqData = require('./RequiredData');
const pattern = require('./Pattern');

let finalJSONResult = [];
let repoMap = {};

const accessToken = 'f261168993b8ff10be45e863b036ac44040b678f';
octokit.authenticate({
    type: 'token',
    token: accessToken
})

var CONSTANTS = {
    //REPOS_DATA_FILE: './GitAnalyzer/searchData.json',
    REQUIRED_DATA_JSON: './RequiredData.json',
    REPO_DATA_JSON: './RepoData.json'
};

function getParams(page_no) {
    // let q_param = "language:java license:mit";
    let q_param = "mock language:java license:mit";
    let sort_param = 'stars';
    let order_param = 'desc';
    let per_page_number = 5;

    return params = {
        q: q_param,
        sort: sort_param,
        order: order_param,
        page: page_no,
        per_page: per_page_number
    }
};

// Get the repositories meta data. Store it into a JSON file
async function allRepoData() {
    try {
        const result_data = await octokit.search.repos(getParams(1));
        console.log('after get repo data');
        getAllPullRequests(result_data);
    }
    catch (e) {
        console.log(e);
    }
}

//iterate over the data and store the required info from each repo metadata.
async function getAllPullRequests(repoDetails) {
    console.time('getAllPullRequests');

    const promises = repoDetails.data.items.map(getAndConvertData)
    await Promise.all(promises);

    console.log('After iterating all the elements');
    // fs.writeFileSync(CONSTANTS.REQUIRED_DATA_JSON, JSON.stringify(reqData.getData(), undefined, 2));
    fs.writeFileSync(CONSTANTS.REQUIRED_DATA_JSON, JSON.stringify(await processFinalJSON(finalJSONResult), undefined, 2));
    fs.writeFileSync(CONSTANTS.REPO_DATA_JSON, JSON.stringify(repoMap, undefined, 2))
    console.timeEnd('getAllPullRequests');
    console.time('cloneRepos');
    // await cloneRepos();
    console.timeEnd('cloneRepos');

}

async function getAndConvertData(element, index) {

    let data = {
        id: element.id,
        name: element.name,
        owner: element.owner.login,
        //issues_url: _.replace(element.issues_url, '{/number}', ''),
        pulls_url: _.replace(element.pulls_url, '{/number}', ''),
        created_at: element.created_at,
        has_issues: element.has_issues
    };
    repoMap[element.full_name] = {
        id: element.id,
        name: element.name,
        owner: element.owner.login,
        url: element.html_url
    }

    let resultant_data = await getOnlyPullRequests(data.owner, data.name);
    data['pull_requests'] = resultant_data.data;
    reqData.addData(data)
    console.log('after pull request call:' + index);
}

async function getOnlyPullRequests(data_owner, data_name) {
    try {
        let resultant_pull_requests = await octokit.pullRequests.getAll({ owner: data_owner, repo: data_name, state: 'closed' });
        console.log('No. of pull requests:' + resultant_pull_requests.data.length + ' of repo:' + data_name);

        const promises = resultant_pull_requests.data.map(processEachPull);
        await Promise.all(promises);

        console.log('After each diff captured for the repo');
        return resultant_pull_requests;
    }
    catch (e) {
        console.log(e);
    }
}

async function processEachPull(eachPR) {
    try {

        let reqURL = [
            axios.get(eachPR.issue_url + "?access_token=" + accessToken),
            axios.get(eachPR.diff_url, { responseType: 'text' }),
            //axios.get(_.replace(eachPR.statuses_url, 'statuses', 'git/trees') + "?access_token=" + accessToken)
        ];
        // const result = await octokit.gitdata.getTree({ owner: eachPR.head.repo.owner.login, repo: eachPR.head.repo.name, sha: eachPR.head.sha, recursive: true });
        const [response_issue, response] = await Promise.all(reqURL);

        // console.log("Tree:" + JSON.stringify(result, undefined, 2));
        // console.log('Before parsing:' + eachPR.url);
        // remove the following data from the pull requests
        eachPR['head'] = undefined;
        eachPR['repo'] = undefined;
        eachPR['base'] = undefined;

        eachPR['user'] = undefined;
        eachPR['_links'] = undefined;

        // getting the JSON after parsing the diff file
        let diff_data = parse(response.data);
        // eachPR['diff_data'] = diff_data;
        // eachPR['issue_data'] = response_issue.data;

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
            if (eachChange.add && deleteChangesMap[eachChange.ln+lineDiff]) {
                addToFinalJSON(await pattern.patternChangedMethodParameters(eachChange, deleteChangesMap[eachChange.ln-lineDiff], fileName),pullRequest);
            }
            else if(eachChange.del && addChangesMap[eachChange.ln+lineDiff]) {
                addToFinalJSON(await pattern.patternChangedMethodParameters(eachChange, addChangesMap[eachChange.ln-lineDiff], fileName),pullRequest);
            }
        }
    }
}

function addToFinalJSON(result, pullRequest) {
    if (result) {
        result['pull_request'] = pullRequest;
        finalJSONResult.push(result);
    }
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
    getOnlyPullRequests,
    getAndConvertData,
    getAllPullRequests,
    allRepoData
}