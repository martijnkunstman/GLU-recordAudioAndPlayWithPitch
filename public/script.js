
const startRecording = document.querySelector('#startRecording');
const stopRecording = document.querySelector('#stopRecording');
const playRecorded = document.querySelector('#playRecorded');
const canvas = document.querySelector('.visualizer');
const canvasCtx = canvas.getContext("2d");
const pitchInput = document.querySelector('#pitch');
const pitchLabel = document.querySelector('#pitchLabel');

pitchInput.addEventListener('input', function () {
    pitchLabel.innerHTML = pitchInput.value;
}, false);

let audioCtx;

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
            audio.play();
        });

        const audio = document.createElement('audio');
        audio.setAttribute('controls', '')

        audio.addEventListener("ended", function (e) {
            startRecording.disabled = false;
            stopRecording.disabled = true;
            playRecorded.disabled = true;
        })

        mediaRecorder.onstop = function (e) {
            const blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
            chunks = [];
            const audioURL = window.URL.createObjectURL(blob);
            audio.src = audioURL;
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

        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
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