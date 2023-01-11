import * as THREE from 'three'
import { gl } from './core/WebGL'
import fragmentShader from './shaders/planeFrag.glsl'
import vertexShader from './shaders/planeVert.glsl'
import { simulator } from './Simulator'
import { calcCoveredTextureScale } from './utils/coveredTexture'
import { controls } from './utils/OrbitControls'

export class TCanvas {
  constructor(private parentNode: ParentNode) {
    this.init()
    this.createObjects()
    gl.requestAnimationFrame(this.anime)
  }

  private init() {
    gl.setup(this.parentNode.querySelector('.three-container')!)
    gl.scene.background = new THREE.Color('#000')
    gl.setResizeCallback(this.resizeCallback)
  }

  private createObjects() {
    const simTexture = simulator.texture
    const uvScale = calcCoveredTextureScale(simTexture, gl.size.aspect)

    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        tSimulator: { value: simTexture },
        u_uvScale: { value: new THREE.Vector2(uvScale[0], uvScale[1]) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = 'plane'

    gl.scene.add(mesh)
  }

  private resizeCallback = () => {
    const uniforms = gl.getMesh<THREE.ShaderMaterial>('plane').material.uniforms
    calcCoveredTextureScale(uniforms.tSimulator.value, gl.size.aspect, uniforms.u_uvScale.value)
  }

  // ----------------------------------
  // animation
  private anime = () => {
    simulator.update()

    controls.update()
    gl.render()
  }

  // ----------------------------------
  // dispose
  dispose() {
    gl.dispose()
  }
}
