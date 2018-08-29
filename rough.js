//Attach the audio file to AJAX and send it to server
$(document).ready(function(){
    var audiofile = null;
    var recorder = new WzRecorder({
		onRecordingStop: function(blob) {
			document.getElementById('player').src = URL.createObjectURL(blob);
            audiofile = URL.createObjectURL(blob);
            
            var xhr = new XMLHttpRequest();
            xhr.open('POST','/uploads', true);
            xhr.setRequestHeader('Content-Type', "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function() {//Call a function when the state changes.
                if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                    console.log("file uploaded successfully");
                }
            }

            xhr.send(audiofile);
		},
		onRecording: function(milliseconds) {
			document.getElementById('duration').innerText = milliseconds + 'ms';
		}
	});
    
    // wire up the microphone button to toggle recording
    document.getElementById('record').onclick = recorder.toggleRecording;
    //var test = recorder.upload("https://localhost:3300/upload");

        $("#chat_form").on('submit',function(e){
            e.preventDefault();
            
            var formdata = new FormData();
            formdata.append("audiofile",audiofile);
            $.ajax({
                url: '/uploads',
                method: 'post',
                data: formdata,
                success: function(data){
                    console.log(data);
                },
            });
            //upload_files(formdata);
        });

        function upload_files(formdata){
            
            $.ajax({
                url: '/uploads',
                method: 'post',
                data: formdata,
                success: function(data){
                    console.log(data);
                },
                error: function(err){
                    console.log(err);
                }
            });
        }
});

/* Anothe Approach of on submit form preventdefault when speaker button is inside the form
*/
$(document).ready(function(){
    
    $("#chat_form").on('submit',function(e){
        e.preventDefault(); 
        
    });

    var audioBlob = null;
        var recorder = new WzRecorder({
            onRecordingStop: function(blob) {
                document.getElementById('player').src = URL.createObjectURL(blob);
                audioBlob = URL.createObjectURL(blob);
                console.log(audioBlob);
                console.log("--------------------------");

                $.ajax({
                    url: '/uploads',
                    method: 'GET',
                    data: "hello",
                    success: function(data){
                        console.log(data);
                    }
                });
            },
            onRecording: function(milliseconds) {
                document.getElementById('duration').innerText = milliseconds + 'ms';
            }
	    });

        // wire up the microphone button to toggle recording
        document.getElementById('record').onclick = function(){ recorder.toggleRecording; recorder.upload('http://localhost/uploads') }
        console.log(audioBlob);
   
   
    });
	