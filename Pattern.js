const AnalyzerObj=require('./AnalyzerObj');

var CONSTANTS = {
    ADD_IMPORT: '[+][ ]*import ',
    REMOVE_IMPORT: '[-][ ]*import '
}

var PATTERN_ID = {
    ADD_IMPORT: 'ADD_IMPORT',
    REMOVE_IMPORT: 'REMOVE_IMPORT'
}

async function patternAddImport(change) {
    let patternRegex = new RegExp(CONSTANTS.ADD_IMPORT);

    //TODO: extract the name of the class from the import
    return patternRegex.test(change.content) ? getAnalyzerObj(change,PATTERN_ID.ADD_IMPORT) : undefined;
}

async function patternRemoveImport(change) {
    let patternRegex = new RegExp(CONSTANTS.REMOVE_IMPORT);

    //TODO: extract the name of the class from the import    
   return patternRegex.test(change.content) ? getAnalyzerObj(change, PATTERN_ID.REMOVE_IMPORT) : undefined;
}

async function getAnalyzerObj(change, id){
    let resultObj= new AnalyzerObj(id);
    resultObj.addConstruct(change);
    // console.log(resultObj);
    return resultObj;
}

module.exports = {
    patternAddImport,
    patternRemoveImport
}