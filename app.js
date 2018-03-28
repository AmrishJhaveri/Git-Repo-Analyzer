const octokit = require('@octokit/rest')();
const fs = require('fs');

const reqData=require('./RequiredData');

var CONSTANTS ={
    REPOS_DATA_FILE:'searchData.json'
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

//Get the repositories meta data. Store it into a JSON file
octokit.search.repos(getParams(1)).then(result => {
    fs.writeFileSync(CONSTANTS.REPOS_DATA_FILE, JSON.stringify(result, undefined, 2));
}, reject => {
    console.log('error', JSON.stringify(reject));
});

var repoDetails=JSON.parse(fs.readFileSync(CONSTANTS.REPOS_DATA_FILE));
console.log('in Result',JSON.stringify(repoDetails,undefined,2));

repoDetails.data.items.forEach(element => {
    reqData.addData(element);
});

console.log(reqData.getData().length);