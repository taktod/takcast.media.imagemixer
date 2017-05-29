"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
/**
 * three jsでコントロールする描画オブジェクト
 */
var VideoObject = (function () {
    function VideoObject(scene, opacity) {
        if (opacity === void 0) { opacity = 1.0; }
        this.scene = scene;
        var texture = new THREE.Texture();
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        // geometryは1x1でつくる。scaleで本来の大きさにする
        var geometry = new THREE.PlaneGeometry(1, 1);
        var material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            opacity: opacity,
            transparent: opacity != 1.0
        });
        var mesh = new THREE.Mesh(geometry, material);
        // 見えないように後ろにさげとく。
        mesh.position.z = -99999;
        this.mesh = mesh;
        this.material = material;
        this.geometry = geometry;
        this.texture = texture;
        this.scene.add(this.mesh);
    }
    VideoObject.prototype.updateSource = function (source) {
        this.texture.image = source;
        this.texture.needsUpdate = true;
        if (source) {
            var width = source.width;
            var height = source.height;
            if (source instanceof HTMLVideoElement) {
                var video = source;
                width = video.videoWidth;
                height = video.videoHeight;
            }
            if (!(source instanceof HTMLVideoElement)) {
                this.material.transparent = true;
            }
            if (width == 0 || height == 0) {
                width = 320;
                height = 240;
            }
            this.setSize({
                width: width,
                height: height
            });
            this.setRotation(0);
        }
    };
    VideoObject.prototype.update = function () {
        if (typeof (this.texture.image) === "undefined") {
            this.texture.needsUpdate = false;
        }
        else if (this.texture.image) {
            this.texture.needsUpdate = true;
        }
        else {
            this.texture.needsUpdate = false;
        }
    };
    VideoObject.prototype.show = function (index) {
        if (this.texture.image) {
            this.mesh.position.z = index;
        }
    };
    VideoObject.prototype.setRotation = function (degree) {
        this.mesh.rotation.z = degree;
    };
    VideoObject.prototype.setPosition = function (pos) {
        this.mesh.position.x = pos.x;
        this.mesh.position.y = pos.y;
    };
    VideoObject.prototype.setSize = function (size) {
        this.mesh.scale.x = size.width;
        this.mesh.scale.y = size.height;
    };
    VideoObject.prototype.getPosition = function () {
        return {
            x: this.mesh.position.x,
            y: this.mesh.position.y
        };
    };
    VideoObject.prototype.hide = function () {
        this.mesh.position.z = -99999;
    };
    VideoObject.prototype.dispose = function () {
        this.texture.dispose();
        this.material.dispose();
        this.geometry.dispose();
        this.scene.remove(this.mesh);
    };
    VideoObject.prototype.copy = function (original) {
        this.mesh.position.x = original.mesh.position.x;
        this.mesh.position.y = original.mesh.position.y;
        this.mesh.position.z = original.mesh.position.z;
        this.mesh.rotation.x = original.mesh.rotation.x;
        this.mesh.rotation.y = original.mesh.rotation.y;
        this.mesh.rotation.z = original.mesh.rotation.z;
        this.mesh.scale.x = original.mesh.scale.x;
        this.mesh.scale.y = original.mesh.scale.y;
        this.mesh.scale.z = original.mesh.scale.z;
    };
    return VideoObject;
}());
exports.VideoObject = VideoObject;
