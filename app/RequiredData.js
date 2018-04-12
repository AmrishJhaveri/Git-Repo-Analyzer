var _data=[];

var setData=function(data){
    _data=data;
};

var getData=function(){
    return _data;
}

var addData=function(dataElement){
    _data.push(dataElement);
}

module.exports={
    setData,
    getData,
    addData
};