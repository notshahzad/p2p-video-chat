const socket = io();
const peer = new RTCPeerConnection();
var dc;
var LOCALSTREAM, REMOTESTREAM;
var room = document.getElementById("room").value;
function SendRoom() {
  socket.emit("room", room);
}
function SendLocalDescription() {
  sdp = peer.localDescription;
  socket.emit("sdp", { sdp, room });
}
socket.on("initiator", (initiator) => {
  peer.onicecandidate = (e) => {
    SendLocalDescription();
  };
  if (initiator[0] === true) {
    dc = peer.createDataChannel("channel");
    dc.onmessage = (e) => console.log(e.data);
    dc.onopen = (e) => console.log("connection opened");
    peer.createOffer().then((offer) => peer.setLocalDescription(offer));
    socket.on("answer", (answer) => {
      peer.setRemoteDescription(answer);
    });
  } else if (initiator[0] === false) {
    peer.ondatachannel = (e) => {
      console.log("connection opened");
      dc = e.channel;
      dc.onmessage = (e) => {
        console.log(e.data);
      };
    };
    offer = initiator[1];
    peer.setRemoteDescription(offer);
    peer.createAnswer().then((answer) => peer.setLocalDescription(answer));
  }
});
var local = document.createElement("video");
local.setAttribute("playsinline", "");
local.setAttribute("autoplay", "");
local.style.height = "400px";
local.style.width = "400px";
var remote = local.cloneNode(true);
local.muted = true;
videodiv = document.getElementById("video");
var facingMode = "user";
var constraints = {
  audio: true,
  local: { facingMode: facingMode },
};
navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
  LOCALSTREAM = stream;
  local.srcObject = LOCALSTREAM;
  peer.addStream(LOCALSTREAM);
  videodiv.appendChild(local);
});
function VideoStream() {
  REMOTESTREAM = peer.getRemoteStreams()[0];
  remote.srcObject = REMOTESTREAM;
  videodiv.appendChild(remote);
}
