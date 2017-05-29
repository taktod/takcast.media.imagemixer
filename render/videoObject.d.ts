import * as THREE from "three";
/**
 * three jsでコントロールする描画オブジェクト
 */
export declare class VideoObject {
    private texture;
    private geometry;
    private material;
    private mesh;
    private scene;
    constructor(scene: THREE.Scene, opacity?: number);
    updateSource(source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): void;
    update(): void;
    show(index: number): void;
    setRotation(degree: number): void;
    setPosition(pos: {
        x: number;
        y: number;
    }): void;
    setSize(size: {
        width: number;
        height: number;
    }): void;
    getPosition(): {
        x: number;
        y: number;
    };
    hide(): void;
    dispose(): void;
    copy(original: VideoObject): void;
}
