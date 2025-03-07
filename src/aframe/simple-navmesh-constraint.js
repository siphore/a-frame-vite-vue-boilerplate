AFRAME.registerComponent("simple-navmesh-constraint", {
  schema: {
    enabled: { default: true },
    navmesh: { default: "" },
    fall: { default: 0.5 },
    height: { default: 1.6 },
    exclude: { default: "" },
    xzOrigin: { default: "" },
  },

  init: function () {
    this.onSceneUpdated = this.onSceneUpdated.bind(this);
    this.el.sceneEl.addEventListener("child-attached", this.onSceneUpdated);
    this.el.sceneEl.addEventListener("child-detached", this.onSceneUpdated);

    this.objects = [];
    this.excludes = [];
  },

  remove: function () {
    this.el.sceneEl.removeEventListener("child-attached", this.onSceneUpdated);
    this.el.sceneEl.removeEventListener("child-detached", this.onSceneUpdated);
  },

  onSceneUpdated: function (evt) {
    if (this.entitiesChanged) return;
    if (
      (this.data.navmesh && evt.detail.el.matches(this.data.navmesh)) ||
      (this.data.exclude && evt.detail.el.matches(this.data.exclude))
    ) {
      this.entitiesChanged = true;
    }
  },

  updateNavmeshEntities: function () {
    this.objects.length = 0;
    this.excludes.length = 0;
    if (this.data.navmesh.length > 0) {
      for (const navmesh of document.querySelectorAll(this.data.navmesh)) {
        this.objects.push(navmesh.object3D);
      }
    }
    if (this.objects.length === 0) {
      console.warn("simple-navmesh-constraint: Did not match any elements");
    } else if (this.data.exclude.length > 0) {
      for (const excluded of document.querySelectorAll(this.data.exclude)) {
        this.objects.push(excluded.object3D);
        this.excludes.push(excluded);
      }
    }
    this.entitiesChanged = false;
  },

  update: function () {
    this.lastPosition = null;
    this.xzOrigin = this.data.xzOrigin
      ? this.el.querySelector(this.data.xzOrigin)
      : this.el;
    this.updateNavmeshEntities();
  },

  tick: (function () {
    const nextPosition = new THREE.Vector3();
    const tempVec = new THREE.Vector3();
    const scanPattern = [
      [0, 1],
      [0, 0.5],
      [30, 0.4],
      [-30, 0.4],
      [60, 0.2],
      [-60, 0.2],
      [80, 0.06],
      [-80, 0.06],
    ];
    const down = new THREE.Vector3(0, -1, 0);
    const raycaster = new THREE.Raycaster();
    const maxYVelocity = 0.5;
    const results = [];
    let yVel = 0;

    return function tick(time, delta) {
      if (!this.data.enabled) return;
      if (this.entitiesChanged) {
        this.updateNavmeshEntities();
      }

      // Get the current world position of xzOrigin.
      this.xzOrigin.object3D.getWorldPosition(nextPosition);
      if (this.data.xzOrigin)
        nextPosition.y -= this.xzOrigin.object3D.position.y;

      // If nextPosition is wildly different (e.g. due to teleport or lag), reset lastPosition.
      if (
        !this.lastPosition ||
        nextPosition.distanceTo(this.lastPosition) > 1
      ) {
        this.lastPosition = nextPosition.clone();
      }

      // If movement is minimal and we're not already falling, exit early.
      if (
        nextPosition.distanceTo(this.lastPosition) <= 0.01 &&
        !this.isFalling
      ) {
        this.lastPosition.copy(nextPosition);
        return;
      }

      let didHit = false;
      // Try to find a navmesh hit using the scan pattern.
      scanPatternLoop: for (const [angle, distance] of scanPattern) {
        tempVec.subVectors(nextPosition, this.lastPosition);
        tempVec.applyAxisAngle(down, (angle * Math.PI) / 180);
        tempVec.multiplyScalar(distance);
        tempVec.add(this.lastPosition);
        tempVec.y += maxYVelocity;
        tempVec.y -= this.data.height;
        raycaster.set(tempVec, down);
        raycaster.far =
          this.data.fall > 0 ? this.data.fall + maxYVelocity : Infinity;
        raycaster.intersectObjects(this.objects, true, results);
        if (results.length) {
          // Exclude unwanted objects.
          for (const result of results) {
            if (this.excludes.includes(result.object.el)) {
              results.splice(0);
              continue scanPatternLoop;
            }
          }
          const hitPos = results[0].point.clone();
          results.splice(0);
          hitPos.y += this.data.height;
          if (nextPosition.y - (hitPos.y - yVel * 2) > 0.01) {
            yVel += Math.max(-1 * delta * 0.001, -maxYVelocity);
            hitPos.y = nextPosition.y + yVel;
          } else {
            yVel = 0;
          }
          tempVec.copy(hitPos);
          this.xzOrigin.object3D.parent.worldToLocal(tempVec);
          tempVec.sub(this.xzOrigin.object3D.position);
          if (this.data.xzOrigin)
            tempVec.y += this.xzOrigin.object3D.position.y;
          this.el.object3D.position.add(tempVec);
          this.lastPosition.copy(hitPos);
          didHit = true;
          this.el.emit("navmesh-hit", { didHit: didHit }, false);
          break;
        }

        this.el.emit("navmesh-hit", { didHit: didHit }, false);
      }

      const rigEl = document.getElementById("camera-rig");
      if (!didHit) {
        // We're in freefall.
        // Disable movement controls on the rig.
        if (rigEl && rigEl.components["movement-controls"]) {
          rigEl.setAttribute("movement-controls", "enabled: false");
        }
      } else {
        rigEl.setAttribute("movement-controls", "enabled: true");
      }
    };
  })(),
});
