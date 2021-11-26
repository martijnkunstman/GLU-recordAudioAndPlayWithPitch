const startRecording = document.querySelector('#startRecording');
const stopRecording = document.querySelector('#stopRecording');
const playRecorded = document.querySelector('#playRecorded');
const stopRecorded = document.querySelector('#stopRecorded');

const canvas = document.querySelector('.visualizer');
const canvasCtx = canvas.getContext("2d");
const pitchInput = document.querySelector('#pitch');
const pitchLabel = document.querySelector('#pitchLabel');

startRecording.addEventListener("click", async () => {
    await Tone.start();
    console.log("context started");
});

pitchInput.addEventListener('input', function () {
    pitchLabel.innerHTML = pitchInput.value;
}, false);

let audioCtx;
let pitchShift;
let player;

if (navigator.mediaDevices.getUserMedia) {

    const constraints = { audio: true };
    let chunks = [];

    let onSuccess = function (stream) {
        const mediaRecorder = new MediaRecorder(stream);

        visualize(stream);

        startRecording.addEventListener('click', function () {
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

function visualize(stream) {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }

    const source = audioCtx.createMediaStreamSource(stream);

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);

    draw()

    function draw() {
        const WIDTH = canvas.width
        const HEIGHT = canvas.height;

        requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = 'rgba(200, 200, 200, 0.05)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

        canvasCtx.beginPath();

        let sliceWidth = WIDTH * 1.0 / bufferLength;
        let x = 0;


        for (let i = 0; i < bufferLength; i++) {

            let v = dataArray[i] / 128.0;
            let y = v * HEIGHT / 2;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();

    }
}