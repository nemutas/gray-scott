import * as THREE from 'three'
import { GPUComputationRenderer, Variable } from 'three/examples/jsm/misc/GPUComputationRenderer'
import { gl } from './core/WebGL'
import grayScottFrag from './shaders/grayScottFrag.glsl'
import { gui } from './utils/gui'
import { mouse2d } from './utils/Mouse2D'

class Simulator {
  private resolution = { width: 1024, height: 1024 }
  private aspect = this.resolution.width / this.resolution.height
  private gpuCompute!: GPUComputationRenderer
  private variable!: Variable

  private patterns: { [key in string]: () => { feed: number; kill: number } } = {
    default: () => ({ feed: 0.04, kill: 0.06 }),
    spot: () => ({ feed: 0.025, kill: 0.06 }),
    hole: () => ({ feed: 0.039, kill: 0.058 }),
    mimizu: () => ({ feed: 0.033, kill: 0.06 }),
    moving: () => ({ feed: 0.014, kill: 0.054 }),
    moving2: () => ({ feed: 0.02, kill: 0.05 }),
    wave: () => ({ feed: 0.014, kill: 0.045 }),
    vortex: () => ({ feed: 0.005, kill: 0.03 }),
  }

  constructor() {
    this.init()
    this.setGui()
  }

  private init() {
    this.gpuCompute = new GPUComputationRenderer(this.resolution.width, this.resolution.height, gl.renderer)
    this.createGrayScottTexture()
    this.setVariableDependencies()
    this.gpuCompute.init()
  }

  private createGrayScottTexture() {
    // create texture
    const texture = this.gpuCompute.createTexture()
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    // create variable
    this.variable = this.gpuCompute.addVariable('tGrayScott', grayScottFrag, texture)

    // set uniforms
    const material = this.variable.material
    Object.assign(material.uniforms, {
      tDefault: { value: texture.clone() },
      u_useDefault: { value: false },
      u_mouse: { value: new THREE.Vector2() },
      // params
      u_du: { value: 2e-5 },
      u_dv: { value: 1e-5 },
      u_f: { value: 0.04 },
      u_k: { value: 0.06 },
      u_dt: { value: 1 },
      u_dx: { value: 0.01 },
      u_px: { value: new THREE.Vector2(1 / this.resolution.width, 1 / this.resolution.height) },
    })
  }

  private setVariableDependencies() {
    this.gpuCompute.setVariableDependencies(this.variable, [this.variable])
  }

  private setGui() {
    const obj = { pattern: Object.keys(this.patterns)[0] }
    gui.add(obj, 'pattern', Object.keys(this.patterns)).onChange((patternName: string) => {
      const { feed, kill } = this.patterns[patternName]()
      this.uniforms.u_f.value = feed
      this.uniforms.u_k.value = kill
      this.uniforms.u_useDefault.value = true
    })
  }

  // --------------------------------------------------
  // get datas
  private get uniforms() {
    return this.variable.material.uniforms
  }

  get texture() {
    return this.gpuCompute.getCurrentRenderTarget(this.variable).texture
  }

  get prevTexture() {
    return this.gpuCompute.getAlternateRenderTarget(this.variable).texture
  }

  // --------------------------------------------------
  // update
  private calcMousePosition() {
    const screenAspect = gl.size.aspect
    const simAspect = this.resolution.width / this.resolution.height
    const x = screenAspect < this.aspect ? screenAspect / this.aspect : 1
    const y = screenAspect < this.aspect ? 1 : simAspect / screenAspect
    return [mouse2d.position[0] * x, mouse2d.position[1] * y]
  }

  update() {
    const [mx, my] = this.calcMousePosition()
    this.uniforms.u_mouse.value.set(mx, my)

    for (let i = 0; i < 10; i++) {
      this.gpuCompute.compute()
      this.uniforms.u_useDefault.value = false
    }
  }
}

export const simulator = new Simulator()
