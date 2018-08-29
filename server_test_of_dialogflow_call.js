const express = require("express");
const dialogflow = require("dialogflow").v2beta1;
const fs = require("fs");
const app = express();
const privatekey = require("./dialogflow.json");
const common = require('@google-cloud/common');

app.set('static', __dirname + "/public");
// app.get('/', (req,res)=>{
//     res.send("Hello World");
// });
// app.listen(3030, ()=>{
//   console.log("Server started at 3000");
// }); 

const projectId = 'vodafone-support'; //https://dialogflow.com/docs/agents#settings
const sessionId = 'mydialogflowsesssion1234';
const query = 'hello';
const languageCode = 'en-US';

// Instantiates a sessison client

let sessionClient = new dialogflow.SessionsClient({keyFilename: 'vodafone-support-9b669a90d7d4.json'});

// The path to identify the agent that owns the created intent.
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

// const filename = 'Local path to audio file, e.g. /path/to/audio.raw';
// const encoding = 'Encoding of the audio file, e.g. LINEAR16';
// const sampleRateHertz = 16000;
// const languageCode = 'BCP-47 language code, e.g. en-US';
var filename = app.get("static") + "/audio/my_plan_mono.wav";
console.log(filename);
const audio = fs.readFileSync(filename).toString('base64');
//const readFile = common.util.promisify(fs.readFile, {singular: true});
// const readFile = common.util.promisify(fs.readFile,{singula:true});
// readFile(filename)
//     .then(inputAudio => {
//       // The audio query request
//       const request = {
//         session: sessionPath,
//         queryInput: {
//           audioConfig: {
//             audioEncoding: encoding,
//             sampleRateHertz: sampleRateHertz,
//             languageCode: languageCode,
//           },
//         },
//         inputAudio: inputAudio,
//       };
//       // Recognizes the speech in the audio and detects its intent.
//       return sessionClient.detectIntent(request);
//     })
//     .then(responses => {
//       console.log('Detected intent:');
//       logQueryResult(sessionClient, responses[0].queryResult);
//     })
//     .catch(err => {
//       console.error('ERROR:', err);
//     });

//The text query request.
const request = {
    session: sessionPath,
    queryInput: {
      audioConfig: {
        audioEncoding: "AUDIO_ENCODING_UNSPECIFIED",
        languageCode: "en-US",
        //sampleRateHertz: 48000,
      },
    },
    inputAudio: audio,
  };
// const request = {
//   session: sessionPath,
//   queryInput: {
//     text: {
//       text: "my plan",
//       languageCode: "en_US" ,
//     },
//   },
// };
  // console.log(request);
// Send request and log result
sessionClient
  .detectIntent(request)
  .then(responses => {
    console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log(responses);
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);
    } else {
      console.log(`  No intent matched.`);
    }
  })    
  .catch(err => {
    console.error('ERROR:', err);
  });
