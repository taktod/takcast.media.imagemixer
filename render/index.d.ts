/// <reference types="react" />
import * as React from "react";
import { IPlugin } from "takcast.interface";
import { IMediaPlugin } from "takcast.interface";
import { ISource } from "takcast.interface";
import { VideoObject } from "./videoObject";
export declare class Default implements IMediaPlugin {
    name: string;
    type: string;
    private canvas;
    private camera;
    private scene;
    private renderer;
    private selector;
    private zpos;
    private node;
    private sources;
    private selectItem;
    /**
     *  自分がアクティブなときにしか、設定変更がこない
     * と考えると
     * outputPluginを保持しておいて、自分のサイズ変更的なものがきたら全体のcallするというのが必要になりそう。
     */
    private outputPlugins;
    setPlugins(plugins: {
        [key: string]: Array<IPlugin>;
    }): void;
    private _setupThree();
    /**
     * sourceInfoにあるvideoObjectをみつけてタスクを実行します。
     * @param info   データがあると思われるvideoObject
     * @param task   実行すべき関数
     * @param source 大元のsourceの値(指定している場合は、なければ新設します)
     */
    private _runTaskForVideoObject(info, source, task);
    _renderScene(): void;
    refBodyComponent(): React.ComponentClass<{}>;
    onAddSource(source: ISource): void;
    onChangeActiveSource(source: ISource): void;
    onRemoveSource(source: ISource): void;
    refCanvas(): HTMLCanvasElement;
    refNode(): AudioNode;
    setVolume(value: number): void;
    _updateSize(data: {
        width?: number;
        height?: number;
    }): void;
    _confirmVideoObject(): void;
    _refSelector(): VideoObject;
}
export declare var _: Default;
