'use strict'

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
var getComicsTemplateUrl = "http://gateway.marvel.com/v1/public/characters/{0}/series?apikey={1}&ts={2}&hash={3}&limit={4}&offset={5}";
var headers ={
  headers:{'x-api-key': 'XXXXX'}
}
module.exports.get = (event, context, callback) => {
  http.get(getComicsTemplateUrl.format(event.path.id, PUBLIC_KEY, ts, HASH, 1, 0),headers, (response) => {
   response.setEncoding('utf8');
   let totalData = "";
   response.on("data", (data) => {
     totalData += data;
   });
   response.on("end", (data) => {
     let res = JSON.parse(totalData);
     let total = parseInt(res["data"]["total"]);
     let iterations = Math.ceil(total/100);
     let tasks = [];

     for (let index = 0; index < iterations; index++) {
       let offset = index * 100;
       tasks.push(function(callback){
         var lambdaParams = {
         FunctionName : 'isaac-service-dev-SeriesSingle',
         InvocationType : 'RequestResponse',
         Payload: '{ "id": "' + event.path.id + '", "offset": "' + offset + '"}'
        };
         lambda.invoke(lambdaParams, function(error, data){
           if(error){
             callback(error);
           }
           else{
             callback(null, data);
           }
         });
       });
     }

     async.parallel(tasks, function(error, data){
       if(error){
         callback(error);
       }
       else{
         let characterComics = [];
         for (let index = 0; index < data.length; index++) {
           characterComics.push.apply(characterComics, JSON.parse(data[index].Payload));
         }
         callback(null, characterComics);
       }
     });
   });
 });
 }


// 'use strict'
//
// var async = require("async");
// var AWS = require("aws-sdk");
// var http = require("http");
// var CryptoJS = require('crypto-js');
// require("string_format");
//
// var lambda = new AWS.Lambda({"region": "us-east-1"});
// var PUBLIC_KEY = "e80b6bcf1f06434860c9a3215203ea01";
// var PRIV_KEY = "0263c80cd25d6413fb170fa8d0271ca323966c9b";
// var ts = new Date().getTime();
// var HASH = CryptoJS.MD5(ts + PRIV_KEY + PUBLIC_KEY).toString();
// var getComicsTemplateUrl = "http://gateway.marvel.com/v1/public/characters/{0}/series?limit=1&ts={1}&apikey={2}&hash={3}";
//
// module.exports.get = (event, context, callback) => {
//     var firstCharacterGetComicsUrl = getComicsTemplateUrl.format(event.firstCharacterId, ts, PUBLIC_KEY, HASH);
//     var secondCharacterGetComicsUrl = getComicsTemplateUrl.format(event.secondCharacterId, ts, PUBLIC_KEY, HASH);
//
//     async.parallel([
//         function(callback){
//             async.waterfall([
//                     async.apply(getCharacterDataSimple, firstCharacterGetComicsUrl),
//                     async.apply(invokeLambdas,event.firstCharacterId)
//
//                 ]
//                 , callback)
//
//         },
//          function(callback){
//             async.waterfall([
//                     async.apply(getCharacterDataSimple, secondCharacterGetComicsUrl),
//                     async.apply(invokeLambdas,event.secondCharacterId)
//                 ]
//                 , callback)
//
//         }
//         ], function(error, data){
//
//     });
// }
//
// var getCharacterDataSimple = function(getUrl, callback){
//     var comicTotal;
//     var errorMessage = "Data not found";
//
//     http.get(getUrl, (res) => {
//         res.setEncoding('utf8');
//         var totalData = "";
//
//         res.on("data", (data) => {
//             totalData += data;
//         });
//
//         res.on("end", (data) => {
//             var comics = JSON.parse(totalData);
//             if(comics["data"]){
//                 comicTotal = comics["data"]["total"];
//                 console.log(comicTotal);
//             }else{
//                 callback(errorMessage, comicTotal);
//             };
//             callback(null,comicTotal);
//             console.log(comicTotal);
//         });
//     });
// };
//
// var invokeLambdas = function(characterId, comicCount, callback){
//   console.log(characterId+comicCount+callback);
//     var lambdaCount = Math.ceil(comicCount / 100);
//     var tasks = [];
//
//     for(let index = 0; index < lambdaCount; index++ ){
//         var offset = index*100;
//
//         tasks.push(function(callback){
//             var lambdaParams = {
//                 FunctionName : 'isaac-service-dev-SeriesSingle',
//                 InvocationType : 'RequestResponse',
//                 Payload: '{ "characterId": "' + characterId + '", "offset": "' + offset + '"}'
//             };
//             lambda.invoke(lambdaParams, function(error, data){
//                 if(error){
//                     console.log(error);
//                     callback(error);
//                 }
//                 else{
//                   console.log(data);
//                     callback(null, data);
//                 }
//             });
//         });
//     };
//
//     async.parallel(tasks, function(error, data){
//       if(error){
//           console.log("This is your error in Parallel"+error);
//       }else{
//         var comics = []
//         for(let index = 0 ; index < data.length ; index++){
//             comics = comics.concat(data[index].Payload);
//         };
//       }
//     });
// };
