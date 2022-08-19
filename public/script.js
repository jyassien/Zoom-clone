// const { text } = require("body-parser");

// const { Socket } = require("engine.io");
const socket = io("/");

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3030",
});

const videoGrid = document.getElementById("video-grid");

const myVideo = document.createElement("video");
myVideo.muted = true;

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });

    // Chat Section

    let text = $("input");
    // console.log(text);

    $("html").keydown((e) => {
      if (e.which == 13 && text.val().length !== 0) {
        console.log("From client: ", text.val());

        socket.emit("message", text.val());
        text.val("");
      }
    });

    socket.on("createMessage", (message) => {
      console.log("From Server: ", message);
      $(".messages").append(
        `<li class="message"> <b> user </b> <br/ > ${message} </li>`
      );
      scrollToBottom();
    });
  });

peer.on("open", (id) => {
  //   console.log(id);
  socket.emit("join-room", ROOM_ID, id);
});

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

const connectToNewUser = (userId, stream) => {
  //   console.log(userId);
  //   console.log("new user");
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const scrollToBottom = () => {
  let d = $("main__char__window");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
  //   console.log(myVideoStream);
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `<i class="fas fa-microphone"></i> <span> Mute </span>`;
  document.querySelector(".main__mute__button").innerHTML = html;
};
const setUnmuteButton = () => {
  const html = `<i class="unmute fas fa-microphone-slash"></i> <span> Unmute </span>`;
  document.querySelector(".main__mute__button").innerHTML = html;
};

const playStop = () => {
  //   console.log("object");
  let enabled = myVideoStream.getVideoTracks()[0].enabled;

  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setPlayVideo = () => {
  const html = `<i class="stop fas fa-video-slash"></i> <span>Play Video</span>`;
  document.querySelector(".main__video__button").innerHTML = html;
};
const setStopVideo = () => {
  const html = `<i class="fas fa-video"></i> <span>Stop Video</span>`;
  document.querySelector(".main__video__button").innerHTML = html;
};
