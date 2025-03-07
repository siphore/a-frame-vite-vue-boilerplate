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
    <!-- Starting platform -->
    <a-entity gltf-model="assets/models/platform.glb" scale="0.3 0.3 0.3" position="0 -0.2163 0"
      data-role="nav-mesh"></a-entity>

    <!-- Parkour platforms with increasing height and varying positions -->
    <a-entity gltf-model="assets/models/platform.glb" scale="0.2 0.2 0.2" position="3 2 -10"
      data-role="nav-mesh"></a-entity>
    <a-entity gltf-model="assets/models/platform.glb" scale="0.2 0.2 0.2" position="-4 4 -20"
      data-role="nav-mesh"></a-entity>
    <a-entity gltf-model="assets/models/platform.glb" scale="0.2 0.2 0.2" position="5 6 -30"
      data-role="nav-mesh"></a-entity>
    <a-entity gltf-model="assets/models/platform.glb" scale="0.2 0.2 0.2" position="-3 8 -40"
      data-role="nav-mesh"></a-entity>
    <a-entity gltf-model="assets/models/platform.glb" scale="0.2 0.2 0.2" position="4 10 -50"
      data-role="nav-mesh"></a-entity>
    <a-entity gltf-model="assets/models/platform.glb" scale="0.3 0.3 0.3" position="0 12 -60"
      data-role="nav-mesh"></a-entity>

    <!-- Hookable targets for grappling between platforms -->
    <a-box position="3 5 -10" scale="0.3 0.3 0.3" color="red" class="hookable"></a-box>
    <a-box position="-4 7 -20" scale="0.3 0.3 0.3" color="red" class="hookable"></a-box>
    <a-box position="5 9 -30" scale="0.3 0.3 0.3" color="red" class="hookable"></a-box>
    <a-box position="-3 11 -40" scale="0.3 0.3 0.3" color="red" class="hookable"></a-box>
    <a-box position="4 13 -50" scale="0.3 0.3 0.3" color="red" class="hookable"></a-box>

    <!-- Losing popup -->
    <a-entity id="lostPopup" visible="false" position="0 1.6 -2">
      <a-plane width="2" height="1" color="#000" opacity="0.8"></a-plane>
      <a-text value="You Lost!" align="center" position="0 -50 0.01" color="#FFF"></a-text>
    </a-entity>

    <TheCameraRig />

  </a-scene>
</template>