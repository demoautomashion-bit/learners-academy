const fs = require('fs');
const pdf = require('pdf-parse');
let dataBuffer = fs.readFileSync("c:\\Desktop\\Web Protos\\v0-the-learners-academy\\Marks' sheet - Foundation to Level Five.pdf");
pdf(dataBuffer).then(function(data) { console.log(data.text); }).catch(e => console.error(e));
