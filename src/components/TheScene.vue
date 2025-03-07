<script setup>
import { ref } from 'vue';

import TheCameraRig from './TheCameraRig.vue';

import '../aframe/simple-grab.js';
import '../aframe/outline.js';
import '../aframe/grappling-hook.js';

defineProps({
  scale: Number,
  overlaySelector: String,
});

const allAssetsLoaded = ref(false);
</script>

<template>
  <a-scene background="color: black;" :webxr="`
      requiredFeatures: local-floor;
      referenceSpaceType: local-floor;
      optionalFeatures: dom-overlay;
      overlayElement: ${overlaySelector};
    `" xr-mode-ui="XRMode: xr" physx="
      delay: 1000;
      useDefaultScene: false;
      wasmUrl: lib/physx.release.wasm;
    " outline simple-grab>

    <a-assets timeout="5000" @loaded="allAssetsLoaded = true">
      <a-asset-item id="skybox" src="assets/models/skybox.glb"></a-asset-item>
      <a-asset-item id="platform" src="assets/models/platform.glb"></a-asset-item>
      <a-asset-item id="penguin" src="assets/models/penguin.glb"></a-asset-item>
    </a-assets>

    <a-entity gltf-model="assets/models/skybox.glb" scale="2 2 2" id="background"></a-entity>
    <!-- <a-entity gltf-model="assets/models/penguin.glb" scale="5 5 5" position="0 2.199 -24" class="hookable"></a-entity> -->
    <a-entity gltf-model="assets/models/platform.glb" scale="0.3 0.3 0.3" position="0 -0.2163 0"
      data-role="nav-mesh"></a-entity>
    <a-entity gltf-model="assets/models/platform.glb" scale="0.3 0.3 0.3" position="0 -0.2163 -25"
      data-role="nav-mesh"></a-entity>
    <a-entity gltf-model="assets/models/platform.glb" scale="0.3 0.3 0.3" position="0 -0.2163 -50"
      data-role="nav-mesh"></a-entity>
    <a-entity gltf-model="assets/models/platform.glb" scale="0.3 0.3 0.3" position="0 -0.2163 -75"
      data-role="nav-mesh"></a-entity>
    <a-entity gltf-model="assets/models/platform.glb" scale="0.3 0.3 0.3" position="0 -0.2163 -100"
      data-role="nav-mesh"></a-entity>
    <a-box position="0 4 -10" scale="0.5 0.5 0.5" color="red" class="hookable"></a-box>

    <TheCameraRig />

  </a-scene>
</template>