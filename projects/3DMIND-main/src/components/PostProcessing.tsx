// File: src/components/PostProcessing.tsx

import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';
import * as THREE from 'three';

export default function PostProcessing() {
  const { gl, scene, camera, size } = useThree();

  const composer = useMemo(() => {
    // Construct effect composer
    const comp = new EffectComposer(gl);
    
    // 1. Standard Render Pass
    const renderPass = new RenderPass(scene, camera);
    comp.addPass(renderPass);

    // 2. Unreal Bloom Pass (stunning glowing lines/nodes)
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      1.5,   // strength
      0.35,  // radius
      0.1    // threshold
    );
    comp.addPass(bloomPass);

    // 3. Afterimage Pass (motion trails on camera move and pulses)
    const afterimagePass = new AfterimagePass(0.8); // damp factor: larger value = longer trails
    comp.addPass(afterimagePass);

    return comp;
  }, [gl, scene, camera]);

  // Keep composer size in sync with canvas resizing
  useEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size]);

  // Priority 1 triggers rendering at the end of the frame cycle
  useFrame(() => {
    gl.autoClear = false;
    composer.render();
  }, 1);

  return null;
}
