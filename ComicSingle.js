'use strict'

// var async = require("async");
// var AWS = require("aws-sdk");
// var http = require("http");
// require("string_format");
// var lambda = new AWS.Lambda({"region": "us-east-1"});
// var CryptoJS = require('crypto-js');
// var PUBLIC_KEY = "e80b6bcf1f06434860c9a3215203ea01";
// var PRIV_KEY = "0263c80cd25d6413fb170fa8d0271ca323966c9b";
// var ts = new Date().getTime();
// var HASH = CryptoJS.MD5(ts + PRIV_KEY + PUBLIC_KEY).toString();
// var url = "http://gateway.marvel.com/v1/public/characters/{0}/comics?limit=100&ts={1}&apikey={2}&hash={3}";
// var getUrl="";

var async = require("async");
var AWS = require("aws-sdk");
var http = require("http");
var CryptoJS = require('crypto-js');
require("string_format");

var lambda = new AWS.Lambda({"region": "us-east-1"});
var PUBLIC_KEY = "e80b6bcf1f06434860c9a3215203ea01";
var PRIV_KEY = "0263c80cd25d6413fb170fa8d0271ca323966c9b";
var ts = new Date().getTime();
var HASH = CryptoJS.MD5(ts + PRIV_KEY + PUBLIC_KEY).toString();
var url = "http://gateway.marvel.com/v1/public/characters/{0}/comics?limit=100&ts={1}&apikey={2}&hash={3}&offset={4}";
var headers ={
  "x-api-key": "XXX"
}
module.exports.get = (event, context, callback) => {

http.get(url.format(event.id,ts,PUBLIC_KEY,HASH,event.offset,headers), (response) => {
  response.setEncoding('utf8');
  let totalData = "";
  response.on("data",(data)=>{
    totalData+=data;
  });
  response.on("end", (data) =>{
    let res = JSON.parse(totalData);
    let characterComics = getComicsNames(res);
    callback(null,characterComics);
  });
});

function getComicsNames(res){
  let comicObjects = res["data"]["results"];
  let characterComics = [];
  comicObjects.forEach((object) => {
    characterComics.push({
      "id": object.id,
      "title": object.title
    });
  });
  return characterComics;
}
}

// var getComicsCharacter = function(getUrl, callback){
//     var comicTotal;
//     var errorMessage = "Data not found";
//     var comics ="";
//     http.get(getUrl, (res) => {
//         res.setEncoding('utf8');
//         var totalData = "";
//
//         res.on("data", (data) => {
//             totalData += data;
//             console.log(data);
//         });
//
//         res.on("end", (data) => {
//             var comics = JSON.parse(totalData);
//             if(comics["data"]){
//                 comicTotal = comics["data"]["results"].map(function(event){
//                   return event.title;
//                 });
//             };
//
//             // console.log(comicTotal);
//         });
//         callback(null,comicTotal);
//     });
// };
