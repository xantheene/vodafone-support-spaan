const express = require("express");
const multer = require("multer");
const bodyparser = require("body-parser");
const fs = require("fs");
const app = express();
// const sendaudio = require("sendAudio.js");
const dialogflow = require("dialogflow").v2beta1;
const privatekey = require("./dialogflow.json");
const common = require('@google-cloud/common');
const PORT = process.env.PORT || 3000;
app.set("static", __dirname+"/public");

//Body parser middleware
app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json())

//Dialogflfow settings
const projectId = 'vodafone-support'; //https://dialogflow.com/docs/agents#settings
const sessionId = 'mydialogflowsesssion1234';
const query = 'hello';
const languageCode = 'en-US';

// Instantiates a sessison client

let sessionClient = new dialogflow.SessionsClient({keyFilename: 'vodafone-support-9b669a90d7d4.json'});

// The path to identify the agent that owns the created intent.
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

app.use(express.static("public"));
//app.use(bodyparser.json());
app.get('/',(req,res)=>{
    console.log(app.get("static"));
    res.sendFile(app.get("static")+ "/html/index.html");
    //res.sendFile(app.get("static")+ "/html/test.html");
    
});
app.post('/upload', (req,res)=> {
    console.log(req.body);
    res.send("Hello");
});

var upload = multer({ dest: __dirname + '/public/uploads/' });
var type = upload.single('audio');


app.post('/api/test', type, function (req, res) {
   console.log(req.body);
   console.log(req.file);
//    console.log("The converted base64 file is");
//    console.log("------------------------------")
   const audio = fs.readFileSync(req.file.path).toString("base64");
//    console.log(audio);
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
    // Send request and log result
    sessionClient
    .detectIntent(request)
    .then(responses => {
        
        console.log('Detected intent');
        var result = responses[0].queryResult;
        var audio_buff = responses[0].outputAudio;
        var audio = audio_buff.toString('base64');
        console.log(responses);
        console.log("-------------------");
        console.log(audio);

        //console.log(audio);
        res.send({
            audio : audio,
            result :result
        });
        
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
});



app.listen(PORT, function(e){
    console.log(`Server is up at ${PORT}`);
    console.log(e);
});


