const startRecording = document.querySelector('#startRecording');
const stopRecording = document.querySelector('#stopRecording');
const playRecorded = document.querySelector('#playRecorded');
const stopRecorded = document.querySelector('#stopRecorded');
const pitchInput = document.querySelector('#pitch');
const pitchLabel = document.querySelector('#pitchLabel');
const constraints = { audio: true };

let pitchShift;
let player;
let chunks = [];

pitchInput.addEventListener('input', function () {
    pitchLabel.innerHTML = pitchInput.value;
}, false);

if (navigator.mediaDevices.getUserMedia) {

    let onSuccess = function (stream) {
        const mediaRecorder = new MediaRecorder(stream);

        startRecording.addEventListener('click', async () => {
            await Tone.start();
            startRecording.disabled = true;
            stopRecording.disabled = false;
            mediaRecorder.start();
        });

        stopRecording.addEventListener('click', function () {
            stopRecording.disabled = true;
            playRecorded.disabled = false;
            mediaRecorder.stop();
        });

        playRecorded.addEventListener('click', function () {
            playRecorded.disabled = true;
            stopRecorded.disabled = false;
            player.loop = true;
            player.start();
        });

        stopRecorded.addEventListener('click', function () {
            stopRecorded.disabled = true;
            startRecording.disabled = false;
            player.stop();
        });

        mediaRecorder.onstop = function (e) {
            const blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
            chunks = [];
            const audioURL = window.URL.createObjectURL(blob);
            pitchShift = new Tone.PitchShift().toDestination();
            pitchShift.pitch = parseFloat(pitchInput.value);
            player = new Tone.Player(audioURL).connect(pitchShift);
        }

        mediaRecorder.ondataavailable = function (e) {
            chunks.push(e.data);
        }
    }

    let onError = function (err) {
        console.log('The following error occured: ' + err);
    }

    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

} else {
    console.log('getUserMedia not supported on your browser!');
}