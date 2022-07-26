import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { MapControls, OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { ViewMode } from '../components/controller/controller.component';
import * as dat from 'dat.gui';

const ASSET_PATH_3D = '../../assets/truescape/3d-assets/';
const MAP_PIN = '../../assets/sample/map_pin/scene.gltf';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

  constructor(private cdtRef: ChangeDetectorRef) { }

  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvasRef!: ElementRef<HTMLCanvasElement>;

  // we need three components to crate a 3D scene:
  // 1. Scene - like a container that holds objects, cameras and lights.
  // 2. Camera - there are many types of cameras, but the most common to human eye is PerspectiveCamera.
  // 3. Renderer - needs to know which dom element to render to.

  private scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public renderer!: THREE.WebGLRenderer;

  // 3d model loader
  private gltfLoader!: GLTFLoader;
  private preMining!: GLTF;
  private mining!: GLTF;
  private miningFacility!: GLTF;
  private pin!: GLTF;
  // lights
  private ambientLight!: THREE.AmbientLight;
  // controller
  public controls!: OrbitControls;
  // mouse raycaster for clicking on 3d objects
  private mouse = new THREE.Vector2();
  private raycaster = new THREE.Raycaster();
  // helpers
  private axesHelper!: THREE.AxesHelper;
  private cameraHelper!: THREE.CameraHelper;
  private gridHelper!: THREE.PolarGridHelper;
  private gui!: dat.GUI;

  private mapModelXPos = 0;
  private mapModelYPos = -3;
  private mapModelZPos = 0;

  isModalOpen = false;

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.createScene();
    this.createRenderer();
    this.animate();
    this.cdtRef.detectChanges();
  }

  private createScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdcf0fa);
    this.camera = new THREE.PerspectiveCamera(75, this.getAspectRatio(), 0.1, 1000);
    this.camera.position.y = 12;
    this.camera.position.x = 0;
    this.camera.zoom = 0.5;
    this.scene.add(this.camera);
    
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.ambientLight);

    this.scene.fog = new THREE.FogExp2(0xdcf0fa, 0.008);

    // this.loadDebugGui();

    this.loadMapGLTF();

    this.loadPinGLTF();

  }

  private createRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.rendererCanvasRef.nativeElement,
      antialias: true, // smooth edges
      alpha: false // transparency
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, (window.innerHeight - 64));
    this.renderer.render(this.scene, this.camera);

    this.controls = new MapControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.screenSpacePanning = false;
    this.controls.maxPolarAngle = (Math.PI / 2) - 0.35;
    this.controls.maxDistance = 80;
    this.controls.minDistance = 1.25;
    this.controls.update();

  }

  private animate(): void {
    this.controls.update();
    this.resetPinHover();
    this.onPinHover();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }

  @HostListener('window:resize', ['$event']) private onWindowResize(event: Event) {
    this.camera.aspect = this.getAspectRatio();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, (window.innerHeight - 64));
    this.renderer.render(this.scene, this.camera);
  }

  @HostListener('document:mousemove', ['$event']) private onMouseMove(event: MouseEvent) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  }

  @HostListener('document:click', ['$event']) private onClick(event: MouseEvent) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);
    if (intersects.length > 0 && intersects[0].object.name === 'Object_4') {
      this.isModalOpen = true;
    }
  }

  private onPinHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    // only care about pin not entire scene
    const pinObject = this.scene.children.find(child => child.name == 'pinObject')?.children;
    if (!pinObject) return;
    const intersects = this.raycaster.intersectObjects(pinObject);
    for (let i = 0; i < intersects.length; i++) {
      const obj = intersects[i].object as any;
      if (obj.name == 'Object_4') {
        obj.material.color.set(0xffffff);
        this.pin = obj;
      }
    }

  }

  private resetPinHover() {
    if ((this.pin as any) !== undefined && (this.pin as any).material) {
      (this.pin as any).material.color.set(0xcc0104);
    }
  }

  private getAspectRatio(): number {
    return window.innerWidth / (window.innerHeight - 64);
  }

  private loadPinGLTF() {
    // random number between -8 and 8
    const x = (Math.random() * 16) - 8;
    const z = (Math.random() * 16) - 8;

    this.gltfLoader.load(
      MAP_PIN,
      (gltf) => {
        gltf.scene.position.set(x, 1, z);
        gltf.scene.scale.set(5, 5, 7);
        gltf.scene.name = 'pinObject';
        this.pin = gltf;
        this.scene.add(this.pin.scene);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.log('error', error);
      }
    );

  }

  private loadMapGLTF() {
    this.gltfLoader = new GLTFLoader();

    // Load outer terrain
    this.gltfLoader.load(
      ASSET_PATH_3D + 'Terrain_Outer.gltf',
      (gltf) => {
        gltf.scene.position.set(this.mapModelXPos, this.mapModelYPos, this.mapModelZPos);
        gltf.scene.scale.set(0.005, 0.005, 0.005);
        this.scene.add(gltf.scene);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.log('error', error);
      }
    );

    // Load inner pre-mining terrain. I believe there are better ways to load gltf files.
    this.gltfLoader.load(
      ASSET_PATH_3D + 'Terrain_Existing.gltf',
      (gltf) => {
        gltf.scene.position.set(this.mapModelXPos, this.mapModelYPos, this.mapModelZPos);
        gltf.scene.scale.set(0.005, 0.005, 0.005);
        // this.scene.add(gltf.scene);
        this.preMining = gltf;
      });

    // Load inner mining terrain
    this.gltfLoader.load(
      ASSET_PATH_3D + 'Terrain_Year16.gltf',
      (gltf) => {
        gltf.scene.position.set(this.mapModelXPos, this.mapModelYPos, this.mapModelZPos);
        gltf.scene.scale.set(0.005, 0.005, 0.005);
        this.scene.add(gltf.scene);
        this.mining = gltf;
      });

    // Load mining facility
    this.gltfLoader.load(
      ASSET_PATH_3D + 'Mining_Facilities.gltf',
      (gltf) => {
        gltf.scene.position.set(this.mapModelXPos, this.mapModelYPos, this.mapModelZPos);
        gltf.scene.scale.set(0.005, 0.005, 0.005);
        this.scene.add(gltf.scene);
        this.miningFacility = gltf;
      }
    );



  }

  private renderMiningSite(mode: ViewMode) {

    if (mode === 'before') {
      this.scene.remove(this.mining.scene);
      this.scene.remove(this.miningFacility.scene);
      this.scene.add(this.preMining.scene);
    } else {
      this.scene.remove(this.preMining.scene);
      this.scene.add(this.mining.scene);
      this.scene.add(this.miningFacility.scene);
    }

    this.renderer.render(this.scene, this.camera);

  }

  private loadDebugGui() {

    this.axesHelper = new THREE.AxesHelper(50);
    this.scene.add(this.axesHelper);

    this.cameraHelper = new THREE.CameraHelper(this.camera);
    // this.scene.add(this.cameraHelper);

    this.gridHelper = new THREE.GridHelper(200, 50);
    this.scene.add(this.gridHelper);

    // const arrowHelper = new THREE.ArrowHelper(this.raycaster.ray.direction, this.raycaster.ray.origin, 60, 0xffffff);
    // this.scene.add(arrowHelper);

    this.gui = new dat.GUI();
    const options = {
      axesHelper: true,
      gridHelper: true,
      cameraHelper: false,
    }

    this.gui.add(options, 'axesHelper').onChange((value) => {
      if (value) {
        this.scene.add(this.axesHelper);
      } else {
        this.scene.remove(this.axesHelper);
      }
    }).name('Axes Helper');

    this.gui.add(options, 'gridHelper').onChange(() => {
      // toggle grid helper
      if (options.gridHelper) {
        this.scene.add(this.gridHelper);
      } else {
        this.scene.remove(this.gridHelper);
      }
    }).name('Grid');

    this.gui.add(options, 'cameraHelper').onChange(() => {
      // toggle camera helper
      if (options.cameraHelper) {
        this.scene.add(this.cameraHelper);
      } else {
        this.scene.remove(this.cameraHelper);
      }
    }).name('Camera');

  }

  modeChange(mode: ViewMode) {
    this.renderMiningSite(mode);
  }

  onModalClose() {
    this.isModalOpen = false;
  }

}
