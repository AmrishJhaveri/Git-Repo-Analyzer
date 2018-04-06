const AnalyzerObj=require('./../AnalyzerObj');

let obj = new AnalyzerObj('fileName.js');
obj.addConstruct({factor:'parameterChange',oldParameter:'int'});
console.log(JSON.stringify(obj));