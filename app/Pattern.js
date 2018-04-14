//This module provides the object structure for the analyzer's output.
const AnalyzerObj = require('./AnalyzerObj');

//Regular expressions(regex) used for finding the pattern.
var CONSTANTS = {
    //checks first for + sign and then 'import' key word
    ADD_IMPORT: /[+][ ]*import /g,
    //checks first for - sign and then 'import' key word
    REMOVE_IMPORT: /[-][ ]*import /g,
    // CHANGE_PARAMETERS: /[\(\)]/g
}

//this are ids used for the patterns. This will be used in the final out put for ket of the object.
var PATTERN_ID = {
    ADD_IMPORT: 'ADD_IMPORT',
    REMOVE_IMPORT: 'REMOVE_IMPORT',
    CHANGE_PARAMETERS: 'CHANGE_PARAMETERS'
}

/**
 * 
 * This function tries to find if the given change is for addition of import.
 * It uses regex to match the content of the change.
 * If its a match we get the Analyzer object which will be used for the final output.
 * If not then return undefined, so no details about this change and the pattern is used for final output.
 * 
 * @param {*} change The change object which contains the line number of change,content of change 
 * @param {*} fileName name of the file in which the change was found
 */
async function patternAddImport(change, fileName) {
    //Create a RegExp object using the class and providing the regex pattern
    let patternRegex = new RegExp(CONSTANTS.ADD_IMPORT);

    //Test the regex against the change content. If it passes use create a AnalyzerObj object, else return undefined.
    return patternRegex.test(change.content) ? getAnalyzerObj(change, PATTERN_ID.ADD_IMPORT, fileName) : undefined;
}

/**
 * 
 * This function tries to find if the given change is for removal of import.
 * It uses regex to match the content of the change.
 * If its a match we get the Analyzer object which will be used for the final output.
 * If not then return undefined, so no details about this change and the pattern is used for final output.
 * 
 * @param {*} change The change object which contains the line number of change,content of change 
 * @param {*} fileName name of the file in which the change was found
 */
async function patternRemoveImport(change, fileName) {
    //Create a RegExp object using the class and providing the regex pattern
    let patternRegex = new RegExp(CONSTANTS.REMOVE_IMPORT);

    //Test the regex against the change content. If it passes use create a AnalyzerObj object, else return undefined.
    return patternRegex.test(change.content) ? getAnalyzerObj(change, PATTERN_ID.REMOVE_IMPORT, fileName) : undefined;
}

/**
 * 
 * This function is used for finding if the parameters within parenthesis are changed or not between the 2 versions of the same line.
 * First check whether change2 is valid i.e. not undefined. There is possibility that change on same line may or may not exist.
 * If change2 is valid then call checkMethodParametersChanged() and if returned true then create the AnalyzerObj object else return undefined.
 * 
 * @param {*} change1 The change object which contains the line number of change,content of change. This is a opposite change to change2. 
 * @param {*} change2 The change object which contains the line number of change,content of change This is a opposite change to change1.
 * @param {*} fileName name of the file in which the change was found
 */
async function patternChangedMethodParameters(change1, change2, fileName) {
    //check if change2 exist and hase a content field which is not empty.
    if (!change2 || !change2.content) {
        return;
    }

    // If change1 and change2 present then find out whether if the parameters between parenthesis are replaced or not.
    return checkMethodParametersChanged(change1.content, change2.content) ? getAnalyzerObj(change1, PATTERN_ID.CHANGE_PARAMETERS, fileName, change2) : undefined;
}

/**
 * 
 * This function checks the content of the 2 changes passed to it and finds whether it is a match for the case of parameter replacement.
 * First extract the substring from both the contents till the first '('
 * Match both the substrings,if it matches then match the substring from first '(' to the first ')'. 
 * If the above substrings don't match then we found our match and return true else false.
 * 
 * @param {*} content1 the content for change1
 * @param {*} content2 the content for change2
 */
function checkMethodParametersChanged(content1, content2) {
    //Get the substring from ' ' i.e white-space till the first '(' for content1
    let name1 = content1.substring(content1.indexOf(" "), content1.indexOf("("));
    
    //Get the substring from ' ' i.e white-space till the first '(' for content2.
    let name2 = content2.substring(content2.indexOf(" "), content2.indexOf("("));
    
    //match the above substring and check that one of them is not empty.
    if (name1 === name2 && name1 !== '') {
        
        //check if the content between '(' and ')' do not match.
        if (content1.substring(content1.indexOf("(") + 1, content1.indexOf(")")) !== content2.substring(content2.indexOf("(") + 1, content2.indexOf(")"))) {
            return true;
        }
    }
    return false;
}

/**
 * 
 * This function creates a AnalyzerObj object which will used in the final output of the analyzer.
 * 
 * 
 * @param {*} change1 The change object which contains the line number of change,content of change.
 * @param {*} id one of ADD_IMPORT, REMOVE_IMPORT, CHANGED_PARAMETERS
 * @param {*} fileName name of the file in which the change is found
 * @param {*} change2 The change object which contains the line number of change,content of change. This will be undefined for ADD_IMPORT & REMOVE_IMPORT.
 */
async function getAnalyzerObj(change1, id, fileName, change2) {
    let resultObj = new AnalyzerObj(id, fileName);

    let newChange = {
        ln: change1.ln,
        content1: change1.content,
        content2: change2 ? change2.content : undefined,
        //This is the parameter that is changed. This will be used by Understand to find its use in the entire file.
        findImpactFor: await getImpactValue(change1.content, id)
    }

    resultObj.addConstruct(newChange);
    return resultObj;
}

/**
 * 
 * This function returns a entity for which impact needs to be determined by Understand.
 * 
 * @param {*} content the string from which the impact factor will be extracted.
 * @param {*} patternId one of ADD_IMPORT, REMOVE_IMPORT, CHANGED_PARAMETERS
 */
async function getImpactValue(content, patternId) {
    let resultString;
    switch (patternId) {
        case PATTERN_ID.ADD_IMPORT:
        case PATTERN_ID.REMOVE_IMPORT:
            //extracts the substring from the import statement. The substirng from the last '.' to ';'
            resultString = content.substring(content.lastIndexOf('.') + 1, content.lastIndexOf(';'));
            break;
        case PATTERN_ID.CHANGE_PARAMETERS:
            //extarct substring from ' '(white space) to the first '('.
            resultString = content.substring(content.indexOf(' '), content.indexOf('('));
            break;
    }
    return resultString;
}

// make the below functions/objects avaliable in other modules.
module.exports = {
    patternAddImport,
    patternRemoveImport,
    PATTERN_ID,
    patternChangedMethodParameters
}