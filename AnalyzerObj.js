var method = AnalyzerObj.prototype;

function AnalyzerObj(id, file) {
    this._id = id;
    this._file = file;
    this._change = [];
}

method.setFile = function (fileName) { this._file = fileName };

method.addConstruct = function (constructObj) { this._change.push(constructObj) };

module.exports = AnalyzerObj;