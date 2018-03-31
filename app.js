const octokit = require('@octokit/rest')();
const fs = require('fs');
const _ = require('lodash');

const reqData = require('./RequiredData');

// var allDataMap = new Map();
// var map = Map.prototype;

octokit.authenticate({
    type: 'token',
    token: 'f261168993b8ff10be45e863b036ac44040b678f'
})


// var allIssues = [], allPulls = [];

var CONSTANTS = {
    REPOS_DATA_FILE: './GitAnalyzer/searchData.json'
};


var getParams = (page_no) => {

    var q_param = "language:java license:mit";
    var sort_param = 'stars';
    var order_param = 'desc';

    return params = {
        q: q_param,
        sort: sort_param,
        order: order_param,
        page: page_no
    }
};

// Get the repositories meta data. Store it into a JSON file
octokit.search.repos(getParams(1)).then(result => {
    fs.writeFileSync(CONSTANTS.REPOS_DATA_FILE, JSON.stringify(result, undefined, 2));
}, reject => {
    console.log('error', JSON.stringify(reject));
});

//iterate over the data and store the required info from each repo metadata.
async function getAllPullRequests() {

    //read the file contents
    var repoDetails = JSON.parse(fs.readFileSync(CONSTANTS.REPOS_DATA_FILE));

    for (const element of repoDetails.data.items) {
        //repoDetails.data.items.forEach(element => {
        let data = {
            id: element.id,
            name: element.name,
            owner: element.owner.login,
            //issues_url: _.replace(element.issues_url, '{/number}', ''),
            pulls_url: _.replace(element.pulls_url, '{/number}', ''),
            created_at: element.created_at,
            has_issues: element.has_issues
        };
        // allIssues.push(axios.get(data.issues_url).catch((e)=>{console.log(e)}));
        //allPulls.push(axios.get(data.pulls_url).catch((e)=>{console.log(e)}));
        // var pull_requests;
        let resultant_data = await getOnlyPullRequests( data.owner,data.name );
        data['pull_requests'] = resultant_data;
        reqData.addData(data)
        console.log(resultant_data);

    };
    console.log('After iterating all the elements');
    //console.log("ReqData:", JSON.stringify(reqData.getData(), undefined, 2));
    fs.writeFileSync('./GitAnalyzer/requiredData.json', JSON.stringify(reqData.getData(), undefined, 2));
}

async function getOnlyPullRequests(data_owner,data_name) {
    try {
        return await octokit.pullRequests.getAll({ owner: data_owner, repo: data_name, state: 'closed' })
    }
    catch (e) {
        console.log(e);
    }
}


getAllPullRequests();
console.log('Repo data is collected');

console.log('Getting Issues data');

