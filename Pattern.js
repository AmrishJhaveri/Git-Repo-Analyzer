const AnalyzerObj=require('./AnalyzerObj');

var CONSTANTS = {
    ADD_IMPORT: /[+][ ]*import /g,
    REMOVE_IMPORT: /[-][ ]*import /g
}

var PATTERN_ID = {
    ADD_IMPORT: 'ADD_IMPORT',
    REMOVE_IMPORT: 'REMOVE_IMPORT'
}

async function patternAddImport(change, fileName) {
    let patternRegex = new RegExp(CONSTANTS.ADD_IMPORT);

    //TODO: extract the name of the class from the import
    return patternRegex.test(change.content) ? getAnalyzerObj(change,PATTERN_ID.ADD_IMPORT, fileName) : undefined;
}

async function patternRemoveImport(change, fileName) {
    let patternRegex = new RegExp(CONSTANTS.REMOVE_IMPORT);

    //TODO: extract the name of the class from the import    
   return patternRegex.test(change.content) ? getAnalyzerObj(change, PATTERN_ID.REMOVE_IMPORT, fileName) : undefined;
}

async function getAnalyzerObj(change, id, fileName){
    let resultObj= new AnalyzerObj(id, fileName);

    let newChange={
        ln:change.ln,
        content:change.content
    }

    resultObj.addConstruct(newChange);
    // console.log(resultObj);
    return resultObj;
}

module.exports = {
    patternAddImport,
    patternRemoveImport,
    PATTERN_ID
}