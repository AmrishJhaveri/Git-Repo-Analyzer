var method = AnalyzerObj.prototype;

function AnalyzerObj(id, fileName) {
    this.id = id;
    this.file = fileName;
    this.change = [];
}

method.setFile = function (fileName) { this.file = fileName };

method.addConstruct = function (constructObj) { this.change.push(constructObj) };

module.exports = AnalyzerObj;