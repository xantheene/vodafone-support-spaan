const firebase = require("firebase-functions");
var request, response, parameters;
exports.dialogflowFirebaseFulfillment = firebase.https.onRequest((req,res) => {
    request =req;
    response = res;
    console.log("Test bot Request headers " + JSON.stringify(request.headers));
    console.log("Tes bot Request Body " + JSON.stringify(request.body));

    if(request.body.queryResult){
        processV2Request();

    }else{
        console.log("Invalid Request");
        return response.status(400).end('Invalid Webhook Requset');
    }
});

    const intentHandlers = {
        'input.welcome' : () => {
            sendResponse('Hello, Welcome to the Test Bot. Please Enter your Pin');
        },
        'input.unknown' : () => {
            sendResponse('Please enter your pin again');
        },
        'input.pin' : () => {
            if(validatePin()){
                //if the input pin is one of from valid_pin then ask for other name
                sendResponse("The pin is correct");
            }else{
                // or call the default intent
                //sendInvalidPin('Invalid pin, please try again');
                sendResponse("Please retype your pin");
            }
        },
        'default' : () => {
            sendResponse('This is the default intent');
        }

    };

    const valid_pin = [
        { 
            'pin' : '1234'
        },
        {
            'pin' : '4567'
        }

    ];

    function validatePin(){
        parameters = request.body.queryResult.parameters
        if(parameters.sin === '1234'){
            return true;
        }else{
            return false;
        }

        
    }

    function sendResponse(responseToUser){
        let responseJson = {fulfillmentText : responseToUser};
        console.log("Response to the User is " + JSON.stringify(responseJson));
        response.json(responseJson);
    }

    function processV2Request(){
        let action = (request.body.queryResult.action) ? request.body.queryResult.action : 'default';

        if(intentHandlers[action]){
            intentHandlers[action]();
        }else{
            intentHandlers['default']();
        }
    }
