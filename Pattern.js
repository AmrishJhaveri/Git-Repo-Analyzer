const AnalyzerObj=require('./AnalyzerObj');

var CONSTANTS = {
    ADD_IMPORT: '[+][ ]*import ',
    REMOVE_IMPORT: '[-][ ]*import '
}

var PATTERN_ID = {
    ADD_IMPORT: 'ADD_IMPORT',
    REMOVE_IMPORT: 'REMOVE_IMPORT'
}

async function pattermAddImport(change) {
    let patternRegex = new RegExp(CONSTANTS.ADD_IMPORT);
    patternRegex.test(change.content) ? getAnalyzerObj(change) : undefined;
}

async function pattermRemoveImport(change) {
    let patternRegex = new RegExp(CONSTANTS.REMOVE_IMPORT);
    patternRegex.test(change.content) ? getAnalyzerObj(change) : undefined;
}

function getAnalyzerObj(change){
    let reultObj= new AnalyzerObj();
}

module.exports.Pattern = {
    pattermAddImport,
    pattermRemoveImport
}