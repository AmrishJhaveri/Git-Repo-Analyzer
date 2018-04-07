var CONSTANTS = {
    ADD_IMPORT: '[+][ ]*import ',
    REMOVE_IMPORT: '[-][ ]*import '
}

var PATTERN_ID = {
    ADD_IMPORT: 'ADD_IMPORT',
    REMOVE_IMPORT: 'REMOVE_IMPORT'
}

async function pattermAddImport(content) {
    let patternRegex = new RegExp(CONSTANTS.ADD_IMPORT);
    patternRegex.test(content) ? getAnalyzerObj() : undefined;
}

async function pattermRemoveImport(content) {
    let patternRegex = new RegExp(CONSTANTS.REMOVE_IMPORT);
    patternRegex.test(content) ? getAnalyzerObj() : undefined;
}

module.exports.Pattern = {
    pattermAddImport,
    pattermRemoveImport
}