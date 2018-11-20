var express = require('express');
var app = express();
var fs = require('fs');

var basePath='../VNA DB Data/01-vna/';
var fileStart = '{ "databaseChangeLog": [';
var fileEnd = ']}';
var owner ='vna';
var author='lflores';
var file = 'changelog-VNA.json'
/*var preconditions = '{"preConditions": [{"onFail":"CONTINUE"},{"runningAs": {"username": "'+owner+'"}}]},'
fileStart = fileStart + preconditions;*/

var contents = fs.readFileSync(file, 'utf8');

Number.prototype.noExponents= function(){
    var data= String(this).split(/[eE]/);
    if(data.length== 1) return data[0]; 

    var  z= '', sign= this<0? '-':'',
    str= data[0].replace('.', ''),
    mag= Number(data[1])+ 1;

    if(mag<0){
        z= sign + '0.';
        while(mag++) z += '0';
        return z + str.replace(/^\-/,'');
    }
    mag -= str.length;  
    while(mag--) z += '0';
    return str + z;
}

var writeFile = function (element, path){
    var fileContent = fileStart+JSON.stringify(element,null,3)+fileEnd;
    fileContent = JSON.stringify(JSON.parse(fileContent),null,3)
    var file = fs.createWriteStream(path);
    file.write(fileContent);
    file.end();
}

app.get('/', function (req, res) {
    let data = JSON.parse(contents);
    let dataCount = {};
    data.databaseChangeLog.forEach(function (element){
        element.changeSet.author=author;
        element.changeSet.preConditions = JSON.parse('[{"onFail":"CONTINUE"},{"runningAs": {"username": "'+owner+'"}}]');
        element.changeSet.changes.forEach(function(change){
            keys =Object.keys(change);
            keys.forEach( function(key){
                switch (key){
                    case 'createTable':
                        element.changeSet.id=owner+'-table-'+change[key].tableName.toLowerCase();
                        change[key].schemaName = owner;
                        writeFile(element,basePath+'02-Tables/'+change[key].tableName.toLowerCase()+'.json');
                        break;
                    case 'createSequence':
                        element.changeSet.id=owner+'-sequence-'+change[key].sequenceName.toLowerCase();
                        if(change[key].hasOwnProperty('maxValue')){
                            change[key].maxValue = change[key].maxValue.noExponents();
                        }
                        change[key].schemaName = owner;
                        writeFile(element,basePath+'06-Sequences/'+change[key].sequenceName.toLowerCase()+'.json');
                        break;
                    case 'createView':
                        element.changeSet.id=owner+'-view-'+change[key].viewName.toLowerCase();
                        change[key].schemaName = owner;
                        writeFile(element,basePath+'03-Views/'+change[key].viewName.toLowerCase()+'.json');
                        break;
                    case 'createIndex':
                        element.changeSet.id=owner+'-index-'+change[key].indexName.toLowerCase();
                        change[key].schemaName = owner;
                        writeFile(element,basePath+'04-Index/'+change[key].indexName.toLowerCase()+'.json');
                        break;
                    case 'addForeignKeyConstraint':
                        element.changeSet.id=owner+'-FKConstraint-'+change[key].constraintName.toLowerCase();
                        change[key].schemaName = owner;
                        writeFile(element,basePath+'05-Constraints/'+change[key].constraintName.toLowerCase()+'.json');
                        break;
                    case 'addUniqueConstraint':
                        change[key].schemaName = owner;
                        writeFile(element,basePath+'04-Index/'+change[key].forIndexName.toLowerCase()+'.json');
                        break;
                }
                if(dataCount.hasOwnProperty(key)){
                    dataCount[key]++;
                }else{
                    dataCount[key]=1;
                }
            })
        })
    })
    res.send(dataCount);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});