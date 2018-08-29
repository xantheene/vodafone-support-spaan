
 function base64toBlob(base64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 1024;
    var byteCharacters = atob(base64Data);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);

        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}
 // wire up the microphone button to toggle recording
	//document.getElementById('record').onclick = recorder.toggleRecording;
var recordbtn = document.getElementById('record');
var recorded_audio = null;
var r = new WzRecorder(
    {
        onRecordingStop: function(blob){ 
            // console.log("from config object blob");
            // console.log("------------------");
             console.log(blob);
            // recorded_audio = r.blob;
            // console.log("after assigning it to global variable");
            // console.log("------------");
            // console.log(recorded_audio); //This is the correct way to capture the blob, don't touch this
            //var myBlob = new Blob(["This is my blob content"], {type : "text/plain"});
            //console.log(myBlob);

            // here unnecessary - just for testing if it can be read from local storage
            localStorage.myfile = recorded_audio;

            var fd = new FormData(); 
            fd.append('audio',blob, 'recording.wav');

            fetch('/api/test',
            {
                method: 'post',
                body: fd
            }).then(function(res){
                console.log(res);
                return res.json();
            }).then(function(data){
                console.log(data);
                var blob = base64toBlob(data.audio,'audio/mp3');
                var src_audio = window.URL.createObjectURL(blob);
                $("#player").attr('src', src_audio).get(0).play();
                // if(Array.isArray(data.audio.data)){
                //     console.log("Its an array");
                //     var blob = new Blob(data.audio.data, {type:"audio/wav"});
                //     var audio = URL.createObjectURL(blob);
                //     console.log(audio);
                //     var audio_ele = $("#player"); 
                //     console.log(audio_ele);
                //     $("#player").attr('src', audio).get(0).play();
                // }else{
                //     console.log("Not an array");
                // }
                console.log(data.audio);
                console.log(data.result);
                //var json_obj = JSON.parse(data.audio);
                //console.log(json_obj);

            });
            // .then(function(myBlob){
            //     console.log(myBlob);
            //     var audio = URL.createObjectURL(myBlob);
            //     console.log(audio);
            //     var audio_ele = $("#player"); 
            //     console.log(audio_ele);
            //     $("#player").attr('src', audio).get(0).play();
            //     // var blob;
            //     // if(Array.isArray(myBlob)){
            //     //     blob = new Blob(myBlob, {type:"audio/wav"});
            //     //     var audio = URL.createObjectURL(blob);
            //     //     console.log(audio);
            //     //     var audio_ele = $("#player"); 
            //     //     console.log(audio_ele);
            //     //     $("#player").attr('src', audio).get(0).play();
            //     // }else{
            //     //     console.log("The returned value is not array");
            //     // }

                
            // }); 
        },
        onRecording: function(ms){
            // console.log("from config object MS");
            // console.log("_____________________");
            // console.log(ms);
        }

    }
);
recordbtn.onclick = function(){
    r.toggleRecording();
    console.log("after toggling the button");
    console.log("------------");
    console.log(r.blob);
   
};

function WzRecorder(config) {

    config = config || {};
    
    var self = this;
    var audioInput;
    var audioNode;
    var bufferSize = config.bufferSize || 4096;
    var recordedData = [];
    var recording = false;
    var recordingLength = 0;
	var startDate;
	var audioCtx;
	
	this.toggleRecording = function()
	{
		recording ? self.stop() : self.start();
	}
	

    this.start = function() {

		// reset any previous data
		recordedData = [];
		recordingLength = 0;
		
		// webkit audio context shim
		audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        if (audioCtx.createJavaScriptNode) {
            audioNode = audioCtx.createJavaScriptNode(bufferSize, 1, 1);
        } else if (audioCtx.createScriptProcessor) {
            audioNode = audioCtx.createScriptProcessor(bufferSize, 1, 1);
        } else {
            throw 'WebAudio not supported!';
        }

        audioNode.connect(audioCtx.destination);

        navigator.mediaDevices.getUserMedia({audio: true})
            .then(onMicrophoneCaptured)
            .catch(onMicrophoneError);
    };

    this.stop = function() {
        stopRecording(function(blob) {
			self.blob = blob;
			config.onRecordingStop && config.onRecordingStop(blob);
        });
    };
	
	this.upload = function (url) {
        var formData = new FormData();
        formData.append("audio", self.blob, config.filename || 'recording.wav');
        console.log(url);
        // for (var i in params)
        //     formData.append(i, params[i]);

        var request = new XMLHttpRequest(); 
        request.upload.addEventListener("loadend", function(e){
            console.log(e);
        });
        // request.upload.addEventListener("progress", function (e) {
        //     callback('progress', e, request);
        // });
        // request.upload.addEventListener("load", function (e) {
        //     callback('load', e, request);
        // });

		// request.onreadystatechange = function (e) {
		// 	var status = 'loading';
		// 	if (request.readyState == 4)
		// 	{
		// 		status = request.status == 200 ? 'done' : 'error';
		// 	}
		// 	callback(status, e, request);
		// };
  
        request.open("POST", url);
        request.send(formData);
    };


    function stopRecording(callback) {
        // stop recording
        recording = false;

        // to make sure onaudioprocess stops firing
		window.localStream.getTracks().forEach( (track) => { track.stop(); });
        audioInput.disconnect();
        audioNode.disconnect();
		
        exportWav({
            sampleRate: sampleRate,
            recordingLength: recordingLength,
            data: recordedData
        }, function(buffer, view) {
            self.blob = new Blob([view], { type: 'audio/wav' });
            callback && callback(self.blob);
        });
    }


    function onMicrophoneCaptured(microphone) {

		if (config.visualizer)
			visualize(microphone);
		
		// save the stream so we can disconnect it when we're done
		window.localStream = microphone;

        audioInput = audioCtx.createMediaStreamSource(microphone);
        audioInput.connect(audioNode);

        audioNode.onaudioprocess = onAudioProcess;

        recording = true;
		self.startDate = new Date();
		
		config.onRecordingStart && config.onRecordingStart();
		sampleRate = audioCtx.sampleRate;
    }

    function onMicrophoneError(e) {
		console.log(e);
		alert('Unable to access the microphone.');
    }

    function onAudioProcess(e) {
        if (!recording) {
            return;
        }

        recordedData.push(new Float32Array(e.inputBuffer.getChannelData(0)));
        recordingLength += bufferSize;

        self.recordingLength = recordingLength;
		self.duration = new Date().getTime() - self.startDate.getTime();

		config.onRecording && config.onRecording(self.duration);
    }

	
	function visualize(stream) {
		var canvas = config.visualizer.element;
		if (!canvas)
			return;
			
		var canvasCtx = canvas.getContext("2d");
		var source = audioCtx.createMediaStreamSource(stream);

		var analyser = audioCtx.createAnalyser();
		analyser.fftSize = 2048;
		var bufferLength = analyser.frequencyBinCount;
		var dataArray = new Uint8Array(bufferLength);

		source.connect(analyser);

		function draw() {
			// get the canvas dimensions
			var width = canvas.width, height = canvas.height;

			// ask the browser to schedule a redraw before the next repaint
			requestAnimationFrame(draw);

			// clear the canvas
			canvasCtx.fillStyle = config.visualizer.backcolor || '#fff';
			canvasCtx.fillRect(0, 0, width, height);

			if (!recording)
				return;
			
			canvasCtx.lineWidth = config.visualizer.linewidth || 2;
			canvasCtx.strokeStyle = config.visualizer.forecolor || '#f00';

			canvasCtx.beginPath();

			var sliceWidth = width * 1.0 / bufferLength;
			var x = 0;

			
			analyser.getByteTimeDomainData(dataArray);

			for (var i = 0; i < bufferLength; i++) {
			
				var v = dataArray[i] / 128.0;
				var y = v * height / 2;

				i == 0 ? canvasCtx.moveTo(x, y) : canvasCtx.lineTo(x, y);
				x += sliceWidth;
			}
		
			canvasCtx.lineTo(canvas.width, canvas.height/2);
			canvasCtx.stroke();
		}
		
		draw();
	}
	
    function exportWav(config, callback) {
        function inlineWebWorker(config, cb) {

            var data = config.data.slice(0);
            var sampleRate = config.sampleRate;          
			data = joinBuffers(data, config.recordingLength);
		
            function joinBuffers(channelBuffer, count) {
                var result = new Float64Array(count);
                var offset = 0;
                var lng = channelBuffer.length;

                for (var i = 0; i < lng; i++) {
                    var buffer = channelBuffer[i];
                    result.set(buffer, offset);
                    offset += buffer.length;
                }

                return result;
            }

            function writeUTFBytes(view, offset, string) {
                var lng = string.length;
                for (var i = 0; i < lng; i++) {
                    view.setUint8(offset + i, string.charCodeAt(i));
                }
            }

            var dataLength = data.length;

            // create wav file
            var buffer = new ArrayBuffer(44 + dataLength * 2);
            var view = new DataView(buffer);
			
            writeUTFBytes(view, 0, 'RIFF'); // RIFF chunk descriptor/identifier
            view.setUint32(4, 44 + dataLength * 2, true); // RIFF chunk length
            writeUTFBytes(view, 8, 'WAVE'); // RIFF type
            writeUTFBytes(view, 12, 'fmt '); // format chunk identifier, FMT sub-chunk
            view.setUint32(16, 16, true); // format chunk length
            view.setUint16(20, 1, true); // sample format (raw)
            view.setUint16(22, 1, true); // mono (1 channel)
            view.setUint32(24, sampleRate, true); // sample rate
            view.setUint32(28, sampleRate * 2, true); // byte rate (sample rate * block align)
            view.setUint16(32, 2, true); // block align (channel count * bytes per sample)
            view.setUint16(34, 16, true); // bits per sample
            writeUTFBytes(view, 36, 'data'); // data sub-chunk identifier
            view.setUint32(40, dataLength * 2, true); // data chunk length

            // write the PCM samples
            var index = 44;
            for (var i = 0; i < dataLength; i++) {
                view.setInt16(index, data[i] * 0x7FFF, true);
                index += 2;
            }

            if (cb) {
                return cb({
                    buffer: buffer,
                    view: view
                });
            }

            postMessage({
                buffer: buffer,
                view: view
            });
        }

        var webWorker = processInWebWorker(inlineWebWorker);

        webWorker.onmessage = function(event) {
            callback(event.data.buffer, event.data.view);

            // release memory
            URL.revokeObjectURL(webWorker.workerURL);
        };

        webWorker.postMessage(config);
    }

    function processInWebWorker(_function) {
        var workerURL = URL.createObjectURL(new Blob([_function.toString(),
            ';this.onmessage = function (e) {' + _function.name + '(e.data);}'
        ], {
            type: 'application/javascript'
        }));

        var worker = new Worker(workerURL);
        worker.workerURL = workerURL;
        return worker;
    }
}