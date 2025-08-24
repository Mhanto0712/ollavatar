'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { lerp } from 'three/src/math/MathUtils.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { useLoader, useThree, useFrame } from '@react-three/fiber';
import {
  useFBX,
  useAnimations,
  PerspectiveCamera,
  OrbitControls,
} from '@react-three/drei';
import { useControls, button } from 'leva';
import { remapMixamoAnimationToVRM } from '@/utils/remapMixamoAnimationToVRM';

type VRMAvatarProps = {
  avatar: string;
  isAnswering: boolean;
};

const VRMAvatar = ({ avatar, isAnswering, ...props }: VRMAvatarProps) => {
  const gltf = useLoader(GLTFLoader, avatar, (loader) => {
    loader.register((parser) => {
      return new VRMLoaderPlugin(parser);
    });
  });
  const { scene, userData } = gltf;

  // const { gl } = useThree();
  // gl.setSize(1000, 1000);

  const aniAssetA = useFBX('/animations/breathing.fbx');
  const aniAssetB = useFBX('/animations/Fireball.fbx');
  const aniAssetC = useFBX('/animations/Hip Hop Dancing.fbx');
  const aniAssetD = useFBX('/animations/Talking.fbx');

  const [VRMCenter, setVRMCenter] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const [VRMSize, setVRMSize] = useState<[number, number, number]>([0, 0, 0]);
  const [camPos, setCamPos] = useState<[number, number, number]>([0, 0, 0]);
  const [orbitTarget, setOrbitTarget] = useState<[number, number, number]>([
    0, 0, 0,
  ]);

  const lightRef = useRef<THREE.DirectionalLight>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const orbitRef = useRef<any>(null);
  const initialCamPos = useRef<[number, number, number]>([0, 0, 0]);
  const initialOrbitTarget = useRef<[number, number, number]>([0, 0, 0]);

  const currentVrm = userData.vrm;

  const animationClipA = useMemo(() => {
    const clip = remapMixamoAnimationToVRM(currentVrm, aniAssetA);
    clip.name = 'Breathing';
    return clip;
  }, [aniAssetA, currentVrm]);
  const animationClipB = useMemo(() => {
    const clip = remapMixamoAnimationToVRM(currentVrm, aniAssetB);
    clip.name = 'Fireball';
    return clip;
  }, [aniAssetB, currentVrm]);
  const animationClipC = useMemo(() => {
    const clip = remapMixamoAnimationToVRM(currentVrm, aniAssetC);
    clip.name = 'Hip Hop Dancing';
    return clip;
  }, [aniAssetC, currentVrm]);
  const animationClipD = useMemo(() => {
    const clip = remapMixamoAnimationToVRM(currentVrm, aniAssetD);
    clip.name = 'Talking';
    return clip;
  }, [aniAssetD, currentVrm]);

  const { actions } = useAnimations(
    [animationClipA, animationClipB, animationClipC, animationClipD],
    currentVrm.scene
  );

  useEffect(() => {
    const vrm = userData.vrm;
    // calling these functions greatly improves the performance
    VRMUtils.removeUnnecessaryVertices(scene);
    VRMUtils.combineSkeletons(scene);
    VRMUtils.combineMorphs(vrm);

    // Disable frustum culling
    vrm.scene.traverse((obj: any) => {
      obj.frustumCulled = false;
    });

    // // Show Outline of Box
    // const boxHelper = new THREE.BoxHelper(vrm.scene, 0xffff00); // yellow box
    // scene.add(boxHelper);

    // Box data of VRM
    const box = new THREE.Box3().setFromObject(vrm.scene);
    const {
      x: centerX,
      y: centerY,
      z: centerZ,
    } = box.getCenter(new THREE.Vector3());
    const { x: sizeX, y: sizeY, z: sizeZ } = box.getSize(new THREE.Vector3());
    setVRMCenter([centerX, centerY, centerZ]);
    setVRMSize([sizeX, sizeY, sizeZ]);

    // Camera
    // Convert vertical FOV from degrees to radians
    const fovRad = THREE.MathUtils.degToRad(15);
    // Calculate distance so that model fits the view vertically
    const distance = sizeY / (2 * Math.tan(fovRad / 2));
    setCamPos([0, centerY, (centerZ - sizeZ / 2 - distance) / 2]);

    // Light
    let light;
    if (lightRef.current) {
      light = lightRef.current;
      light.intensity = 3;
      light.position.set(centerX, centerY * 2, centerZ - sizeZ / 2 - distance);
      light.target.position.set(centerX, centerY, centerZ);
    }

    // OrbitControls
    setOrbitTarget([centerX, centerY + sizeY / 4, centerZ]);

    initialCamPos.current = [0, centerY, (centerZ - sizeZ / 2 - distance) / 2];
    initialOrbitTarget.current = [centerX, centerY + sizeY / 4, centerZ];
  }, [scene]);

  // Expression Controls
  const {
    aa,
    ih,
    ou,
    ee,
    oh,
    blinkLeft,
    blinkRight,
    happy,
    angry,
    sad,
    relaxed,
    Surprised,
    animation,
  } = useControls('VRM', {
    aa: { value: 0, min: 0, max: 1, render: () => false },
    ih: { value: 0, min: 0, max: 1, render: () => false },
    ou: { value: 0, min: 0, max: 1, render: () => false },
    ee: { value: 0, min: 0, max: 1, render: () => false },
    oh: { value: 0, min: 0, max: 1, render: () => false },
    blinkLeft: { value: 0, min: 0, max: 1, render: () => false },
    blinkRight: { value: 0, min: 0, max: 1, render: () => false },
    happy: { value: 0, min: 0, max: 1, label: 'Happy' },
    angry: { value: 0, min: 0, max: 1, label: 'Angry' },
    sad: { value: 0, min: 0, max: 1, label: 'Sad' },
    relaxed: { value: 0, min: 0, max: 1, label: 'Relaxed' },
    Surprised: { value: 0, min: 0, max: 1 },
    animation: {
      value: 'Breathing',
      options: ['Breathing', 'Fireball', 'Hip Hop Dancing', 'Talking'],
      label: 'Animation',
    },
    ResetView: button(() => {
      if (cameraRef.current && orbitRef.current) {
        // 設定相機位置
        cameraRef.current.position.set(...initialCamPos.current);

        // 設定 orbit target
        orbitRef.current.target.set(...initialOrbitTarget.current);
        orbitRef.current.update();
      }
    }),
  });

  const [, set] = useControls('VRM', () => ({
    animation: {
      value: 'Breathing',
      options: ['Breathing', 'Fireball', 'Hip Hop Dancing', 'Talking'],
      label: 'Animation',
    },
  }));

  useEffect(() => {
    if (!actions) {
      return;
    }

    actions[animation]?.play().startAt(0);

    return () => {
      actions[animation]?.stop();
    };
  }, [actions, animation]);

  useEffect(() => {
    if (isAnswering) {
      set({ animation: 'Talking' });
    } else if (animation === 'Talking') {
      set({ animation: 'Breathing' });
    }
  }, [isAnswering]);

  const getRandomExpression = (max: number) => {
    return Math.floor(Math.random() * max);
  };

  const lerpExpression = (name: string, value: number, lerpFactor: number) => {
    currentVrm.expressionManager.setValue(
      name,
      lerp(currentVrm.expressionManager.getValue(name), value, lerpFactor)
    );
  };

  const isBlinking = useRef<boolean>(true);
  const lastBlinkTime = useRef<number>(0);
  const isTalking = useRef<boolean>(true);
  const lastMouth = useRef<string>('');
  const lastMouthTime = useRef<number>(0);

  useFrame((state, delta) => {
    if (!currentVrm) {
      return;
    }
    const { clock } = state;
    const { elapsedTime } = clock;
    // Update expressions based on controls
    const expressionArr = [
      {
        name: 'aa',
        value: aa,
      },
      {
        name: 'ih',
        value: ih,
      },
      {
        name: 'ou',
        value: ou,
      },
      {
        name: 'ee',
        value: ee,
      },
      {
        name: 'oh',
        value: oh,
      },
      {
        name: 'blinkLeft',
        value: blinkLeft,
      },
      {
        name: 'blinkRight',
        value: blinkRight,
      },
      {
        name: 'happy',
        value: happy,
      },
      {
        name: 'angry',
        value: angry,
      },
      {
        name: 'sad',
        value: sad,
      },
      {
        name: 'relaxed',
        value: relaxed,
      },
      {
        name: 'Surprised',
        value: Surprised,
      },
    ];

    const blinking = () => {
      if (elapsedTime - lastBlinkTime.current > 5) {
        lastBlinkTime.current = elapsedTime;
        isBlinking.current = true;
      }
      const blinkVal = isBlinking.current ? 1 : 0;
      lerpExpression('blinkLeft', blinkVal, delta * 12);
      lerpExpression('blinkRight', blinkVal, delta * 12);
      if (
        isBlinking.current &&
        elapsedTime - lastBlinkTime.current > delta * 12
      ) {
        isBlinking.current = false;
      }
    };

    const talking = (answering: boolean) => {
      if (answering) {
        const talkVal = isTalking.current ? 0.5 : 0;
        if (
          lastMouth.current === '' ||
          elapsedTime - lastMouthTime.current > delta * 24
        ) {
          lastMouth.current = expressionArr[getRandomExpression(5)].name;
          lastMouthTime.current = elapsedTime;
          isTalking.current = true;
        }
        lerpExpression(lastMouth.current, talkVal, delta * 12);
        if (
          isTalking.current &&
          elapsedTime - lastMouthTime.current > delta * 12
        ) {
          isTalking.current = false;
        }
      } else {
        expressionArr.forEach((item, index) => {
          if (index < 5) {
            lerpExpression(item.name, 0, delta * 12);
          }
        });
      }
    };

    blinking();
    talking(isAnswering);
    expressionArr.forEach((item, index) => {
      if (index > 6) {
        lerpExpression(item.name, item.value, delta * 12);
      }
    });

    currentVrm.update(delta);
  });

  return (
    <group {...props}>
      <primitive object={scene} />
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        fov={15}
        aspect={1}
        near={0.1}
        far={1000}
        position={camPos}
      />
      <directionalLight ref={lightRef} color='white' />
      <OrbitControls
        ref={orbitRef}
        enableDamping={false}
        target={orbitTarget}
      />
    </group>
  );
};

export default VRMAvatar;
