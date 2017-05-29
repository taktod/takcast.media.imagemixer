import * as THREE from "three";

/**
 * three jsでコントロールする描画オブジェクト
 */
export class VideoObject {
  private texture:THREE.Texture;
  private geometry:THREE.Geometry;
  private material:THREE.Material;
  private mesh:THREE.Mesh;
  private scene:THREE.Scene;

  constructor(
      scene:THREE.Scene,
      opacity:number = 1.0) {
    this.scene = scene;
    var texture = new THREE.Texture();
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    // geometryは1x1でつくる。scaleで本来の大きさにする
    var geometry = new THREE.PlaneGeometry(1,1);
    var material = new THREE.MeshBasicMaterial({
      map:texture,
      side:THREE.DoubleSide,
      opacity:opacity,
      transparent:opacity != 1.0
    });
    var mesh = new THREE.Mesh(
      geometry,
      material
    );
    // 見えないように後ろにさげとく。
    mesh.position.z = -99999;
    this.mesh = mesh;
    this.material = material;
    this.geometry = geometry;
    this.texture = texture;
    this.scene.add(this.mesh);
  }
  public updateSource(source:HTMLImageElement | HTMLCanvasElement | HTMLVideoElement) {
    this.texture.image = source;
    this.texture.needsUpdate = true;

    if(source) {
      var width = source.width;
      var height = source.height;
      if(source instanceof HTMLVideoElement) {
        var video = source as HTMLVideoElement;
        width = video.videoWidth;
        height = video.videoHeight;
      }
      if(!(source instanceof HTMLVideoElement)) {
        this.material.transparent = true;
      }
      if(width == 0 || height == 0) {
        width = 320;
        height = 240;
      }
      this.setSize({
        width: width,
        height: height
      });
      this.setRotation(0);
    }
  }
  public update() {
    if(typeof(this.texture.image) === "undefined") {
      this.texture.needsUpdate = false;
    }
    else if(this.texture.image) {
      this.texture.needsUpdate = true;
    }
    else {
      this.texture.needsUpdate = false;
    }
  }
  public show(index:number) {
    if(this.texture.image) {
      this.mesh.position.z = index;
    }
  }
  public setRotation(degree:number):void {
    this.mesh.rotation.z = degree;
  }
  public setPosition(pos:{x:number, y:number}):void {
    this.mesh.position.x = pos.x;
    this.mesh.position.y = pos.y;
  }
  public setSize(size:{width:number, height:number}):void {
    this.mesh.scale.x = size.width;
    this.mesh.scale.y = size.height;
  }
  public getPosition():{x:number, y:number} {
    return {
      x:this.mesh.position.x,
      y:this.mesh.position.y
    };
  }
  public hide() {
    this.mesh.position.z = -99999;
  }
  public dispose() {
    this.texture.dispose();
    this.material.dispose();
    this.geometry.dispose();
    this.scene.remove(this.mesh);
  }
  public copy(original:VideoObject) {
    this.mesh.position.x = original.mesh.position.x;
    this.mesh.position.y = original.mesh.position.y;
    this.mesh.position.z = original.mesh.position.z;
    this.mesh.rotation.x = original.mesh.rotation.x;
    this.mesh.rotation.y = original.mesh.rotation.y;
    this.mesh.rotation.z = original.mesh.rotation.z;
    this.mesh.scale.x = original.mesh.scale.x;
    this.mesh.scale.y = original.mesh.scale.y;
    this.mesh.scale.z = original.mesh.scale.z;
  }
}
