const octokit = require('@octokit/rest')();
const fs = require('fs');
const _ = require('lodash');
const axios = require('axios');
const parse = require('parse-diff');
//const utf8 = require('utf8')

const reqData = require('./RequiredData');

const accessToken = 'f261168993b8ff10be45e863b036ac44040b678f';
octokit.authenticate({
    type: 'token',
    token: accessToken
})

var CONSTANTS = {
    //REPOS_DATA_FILE: './GitAnalyzer/searchData.json',
    REQUIRED_DATA_JSON: './RequiredData.json'
};

var getParams = (page_no) => {

    let q_param = "language:java license:mit";
    let sort_param = 'stars';
    let order_param = 'desc';
    let per_page_number = 1;

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
    fs.writeFileSync(CONSTANTS.REQUIRED_DATA_JSON, JSON.stringify(reqData.getData(), undefined, 2));
    console.timeEnd('getAllPullRequests');
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
        console.log(e.config.url);
    }
}

async function processEachPull(eachPR) {

    try {

        let reqURL = [axios.get(eachPR.issue_url + "?access_token=" + accessToken), axios.get(eachPR.diff_url, { responseType: 'text' })];

        const [response_issue, response] = await Promise.all(reqURL);

        console.log('Before parsing:' + eachPR.url);
        // remove the following data from the pull requests
        eachPR['head'] = undefined;
        eachPR['repo'] = undefined;
        eachPR['base'] = undefined;

        // getting the JSON after parsing the diff file
        let diff_data = parse(response.data);
        eachPR['diff_data'] = diff_data;
        eachPR['issue_data'] = response_issue.data;

        //filtering : removing the objects with NORMAL type
        let promises = diff_data.map(processEachFile);
        await Promise.all(promises);

        console.log('after parsing the data');
    }
    catch (e) {
        console.error(e.config.url);
    }
    return eachPR;
}

async function processEachFile(fileElement) {
    try {

        //TODO:check fileElement for the extension of the file (.java)

        //process array of chunks in each file
        let promises = fileElement.chunks.map(processEachChunk)
        await Promise.all(promises);
    }
    catch (e) {
        console.log(e.config.url);
    }
}

async function processEachChunk(chunkElement) {
    try {
        //FIXME: remove maps and use filter for add and delete    
        var addChangesMap = chunkElement.changes.reduce((changeMap, ele) => {
            if (ele.add) {
                changeMap[ele.ln] = ele.content;
            }
            return changeMap;
        }, {});
        var deleteChangesMap = chunkElement.changes.reduce((map, ele) => {
            if (ele.del) {
                map[ele.ln] = ele.content;
            }
            return map;
        }, {});
        
        chunkElement['addMap'] = JSON.stringify(addChangesMap, undefined, 2);
        chunkElement['delMap'] = JSON.stringify(deleteChangesMap, undefined, 2);

        //process each change array
        let promises = chunkElement.changes.map(eachChangeWithParams(addChangesMap, deleteChangesMap, chunkElement.newLines - chunkElement.oldLines));
        await Promise.all(promises);

    }
    catch (e) {
        console.log(e);
    }
}

function eachChangeWithParams(addChangesMap, deleteChangesMap, lineDiff) {
    return async function processEachChange(eachChange) {

        console.log('del:' + JSON.stringify(deleteChangesMap, undefined, 2));
        //check normal change or not
        if (!eachChange.normal) {
            // console.log('lineDiff:', lineDiff);

            //If not normal, check the patterns
            //Promises.all needs to be used over here, else it will call one after the other.

            //check one change at a time


            //check add-del pair together
            //TODO:process patterns with add and delete changes.
            //iterate over all add changes while comparing with del changes and vice versa.
        }
    }
}

allRepoData();
console.log('Repo data collection in progress');