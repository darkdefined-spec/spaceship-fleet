import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export function Spaceship({ modelPath, scale = 1, isPreview = false }) {
  const meshRef = useRef()
  const { scene } = useGLTF(modelPath)

  // CRITICAL: This clones the model so it can exist in multiple places at once
  const clonedScene = useMemo(() => scene.clone(), [scene])

  useFrame((state) => {
    if (!meshRef.current) return
    if (isPreview) {
      // Constant rotation for thumbnails
      meshRef.current.rotation.y += 0.01
    } else {
      // Mouse follow for main ship
      const targetX = (state.pointer.x * Math.PI) / 6
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetX, 0.05)
    }
  })

  return <primitive ref={meshRef} object={clonedScene} scale={scale} />
}