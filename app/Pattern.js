const AnalyzerObj = require('./AnalyzerObj');

var CONSTANTS = {
    ADD_IMPORT: /[+][ ]*import /g,
    REMOVE_IMPORT: /[-][ ]*import /g,
    // CHANGE_PARAMETERS: /[\(\)]/g
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
        return;
    }

    return checkMethodParametersChanged(change1.content, change2.content) ? getAnalyzerObj(change1, PATTERN_ID.CHANGE_PARAMETERS, fileName, change2) : undefined;
}

function checkMethodParametersChanged(change1, change2) {
    let name1 = change1.substring(change1.indexOf(" "), change1.indexOf("("));
    let name2 = change2.substring(change2.indexOf(" "), change2.indexOf("("));
    if (name1 === name2 && name1 !== '') {

        if (change1.substring(change1.indexOf("(") + 1, change1.indexOf(")")) !== change2.substring(change2.indexOf("(") + 1, change2.indexOf(")"))) {
            console.log("name1:" + JSON.stringify(change1, undefined, 2));
            console.log("name2:" + JSON.stringify(change2, undefined, 2));
            return true;
        }
    }
    return false;
}

async function getAnalyzerObj(change1, id, fileName, change2) {
    let resultObj = new AnalyzerObj(id, fileName);

    let newChange = {
        ln: change1.ln,
        content1: change1.content,
        content2: change2 ? change2.content : undefined,
        findImpactFor: await getImpactValue(change1.content, id)
    }

    resultObj.addConstruct(newChange);
    return resultObj;
}

async function getImpactValue(content, patternId) {
    let resultString;
    switch (patternId) {
        case PATTERN_ID.ADD_IMPORT:
        case PATTERN_ID.REMOVE_IMPORT:
            resultString = content.substring(content.lastIndexOf('.') + 1, content.lastIndexOf(';'));
            break;
        case PATTERN_ID.CHANGE_PARAMETERS:
            resultString = content.substring(content.indexOf(' '), content.indexOf('('));
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