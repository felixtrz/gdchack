const SPW_OPTIONS = {
  debug: true,
  serverUrl: "https://whereismypeer.net:8000",
  simplePeerOptions: {
    config: {
      iceServers: [
        {
          urls: ["stun:ws-turn6.xirsys.com"],
        },
        {
          username:
            "uvHExGwBOpO3rvQwF-nt56O_ohdzs_cA4XZ2-fmJRjmJ195k3LKD66x5V4iqHMdpAAAAAGLsC5VmZWxpeHo=",
          credential: "b8e6e188-1420-11ed-a07f-0242ac140004",
          urls: [
            "turn:ws-turn6.xirsys.com:80?transport=udp",
            "turn:ws-turn6.xirsys.com:3478?transport=udp",
            "turn:ws-turn6.xirsys.com:80?transport=tcp",
            "turn:ws-turn6.xirsys.com:3478?transport=tcp",
            "turns:ws-turn6.xirsys.com:443?transport=tcp",
            "turns:ws-turn6.xirsys.com:5349?transport=tcp",
          ],
        },
      ],
    },
  },
};

AFRAME.registerComponent("multiplayer-controls", {
  schema: {
    color: { default: "#02EE8B" },
    brushSize: { default: 10 },
    eraseSize: { default: 10 },
  },

  init: function () {
    const startButton = document.getElementById("start-button");
    const sessionIdBox = document.getElementById("session-id");
    const peerRight = document.getElementById("peer-right");
    const onConnect = (isHost) => {
      console.log(isHost, "connected");
    };

    const onCreated = (room) => {
      sessionIdBox.disabled = true;
      sessionIdBox.value = room;
      startButton.disabled = true;
      console.log("Connected", room);
    };

    const onData = (payload) => {
      const data = JSON.parse(payload.data);
      peerRight.object3D.position.fromArray(data.position);
      peerRight.object3D.quaternion.fromArray(data.quaternion);
      peerRight.setAttribute("painting", data.painting);
      peerRight.setAttribute("erasing", data.erasing);
      peerRight.setAttribute("brushSize", data.brushSize);
      peerRight.setAttribute("eraseSize", data.eraseSize);
      peerRight.setAttribute("intersection", data.intersection);
    };

    startButton.onclick = () => {
      SPW_OPTIONS.isInitiator = sessionIdBox.value.length == 0;

      if (!SPW_OPTIONS.isInitiator) {
        SPW_OPTIONS.sessionId = sessionIdBox.value.toUpperCase();
      }

      this.spw = new SimplePeerWrapper(SPW_OPTIONS);

      // Make the peer connection
      this.spw.connect();

      // Do something when the connection is made
      this.spw.on("connect", () => {
        onConnect(SPW_OPTIONS.isInitiator);
      });

      // When data recieved over the connection call gotData
      this.spw.on("data", onData);

      this.spw.on("error", (error) => {
        // eslint-disable-next-line no-undef
        console.log(error);
      });

      this.spw.onCreated(onCreated);
    };
  },

  tick: function () {
    if (this.spw) {
      const rightHand = document.getElementById("right-hand");

      const data = {
        position: rightHand.object3D.position.toArray(),
        quaternion: rightHand.object3D.quaternion.toArray(),
        painting: rightHand.getAttribute("painting"),
        erasing: rightHand.getAttribute("erasing"),
        brushSize: rightHand.getAttribute("brushSize"),
        eraseSize: rightHand.getAttribute("eraseSize"),
        intersection: rightHand.getAttribute("intersection"),
      };
      this.spw.send(JSON.stringify(data));
    }
  },
});
