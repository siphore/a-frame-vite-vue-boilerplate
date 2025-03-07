AFRAME.registerComponent("simple-physics", {
  schema: {
    enabled: { default: true },
    gravity: { default: -9.81 },
    // e.g. ropeLength could be stored in the grappling-hook or here
  },

  init: function () {
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.didHit = true;
    this.el.addEventListener("navmesh-hit", (evt) => {
      this.didHit = evt.detail.didHit;
    });
    this.el.addEventListener("apply-pull-force", (evt) => {
      // Apply the received force to our velocity.
      this.velocity.add(evt.detail.force);
    });
    this.physicsPosition = new THREE.Vector3();
    // Get the initial world position once.
    this.el.object3D.getWorldPosition(this.physicsPosition);
  },

  tick: function (time, timeDelta) {
    if (!this.data.enabled) return;

    const dt = timeDelta / 1000; // seconds
    const hookComp = this.el.components["grappling-hook"];
    const hookPoint = hookComp?.hookPoint;
    const ropeLength = hookComp?.data.maxDistance;
    const isHooked = hookComp?.data.isHooked;

    // 1) Apply gravity at all times
    if (!this.didHit) this.velocity.y += this.data.gravity * dt;
    else this.velocity = new THREE.Vector3();
    this.physicsPosition.addScaledVector(this.velocity, dt);

    // 2) Integrate position using velocity * dt
    this.el.object3D.getWorldPosition(this.position); // get current
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.position.z += this.velocity.z * dt;

    // 3) Enforce rope constraint if hooked
    if (isHooked && hookPoint && ropeLength !== undefined) {
      const disp = new THREE.Vector3().subVectors(this.position, hookPoint);
      const dist = disp.length();
      if (dist > ropeLength) {
        // Project position back onto rope circle
        disp.setLength(ropeLength);
        this.position.copy(hookPoint).add(disp);

        // Remove only outward radial velocity
        const radialDir = disp.clone().normalize();
        const vRadial = this.velocity.dot(radialDir);
        if (vRadial > 0) {
          this.velocity.sub(radialDir.multiplyScalar(vRadial));
        }
      }
    }

    // 4) Update actual position
    // Because we used getWorldPosition above, we might want to convert
    // the final world pos back to local, or just set the object’s world matrix.
    // For simplicity, set the object3D’s position directly (local).
    this.el.object3D.position.copy(this.physicsPosition);

    // (Optional) Damping if you want to gradually lose velocity
    this.velocity.multiplyScalar(0.999);

    if (this.position.y < -50) {
      this.position.y = -50;
      this.velocity.y = 0;
      
      window.dispatchEvent(
        new CustomEvent("game-lost", { detail: { lost: true } })
      );
    }
  },
});
