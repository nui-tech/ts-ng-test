import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as THREE from 'three';
import { PerspectiveCamera } from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls';


export type ViewMode = 'before' | 'after';

@Component({
  selector: 'map-controller',
  templateUrl: './controller.component.html',
  styleUrls: ['./controller.component.scss']
})
export class ControllerComponent implements OnInit {

  constructor() { }

  @Output() onModeChange = new EventEmitter<ViewMode>();
  @Input() camera!: PerspectiveCamera;
  @Input() controls!: MapControls;
  @Input() public mode: ViewMode = 'after';

  direction2D = 0;

  ngOnInit(): void {
    if(this.controls){
      this.controls.addEventListener('change', () => {
        const wd = this.camera.getWorldDirection(new THREE.Vector3( 0, 0, - 1 ));
        let theta = Math.atan2(wd.x,wd.z);
        // convert PI to degrees
        this.direction2D = theta * 180 / Math.PI;
      });
    }
  }


  toggleModel(mode: ViewMode) {
    this.mode = mode;
    this.onModeChange.emit(mode);
  }

  zoomIn() {
    // zoom in until it reaches 10
    if (this.camera.zoom < 10) {
      this.camera.zoom += 0.1;
      this.camera.updateProjectionMatrix();
    }
  }

  zoomOut() {
    //reduce zoom until it reaches 0.1
    if (this.camera.zoom > 0.11) {
      this.camera.zoom -= 0.1;
      this.camera.updateProjectionMatrix();
    }
  }

  rotate() {
    // todo: rotate the map
  }

  reset() {
    this.controls.reset();
  }

}
