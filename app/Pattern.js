const AnalyzerObj = require('./AnalyzerObj');

var CONSTANTS = {
    ADD_IMPORT: /[+][ ]*import /g,
    REMOVE_IMPORT: /[-][ ]*import /g,
    CHANGE_PARAMETERS: /[\(\)]/g
}

var PATTERN_ID = {
    ADD_IMPORT: 'ADD_IMPORT',
    REMOVE_IMPORT: 'REMOVE_IMPORT',
    CHANGE_PARAMETERS: 'CHANGE_PARAMETERS'
}

async function patternAddImport(change, fileName) {
    let patternRegex = new RegExp(CONSTANTS.ADD_IMPORT);

    // extract the name of the class from the import
    return patternRegex.test(change.content) ? getAnalyzerObj(change, PATTERN_ID.ADD_IMPORT, fileName) : undefined;
}

async function patternRemoveImport(change, fileName) {
    let patternRegex = new RegExp(CONSTANTS.REMOVE_IMPORT);

    // extract the name of the class from the import    
    return patternRegex.test(change.content) ? getAnalyzerObj(change, PATTERN_ID.REMOVE_IMPORT, fileName) : undefined;
}

async function patternChangedMethodParameters(change1, change2, fileName) {

    if (!change2 || !change2.content) {
        return
    }
    // console.log( typeof change2.content);
    let arr1 = change1.content.split(CONSTANTS.CHANGE_PARAMETERS);
    let arr2 = change2.content.split(CONSTANTS.CHANGE_PARAMETERS);

    return checkMethodParametersChanged(arr1, arr2) ? getAnalyzerObj(change1, PATTERN_ID.CHANGE_PARAMETERS, fileName) : undefined;
}

async function checkMethodParametersChanged(arr1, arr2) {
    // console.log("arr1:" + JSON.stringify(arr1, undefined, 2));
    // console.log("arr2:" + JSON.stringify(arr2, undefined, 2));
    if (arr1[0] != arr2[0])
        return false;

    if (arr1[1] !== arr2[1]) {
        console.log("arr1:" + JSON.stringify(arr1, undefined, 2));
        console.log("arr2:" + JSON.stringify(arr2, undefined, 2));
        return true;
    }
    return false;
    // if (arr1.every(function (u, i) { return u === arr2[i]; }))
    //     return true
    // else
    //     return false
}

async function getAnalyzerObj(change, id, fileName) {
    let resultObj = new AnalyzerObj(id, fileName);

    let newChange = {
        ln: change.ln,
        content: change.content,
        findImpactFor: await getImpactValue(change.content, id)
    }

    resultObj.addConstruct(newChange);
    // console.log(resultObj);
    return resultObj;
}

async function getImpactValue(content, patternId) {
    let resultString;
    switch (patternId) {
        case PATTERN_ID.ADD_IMPORT:
        case PATTERN_ID.REMOVE_IMPORT:
            resultString = content.substring(content.lastIndexOf('.') + 1);
            break;
    }
    return resultString;
}

module.exports = {
    patternAddImport,
    patternRemoveImport,
    PATTERN_ID,
    patternChangedMethodParameters
}