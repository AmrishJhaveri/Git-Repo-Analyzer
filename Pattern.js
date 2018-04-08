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
    patternRegex.test(change.content) ? getAnalyzerObj(change) : undefined;
}

async function patternRemoveImport(change) {
    let patternRegex = new RegExp(CONSTANTS.REMOVE_IMPORT);

    //TODO: extract the name of the class from the import    
    patternRegex.test(change.content) ? getAnalyzerObj(change) : undefined;
}

function getAnalyzerObj(change){
    let resultObj= new AnalyzerObj();
    console.log(change);
}

module.exports = {
    patternAddImport,
    patternRemoveImport
}