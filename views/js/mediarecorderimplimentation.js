var socket = io();
var peer,
  recorder,
  videodiv = document.getElementById("video"),
  LOCALSTREAM,
  REMOTESTREAM;

function SendRoom() {
  room = document.getElementById("room").value;
  socket.emit("room", room);
}
socket.on("initiator", (initiator) => {
  if (initiator !== "roomfull") {
    peer = new SimplePeer({
      initiator: initiator[0],
      trickle: false,
    });
    if (!initiator[0]) {
      offer = JSON.stringify(initiator[1]);
      peer.signal(offer);
    }
    if (initiator[0]) {
      socket.on("answer", (sdp) => {
        peer.signal(sdp);
        socket.close();
      });
    }
    peer.on("signal", (sdp) => {
      socket.emit("sdp", { sdp, room });
      if (!initiator[0]) socket.close();
    });
    peer.on("data", (data) => (video.srcObject = new Blob(data)));
  } else alert("haha sucks to be you the room is already taken");
});
var video = document.createElement("video");
video.setAttribute("playsinline", "");
video.setAttribute("autoplay", "");
video.setAttribute("muted", "");
video.style.width = "200px";
video.style.height = "200px";

/* Setting up the constraint */
var facingMode = "user"; // Can be 'user' or 'environment' to access back or front camera (NEAT!)
var constraints = {
  audio: true,
  video: {
    facingMode: facingMode,
  },
};
/* Stream it to video element */
navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
  LOCALSTREAM = stream;
});
if (LOCALSTREAM !== undefined) {
  recorder = new MediaRecorder(LOCALSTREAM);
  recorder.ondataavailable = (e) => peer.send(new Uint8Array(e.data));
  recorder.stop();
  recorder.onstop = (e) => recorder.start();
}
videodiv.appendChild(video);
