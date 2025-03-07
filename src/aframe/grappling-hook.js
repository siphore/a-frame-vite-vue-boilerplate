AFRAME.registerComponent("grappling-hook", {
  schema: {
    maxDistance: { type: "number", default: 15 },
    retractSpeed: { type: "number", default: 5 },
    swingDamping: { type: "number", default: 0.92 },
    pullStrength: { type: "number", default: 10 },
    gravity: { type: "number", default: 9.81 },
    isHooked: { type: "boolean", default: false },
  },

  init: function () {
    this.hookPoint = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.head = document.querySelector("#head");

    this.shootHook = this.shootHook.bind(this);
    this.releaseHook = this.releaseHook.bind(this);
    this.pull = this.pull.bind(this);

    // Create a visible rope
    this.rope = document.createElement("a-entity");
    this.rope.setAttribute("line", "color: #ff0000");
    this.el.sceneEl.appendChild(this.rope);

    // VR
    this.el.addEventListener("triggerdown", this.shootHook);
    this.el.addEventListener("triggerup", this.releaseHook);
    this.el.addEventListener("gripdown", this.pull);

    // Desktop
    window.addEventListener("keydown", (e) => {
      if (e.key === " ") {
        if (this.data.isHooked) this.releaseHook();
        else this.shootHook();
      }
      if (e.key.toLowerCase() === "e") {
        this.pull();
      }
    });
  },

  shootHook: function () {
    if (this.data.isHooked) return;

    const raycaster = new THREE.Raycaster();
    const origin = new THREE.Vector3();
    this.el.object3D.getWorldPosition(origin);
    const direction = new THREE.Vector3();
    this.el.object3D.getWorldDirection(direction).negate();

    raycaster.set(origin, direction);

    const objectsToCheck = Array.from(
      document.querySelectorAll(".hookable")
    ).map((el) => el.object3D);

    const intersects = raycaster.intersectObjects(objectsToCheck, true);

    if (
      intersects.length > 0 &&
      intersects[0].distance <= this.data.maxDistance
    ) {
      this.hookPoint.copy(intersects[0].point);
      this.el.setAttribute("grappling-hook", "isHooked", true); // ✅ Properly update A-Frame attribute
    }
  },

  releaseHook: function () {
    this.el.setAttribute("grappling-hook", "isHooked", false); // ✅ Properly update A-Frame attribute
  },

  pull: function () {
    if (!this.data.isHooked || !this.head) return;

    const pullDirection = new THREE.Vector3()
      .subVectors(this.hookPoint, this.head.object3D.position)
      .normalize();

    // Scale pull force appropriately.
    const pullForce = pullDirection.multiplyScalar(
      this.data.pullStrength * 0.8
    );

    // Emit an event with the pull force.
    this.el.emit("apply-pull-force", { force: pullForce }, false);
  },

  tick: function (time, delta) {
    // Update rope position if the hook is active.
    if (this.data.isHooked) {
      const headPosition = new THREE.Vector3();
      this.head.object3D.getWorldPosition(headPosition);
      this.rope.setAttribute(
        "line",
        `start: ${headPosition.x} ${headPosition.y - 0.5} ${headPosition.z}; end: ${this.hookPoint.x} ${this.hookPoint.y} ${this.hookPoint.z}; color: #ff0000`
      );
    } else {
      this.rope.setAttribute(
        "line",
        "start: 0 0 0; end: 0 0 0; color: #ff0000"
      );
    }
  },
});
