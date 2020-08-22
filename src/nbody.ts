import {
  Scene,
  WebGLRenderer,
  Material,
  BufferGeometry,
  Camera,
  DataTexture,
  RGBAFormat,
  FloatType,
  ShaderMaterial,
  Mesh,
  PlaneBufferGeometry,
  WebGLRenderTarget,
  RepeatWrapping,
  NearestFilter,
  BufferAttribute,
  PerspectiveCamera,
  SphereBufferGeometry,
  LineSegments,
  LineBasicMaterial,
  UVMapping,
  Line,
  Points
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import mainVertexShader from './shaders/main.vert';
import mainFragmentShader from './shaders/main.frag';
import trailsVertexShader from './shaders/trails.vert';
import trailsFragmentShader from './shaders/trails.frag';
import passThroughVertexShader from './shaders/pass-through.vert';
import passThroughFragmentShader from './shaders/pass-through.frag';
import positionFragmentShader from './shaders/position.frag';
import velocityFragmentShader from './shaders/velocity.frag';

interface ISubScene {
  scene?: Scene;
  mesh?: Mesh<BufferGeometry, Material>;
  material?: ShaderMaterial;
  curr?: WebGLRenderTarget;
  prev?: WebGLRenderTarget;
}

interface IPositionSubScene {
  scene?: Scene;
  mesh?: Mesh<BufferGeometry, Material>;
  material?: ShaderMaterial;
  slices?: WebGLRenderTarget[];
}

interface IMainScene {
  camera?: PerspectiveCamera;
  scene?: Scene;
  geometry?: BufferGeometry;
  material?: ShaderMaterial;
  mesh?: Mesh<BufferGeometry, ShaderMaterial>;
  trailsGeometry?: BufferGeometry;
  trailsMaterial?: ShaderMaterial;
  trailsMesh?: Line<BufferGeometry, ShaderMaterial>;
}

export class Simulation {
  _ptScene: Scene;
  _ptMaterial: ShaderMaterial;
  _ptCamera: Camera;
  _ptMesh: Mesh;
  _renderer: WebGLRenderer;

  _mainScene: IMainScene;
  _cube: {
    geometry: BufferGeometry;
    lineSegments: LineSegments;
    material: Material;
  };
  _X?: IPositionSubScene; // Positions
  _V?: ISubScene; // Velocities
  _P?: DataTexture;

  _numTrailPoints: number;
  _textureDimension: number;
  _dt: number; // Delta time
  _orbitControls: OrbitControls;


  constructor() {
    this._init();
    this._createCube();
  }

  init(input: {
    numBodies: 1 | 4 | 16 | 64 | 256 | 1024 | 4096;
    numTrailPoints: number;
  }) {

    this._textureDimension = Math.sqrt(input.numBodies);
    const newX: IPositionSubScene = {};
    const newV: ISubScene = {};

    this._numTrailPoints = input.numTrailPoints;

    this._P = this._createRandomProperties(this._textureDimension);
    this._dt = 0.001;

    const positions = this._createRandomPositions(this._textureDimension);
    newX.slices = [];
    for (let i = 0; i < this._numTrailPoints; i++) {
      newX.slices.push(this._createRenderTarget(this._textureDimension));
    }
    // newX.curr = this._createRenderTarget(textureDimension);
    // newX.prev = this._createRenderTarget(textureDimension);
    // this._renderTextureToTarget(positions, newX.curr);
    this._renderTextureToTarget(positions, newX.slices[0]);
    positions.dispose();

    const velocities = this._createRandomVelocities(this._textureDimension);
    newV.curr = this._createRenderTarget(this._textureDimension);
    newV.prev = this._createRenderTarget(this._textureDimension);
    this._renderTextureToTarget(velocities, newV.curr);
    this._renderTextureToTarget(velocities, newV.prev);
    velocities.dispose();

    newX.material = new ShaderMaterial({
      uniforms: {
        texX: { value: undefined },
        texV: { value: undefined },
        dt: { value: this._dt },
      },
      vertexShader: passThroughVertexShader,
      fragmentShader: positionFragmentShader,
    })
    newX.scene = new Scene();
    newX.mesh = new Mesh(new PlaneBufferGeometry(2, 2), newX.material);
    newX.scene.add(newX.mesh);

    this._disposeSubScene(this._X);
    this._X = newX;

    newV.material = new ShaderMaterial({
      uniforms: {
        texX: { value: undefined },
        texV: { value: undefined },
        texP: { value: this._P },
        texDim: { value: this._textureDimension },
        dt: { value: this._dt },
      },
      vertexShader: passThroughVertexShader,
      fragmentShader: velocityFragmentShader,
    });
    newV.scene = new Scene();
    newV.mesh = new Mesh(new PlaneBufferGeometry(2, 2), newV.material);
    newV.scene.add(newV.mesh);

    this._disposeSubScene(this._V);
    this._V = newV;

    // this._disposeMainScene();
    // this._mainScene = {};
    // this._mainScene.scene = new Scene();
    this._generateBodies(this._textureDimension);
    this._generateTrails();
  }

  private _init() {
    this._ptCamera = new Camera();
    this._ptCamera.position.z = 1;
    this._ptScene = new Scene();
    this._ptMaterial = new ShaderMaterial({
      uniforms: {
        ptTex: { value: undefined }
      },
      vertexShader: passThroughVertexShader,
      fragmentShader: passThroughFragmentShader,
    })
    this._ptMesh = new Mesh(new PlaneBufferGeometry(2, 2), this._ptMaterial);
    this._ptScene.add(this._ptMesh);

    this._renderer = new WebGLRenderer({
      antialias: true,
    });
    this._renderer.setSize(document.documentElement.clientWidth, document.documentElement.clientHeight);
    document.body.appendChild(this._renderer.domElement);



    this._mainScene = {};

    this._mainScene.scene = new Scene();
    this._mainScene.camera = new PerspectiveCamera(75, document.documentElement.clientWidth / document.documentElement.clientHeight, 0.1, 1000);

    window.addEventListener('resize', (event) => {
      if (this._mainScene?.camera) {
        this._mainScene.camera.aspect = document.documentElement.clientWidth / document.documentElement.clientHeight;
        this._mainScene.camera.updateProjectionMatrix();
      }
      if (this._mainScene?.scene) {
        this._renderer.setSize(
          document.documentElement.clientWidth,
          document.documentElement.clientHeight,
        );
      }
    });
    this._orbitControls = new OrbitControls(this._mainScene.camera, this._renderer.domElement);
    this._orbitControls.enableDamping = true;
    this._mainScene.camera.position.set(0, 0, 2);
    this._mainScene.camera.lookAt(0, 0, 0);
    this._orbitControls.update();

  }

  private _createRenderTarget(textureDimension: number) {
    return new WebGLRenderTarget(
      textureDimension,
      textureDimension,
      {
        wrapS: RepeatWrapping,
        wrapT: RepeatWrapping,
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        type: FloatType,
        format: RGBAFormat,
        stencilBuffer: false,
      }
    );
  }

  private _renderTextureToTarget(texture: DataTexture, target: WebGLRenderTarget) {
    this._ptMaterial.uniforms.ptTex.value = texture;
    this._renderer.setRenderTarget(target);
    this._renderer.render(this._ptScene, this._ptCamera);
  }

  private _disposeSubScene(subScene?: ISubScene) {
    subScene?.scene?.dispose();
    subScene?.material?.dispose();
    subScene?.curr?.dispose();
    subScene?.prev?.dispose();
    subScene?.mesh?.material?.dispose();
    subScene?.mesh?.geometry?.dispose();
  }

  // private _disposeMainScene() {
  //   this._mainScene?.scene?.dispose();
  //   this._mainScene?.geometry?.dispose();
  // }

  private _createRandomProperties(textureDimension: number) {
    const numBodies = textureDimension * textureDimension;
    const data = new Float32Array(numBodies * 4);

    for (let i = 0; i < numBodies * 4; i += 4) {
      // Mass
      data[i + 0] = 0.0001; // Math.random();
      // Electrical charge
      data[i + 1] = Math.random() * 2 - 1;
      // ?
      data[i + 2] = 0.0;
      // ?
      data[i + 3] = 0.0;
    }

    const tex = new DataTexture(
      data,
      textureDimension,
      textureDimension,
      RGBAFormat,
      FloatType,
      UVMapping,
      RepeatWrapping,
      RepeatWrapping,
      NearestFilter,
      NearestFilter,
    );

    tex.needsUpdate = true;

    return tex;
  }

  private _createRandomPositions(textureDimension: number) {
    const numBodies = textureDimension * textureDimension;
    const data = new Float32Array(numBodies * 4);

    for (let i = 0; i < numBodies * 4; i += 4) {
      data[i + 0] = Math.random() - 0.5;
      data[i + 1] = Math.random() - 0.5;
      data[i + 2] = Math.random() - 0.5;
      data[i + 3] = 1.0;
    }

    const tex = new DataTexture(
      data,
      textureDimension,
      textureDimension,
      RGBAFormat,
      FloatType,
    );

    tex.needsUpdate = true;

    return tex;
  }

  private _createRandomVelocities(sqrtNumBodies: number) {
    const numBodies = sqrtNumBodies * sqrtNumBodies;
    const data = new Float32Array(numBodies * 4);

    for (let i = 0; i < numBodies * 4; i += 4) {
      data[i + 0] = (Math.random() - 0.5) * 0.1;
      data[i + 1] = (Math.random() - 0.5) * 0.1;
      data[i + 2] = (Math.random() - 0.5) * 0.1;
      data[i + 3] = 1.0;
    }

    const tex = new DataTexture(
      data,
      sqrtNumBodies,
      sqrtNumBodies,
      RGBAFormat,
      FloatType,
    );

    tex.needsUpdate = true;

    return tex;
  }

  private _generateBodies(sqrtNumBodies: number) {
    const numBodies = sqrtNumBodies * sqrtNumBodies;
    this._mainScene.geometry = new BufferGeometry();
    const sphere = new SphereBufferGeometry(0.001);
    const verts = sphere.getAttribute('position').array;
    const positions = new Float32Array(numBodies * verts.length);
    const bodyIndices = new Float32Array(numBodies * verts.length / 3);
    let posIndex = 0;
    let bodyIndex = 0;
    for (let i = 0; i < numBodies; i++) {
      for (let j = 0; j < verts.length; j += 3) {
        positions[posIndex++] = verts[j];
        positions[posIndex++] = verts[j + 1];
        positions[posIndex++] = verts[j + 2];

        bodyIndices[bodyIndex++] = i;
      }
    }

    let current = 0;
    const sphereIndices = sphere.getIndex().array;
    const newIndices = new Uint32Array(numBodies * sphereIndices.length);
    for (let i = 0; i < numBodies; i++) {
      const offset = i * verts.length / 3;
      for (let j = 0; j < sphereIndices.length; j++) {
        newIndices[current++] = offset + sphereIndices[j];
      }
    }

    this._mainScene.geometry.setIndex(new BufferAttribute(newIndices, 1));
    this._mainScene.geometry.setAttribute('position', new BufferAttribute(positions, 3));
    this._mainScene.geometry.setAttribute('bodyIndex', new BufferAttribute(bodyIndices, 1));

    this._mainScene.material = new ShaderMaterial({
      uniforms: {
        texX: { value: undefined },
        texV: { value: this._V.curr.texture },
        texP: { value: this._P },
        texDim: { value: sqrtNumBodies },
      },
      vertexShader: mainVertexShader,
      fragmentShader: mainFragmentShader,
    });

    this._mainScene.mesh = new Mesh(this._mainScene.geometry, this._mainScene.material);
    this._mainScene.scene.add(this._mainScene.mesh);

    sphere.dispose();
  }

  private _generateTrails() {
    const numBodies = this._textureDimension * this._textureDimension;
    this._mainScene.trailsGeometry = new BufferGeometry();
    const positions = new Float32Array(numBodies * this._numTrailPoints * 3);
    const trailIndices = new Float32Array(numBodies * this._numTrailPoints);
    const bodyIndices = new Float32Array(numBodies * this._numTrailPoints);
    let posIndex = 0;
    let bodyIndex = 0;
    for (let i = 0; i < numBodies; i++) {
      for (let j = 0; j < this._numTrailPoints; j++) {
        positions[posIndex++] = 0.0;
        positions[posIndex++] = 0.0;
        positions[posIndex++] = 0.0;
        trailIndices[bodyIndex] = j;
        bodyIndices[bodyIndex++] = i;
      }
    }

    const newIndices = new Uint32Array(numBodies * (this._numTrailPoints + 1));
    let current = 0;
    for (let i = 0; i < numBodies; i++) {
      // const offset = i * verts.length / 3;
      for (let j = 0; j < this._numTrailPoints; j++) {
        newIndices[current++] = i * this._numTrailPoints + j;
      }
      newIndices[current++] = 0xFFFFFFFF;
    }

    this._mainScene.trailsGeometry.setIndex(new BufferAttribute(newIndices, 1));
    this._mainScene.trailsGeometry.setAttribute('position', new BufferAttribute(positions, 3));
    this._mainScene.trailsGeometry.setAttribute('bodyIndex', new BufferAttribute(bodyIndices, 1));
    this._mainScene.trailsGeometry.setAttribute('trailIndex', new BufferAttribute(trailIndices, 1));

    this._mainScene.trailsMaterial = new ShaderMaterial({
      uniforms: {
        texX: { value: undefined },
        texP: { value: this._P },
        texDim: { value: this._textureDimension },
      },
      defines: {
        NUM_TRAIL_POINTS: this._numTrailPoints,
      },
      // wireframe: true,
      vertexShader: trailsVertexShader,
      fragmentShader: trailsFragmentShader,
    });

    // @ts-ignore
    this._mainScene.trailsMesh = new Line(this._mainScene.trailsGeometry, this._mainScene.trailsMaterial);
    this._mainScene.scene.add(this._mainScene.trailsMesh);
  }

  private _update() {
    this._updateForces();
    this._updateVelocities();
    this._updatePositions();
  }

  private _updateForces() {
    // TODO
  }

  private _updateVelocities() {
    this._V.material.uniforms.texX.value = this._X.slices[0].texture;
    this._V.material.uniforms.texV.value = this._V.curr.texture;
    this._renderer.setRenderTarget(this._V.prev);
    this._renderer.render(this._V.scene, this._ptCamera);
    [this._V.curr, this._V.prev] = [this._V.prev, this._V.curr];
  }

  private _updatePositions() {
    this._X.slices.unshift(this._X.slices.pop());
    this._X.material.uniforms.texX.value = this._X.slices[1].texture;
    this._X.material.uniforms.texV.value = this._V.curr.texture;
    this._renderer.setRenderTarget(this._X.slices[0]);
    this._renderer.render(this._X.scene, this._ptCamera);
    // [this._X.curr, this._X.prev] = [this._X.prev, this._X.curr];
  }

  private _renderScene() {
    this._mainScene.material.uniforms.texX.value = this._X.slices[0].texture;
    this._mainScene.material.uniforms.texV.value = this._V.curr.texture;
    this._mainScene.trailsMaterial.uniforms.texX.value = this._X.slices.map(slice => slice.texture);
    this._renderer.setRenderTarget(null);
    this._renderer.render(this._mainScene.scene, this._mainScene.camera);
  }


  private _createCube() {
    const geometry = new BufferGeometry();
    const vertices = new Float32Array([
      -0.5, -0.5, -0.5,
      -0.5, -0.5, +0.5,
      -0.5, -0.5, -0.5,
      -0.5, +0.5, -0.5,
      -0.5, -0.5, -0.5,
      +0.5, -0.5, -0.5,
      +0.5, +0.5, -0.5,
      +0.5, +0.5, +0.5,
      +0.5, +0.5, -0.5,
      +0.5, -0.5, -0.5,
      +0.5, +0.5, -0.5,
      -0.5, +0.5, -0.5,
      +0.5, -0.5, +0.5,
      +0.5, -0.5, -0.5,
      +0.5, -0.5, +0.5,
      +0.5, +0.5, +0.5,
      +0.5, -0.5, +0.5,
      -0.5, -0.5, +0.5,
      -0.5, +0.5, +0.5,
      -0.5, +0.5, -0.5,
      -0.5, +0.5, +0.5,
      -0.5, -0.5, +0.5,
      -0.5, +0.5, +0.5,
      +0.5, +0.5, +0.5,
    ]);

    geometry.setAttribute('position', new BufferAttribute(vertices, 3));

    const material = new LineBasicMaterial({
      color: 'white',
      transparent: true,
      opacity: 0.5,
    });

    const lineSegments = new LineSegments(geometry, material);

    this._cube = {
      geometry,
      material,
      lineSegments,
    };

    this._mainScene.scene.add(this._cube.lineSegments);
  }

  startLoop() {
    this._loop();
  }

  _loop() {
    this._orbitControls.update();
    this._update();
    this._renderScene();
    requestAnimationFrame(this._loop.bind(this));
  }
}
