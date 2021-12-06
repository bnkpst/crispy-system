import { BufferGeometryUtils, GLTFLoader } from 'three'

import * as THREE from 'three'
// from https://discourse.threejs.org/t/functions-to-calculate-the-visible-width-height-at-a-given-z-depth-from-a-perspective-camera/269
export function visibleHeightAtZDepth(depth, camera) {
  if (camera.isOrthographicCamera) {
    return Math.abs(camera.top - camera.bottom)
  }

  // compensate for cameras not positioned at z=0
  const cameraOffset = camera.position.z
  if (depth < cameraOffset) {
    depth -= cameraOffset
  } else {
    depth += cameraOffset
  }

  // vertical fov in radians
  const vFOV = (camera.fov * Math.PI) / 180

  // Math.abs to ensure the result is always positive
  return 2 * Math.tan(vFOV / 2) * Math.abs(depth)
}

export function visibleWidthAtZDepth(depth, camera) {
  if (camera.isOrthographicCamera) {
    return Math.abs(camera.right - camera.left)
  }

  const height = visibleHeightAtZDepth(depth, camera)
  return height * camera.aspect
}

// extract all geometry from a gltf scene
export function extractGeometry(gltf) {
  const geometries = []
  gltf.traverse((child) => {
    if (child.isMesh) {
      geometries.push(child.geometry)
    }
  })

  return BufferGeometryUtils.mergeBufferGeometries(geometries)
}

// promise wrapper of the GLTFLoader
export function loadGltf(url) {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(url, resolve, null, reject)
  })
}

export function getTexelDecodingFunction(functionName, encoding) {
    const components = getEncodingComponents(encoding);
    return `
      vec4 ${functionName}(vec4 value) {
        return ${components[0]}ToLinear${components[1]};
      }
    `;
  }

  function getEncodingComponents(encoding) {
    switch (encoding) {
      case THREE.LinearEncoding:
        return ['Linear', '( value )'];
  
      case THREE.sRGBEncoding:
        return ['sRGB', '( value )'];
  
      case THREE.RGBEEncoding:
        return ['RGBE', '( value )'];
  
      case THREE.RGBM7Encoding:
        return ['RGBM', '( value, 7.0 )'];
  
      case THREE.RGBM16Encoding:
        return ['RGBM', '( value, 16.0 )'];
  
      case THREE.RGBDEncoding:
        return ['RGBD', '( value, 256.0 )'];
  
      case THREE.GammaEncoding:
        return ['Gamma', '( value, float( GAMMA_FACTOR ) )'];
  
      case THREE.LogLuvEncoding:
        return ['LogLuv', '( value )'];
  
      default:
        console.warn('THREE.WebGLProgram: Unsupported encoding:', encoding);
        return ['Linear', '( value )'];
    }
  } // https://github.com/mrdoob/https://unpkg.com/three@0.126.1/build/three.module.js.js/blob/3c60484ce033e0dc2d434ce0eb89fc1f59d57d65/src/renderers/webgl/WebGLProgram.js#L66-L71
  
