
let startRecording = document.querySelector('#startRecording');
let stopRecording = document.querySelector('#stopRecording');
let playRecorded = document.querySelector('#playRecorded');

startRecording.addEventListener('click', function () {
    startRecording.setAttribute("disabled","true")  
    stopRecording.removeAttribute("disabled")  
});

stopRecording.addEventListener('click', function () {
    stopRecording.setAttribute("disabled","true")  
    playRecorded.removeAttribute("disabled") 
});

playRecorded.addEventListener('click', function () {
    playRecorded.setAttribute("disabled","true")  
});

let pitchInput = document.querySelector('#pitch');
let pitchLabel = document.querySelector('#pitchLabel');

pitchInput.addEventListener('input', function () {
    pitchLabel.innerHTML = pitchInput.value;
}, false);