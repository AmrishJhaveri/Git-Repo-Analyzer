var method = AnalyzerObj.prototype;

function AnalyzerObj(id) {
    this._id = id;
    this._file = undefined;
    this._change = [];
}

method.setFile = function (fileName) { this._file = fileName };

method.addConstruct = function (constructObj) { this._change.push(constructObj) };

module.exports = AnalyzerObj;