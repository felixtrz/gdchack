AFRAME.registerComponent("paint-erase-controls", {
  schema: {
    color: { default: "#02EE8B" },
    brushSize: { default: 10 },
    eraseSize: { default: 10 },
  },

  init: function () {
    this.painting = false;
    this.erasing = false;

    this.canvas = document.querySelector("#canvas-texture");
    this.ctx = this.canvas.getContext("2d");
    this.sphere = document.querySelector("#paint-sphere");

    this.canvas.width = 2048;
    this.canvas.height = 1024;
    this.ctx.fillStyle = "transparent";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.sphere.getObject3D("mesh").material.map = this.texture;

    this.el.addEventListener("triggerdown", () => {
      if (!this.intersection) return;

      if (this.erasing) {
        this.erasing = true;
      } else {
        this.painting = true;
      }
    });

    this.el.addEventListener("triggerup", () => {
      this.painting = false;
      this.erasing = false;
    });

    this.el.addEventListener("gripdown", () => {
      this.erasing = true;
    });

    this.el.addEventListener("gripup", () => {
      this.erasing = false;
    });

    this.peerRight = document.getElementById("peer-right");
  },

  tick: function () {
    const raycaster = this.el.components.raycaster;
    const intersections = raycaster.intersections;
    this.intersection = intersections.find(
      (intersection) => intersection.object.el === this.sphere
    );

    if (!this.intersection) return;

    if (this.painting) {
      this.paint();
    } else if (this.erasing) {
      this.erase();
    }

    this.el.setAttribute("painting", this.painting);
    this.el.setAttribute("erasing", this.erasing);
    this.el.setAttribute("brushSize", this.data.brushSize);
    this.el.setAttribute("eraseSize", this.data.eraseSize);
    this.el.setAttribute("intersection", this.intersection.uv.toArray());

    const peerUV = this.peerRight.getAttribute("intersection")?.split(",");
    const peerPainting = this.peerRight.getAttribute("painting");
    if (peerUV) {
      this.paintUV({ x: peerUV[0], y: peerUV[1] });
    }
  },

  paint: function () {
    const uv = this.intersection.uv;

    const x = Math.floor(uv.x * this.canvas.width);
    const y = Math.floor((1 - uv.y) * this.canvas.height);

    this.ctx.beginPath();
    this.ctx.arc(x, y, this.data.brushSize, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = this.data.color;
    this.ctx.fill();

    this.texture.needsUpdate = true;
  },

  paintUV: function (uv) {
    const x = Math.floor(uv.x * this.canvas.width);
    const y = Math.floor((1 - uv.y) * this.canvas.height);

    this.ctx.beginPath();
    this.ctx.arc(x, y, this.data.brushSize, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = this.data.color;
    this.ctx.fill();

    this.texture.needsUpdate = true;
  },

  erase: function () {
    const uv = this.intersection.uv;

    const x = Math.floor(uv.x * this.canvas.width);
    const y = Math.floor((1 - uv.y) * this.canvas.height);

    this.ctx.beginPath();
    this.ctx.arc(x, y, this.data.eraseSize, 0, 2 * Math.PI, false);
    this.ctx.globalCompositeOperation = "destination-out";
    this.ctx.fill();

    this.ctx.globalCompositeOperation = "source-over";
    this.texture.needsUpdate = true;
  },
});
