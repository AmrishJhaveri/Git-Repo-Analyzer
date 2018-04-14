var method = AnalyzerObj.prototype;

//Constructor for AnalyzerObj
function AnalyzerObj(id, fileName) {
    this.id = id;
    this.file = fileName;
    this.change = undefined;
}

//prototype method for AnalyzerObj which sets the file name in the object.
method.setFile = function (fileName) { this.file = fileName };

//prototype method for AnalyzerObj which sets the constructObj in the object.
method.addConstruct = function (constructObj) { this.change = constructObj };

//make AnalyzerObj available to other modules.
module.exports = AnalyzerObj;