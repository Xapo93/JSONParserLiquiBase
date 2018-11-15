var express = require('express');
var app = express();
var fs = require('fs');

var basePath='../scrumtm DB Data/01-scrumtm/';
var fileStart = '{ "databaseChangeLog": [';
var fileEnd = ']}';
var owner ='scrumtm';
var author='lflores';
var file = 'changelog-scrumtm.json'

var contents = fs.readFileSync(file, 'utf8');

app.get('/', function (req, res) {
    let data = JSON.parse(contents);
    let dataCount = {};
    data.databaseChangeLog.forEach(function (element){
        element.changeSet.author=author;
        element.changeSet.changes.forEach(function(change){
            keys =Object.keys(change);
            keys.forEach( function(key){
                switch (key){
                    case 'createTable':
                        element.changeSet.id=owner+'-table-'+change[key].tableName.toLowerCase();
                        var fileContent = fileStart+JSON.stringify(element,null,3)+fileEnd;
                        var file = fs.createWriteStream(basePath+'02-Tables/'+change[key].tableName.toLowerCase()+'.json');
                        file.write(fileContent);
                        file.end();
                        break;
                    case 'createSequence':
                        element.changeSet.id=owner+'-sequence-'+change[key].sequenceName.toLowerCase();
                        var fileContent = fileStart+JSON.stringify(element,null,3)+fileEnd;
                        var file = fs.createWriteStream(basePath+'06-Sequences/'+change[key].sequenceName.toLowerCase()+'.json');
                        file.write(fileContent);
                        file.end();
                        break;
                    case 'createView':
                        element.changeSet.id=owner+'-view-'+change[key].viewName.toLowerCase();
                        var fileContent = fileStart+JSON.stringify(element,null,3)+fileEnd;
                        var file = fs.createWriteStream(basePath+'03-Views/'+change[key].viewName.toLowerCase()+'.json');
                        file.write(fileContent);
                        file.end();
                        break;
                    case 'createIndex':
                        element.changeSet.id=owner+'-index-'+change[key].indexName.toLowerCase();
                        var fileContent = fileStart+JSON.stringify(element,null,3)+fileEnd;
                        var file = fs.createWriteStream(basePath+'04-Index/'+change[key].indexName.toLowerCase()+'.json');
                        file.write(fileContent);
                        file.end();
                        break;
                    case 'addForeignKeyConstraint':
                        element.changeSet.id=owner+'-FKConstraint-'+change[key].constraintName.toLowerCase();
                        var fileContent = fileStart+JSON.stringify(element,null,3)+fileEnd;
                        var file = fs.createWriteStream(basePath+'05-Constraints/'+change[key].constraintName.toLowerCase()+'.json');
                        file.write(fileContent);
                        file.end();
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