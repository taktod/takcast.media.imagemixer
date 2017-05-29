// デフォルトのmediaPlugin
// 普通の音声と普通の映像を扱う感じで
// 映像はあれか・・・混ぜれる方が楽しそうだな・・・
// そっちをデフォルトにしとくか・・・

/*
 * TODO Canvasに文字を書き込んでそれをtextureにする場合は、透過可能にしておいた方がよさそう。
 * 現状では、デフォルト透過不可にしてあって、imageのみ可能にしてるけど・・・
 * 
 * ただしtextureが大きい場合はうまく動作できない(処理が重くなりすぎる)問題があるが・・・
 */

import * as React from "react";

import * as THREE from "three";

import {IBasePlugin} from "takcast.interface";
import {IPlugin} from "takcast.interface";
import {IMediaPlugin} from "takcast.interface";
import {ISource} from "takcast.interface";
import {ISourceInfo} from "takcast.interface";
import {IOutputPlugin} from "takcast.interface";

import {VideoObject} from "./videoObject";
import {bodyComponent} from "./ui/bodyComponent";

// これはデフォルトのmediaPluginをつくっておく。
export class Default implements IMediaPlugin {
  public name = "default";
  public type = "media";

  // 出力を実施するcanvas
  private canvas:HTMLCanvasElement;

  // three.jsをつかって適当に合成したい。今回も・・・
  private camera:THREE.OrthographicCamera;
  private scene:THREE.Scene;
  private renderer:THREE.Renderer;

  private selector:VideoObject;

  private zpos:number;

  private node:GainNode;
  private sources:Array<ISource>;
  private selectItem:ISource; // 現在selectされているアイテムを保持しておく
  /**
   *  自分がアクティブなときにしか、設定変更がこない
   * と考えると
   * outputPluginを保持しておいて、自分のサイズ変更的なものがきたら全体のcallするというのが必要になりそう。
   */
  private outputPlugins:Array<IOutputPlugin>;

  // pluginのloadがおわってからcallされるloader動作
  public setPlugins(plugins:{[key:string]:Array<IPlugin>}):void {
    // ここ・・・constructorでまかなえる処理はconstructorにもっていくべき。
    this.sources = [];
    this.outputPlugins = [];
    // これ・・・constructorで描画がはじまるのは、あまり良くないかも・・・
    this.selectItem = null;
    this.zpos = 0;
    this.canvas = document.createElement("canvas");
    this.canvas.width = 600;
    this.canvas.height = 400;

    document.body.appendChild(this.canvas);
    this.canvas.style["position"] = "absolute";
    this.canvas.style["top"] = "-10000px";
    this.canvas.onmouseout = (event:MouseEvent) => {
      switch(event.type) {
      case "mouseout":
        this.selector.hide();
        this.selector.setPosition({x:0,y:0});
        break;
      default:
        break;
      }
    };
    this._setupThree();
    // どうやっても裏にまわるとちゃんと動作しなくなる。
    // これはcanvasの縛りかな
    // 音声はbackgroundにいってもOK
    var draw = () => {
      this._renderScene();
      requestAnimationFrame(draw);
    }
    draw();
    var basePlugin = plugins["base"][0] as IBasePlugin;
    if(plugins["output"] && plugins["output"].forEach) {
      plugins["output"].forEach((plugin) => {
        this.outputPlugins.push(plugin as IOutputPlugin);
      });
    }
    var context = basePlugin.refAudioContext();
    // audioNodeをつくっておく
    this.node = context.createGain();
    // 今回は特に考えずにそのままbasePluginのoutputにつなげる。
    // 本来なら、ここもdevNullに繋いでおいて、activeになったらoutputにつなげる的な感じがいいはず。
    this.node.connect(basePlugin.refDevnullNode());
  }
  private _setupThree():void {
    this.camera = new THREE.OrthographicCamera(
      -this.canvas.width  / 2,
       this.canvas.width  / 2,
       this.canvas.height / 2,
      -this.canvas.height / 2,
       1000,
      -1000);
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
    this.renderer.setSize(this.canvas.width, this.canvas.height);

    this.selector = new VideoObject(this.scene, 0.5);
  }
  /**
   * sourceInfoにあるvideoObjectをみつけてタスクを実行します。
   * @param info   データがあると思われるvideoObject
   * @param task   実行すべき関数
   * @param source 大元のsourceの値(指定している場合は、なければ新設します)
   */
  private _runTaskForVideoObject(
      info:ISourceInfo,
      source:ISource,
      task:{(videoObject:VideoObject):any}):any {
    // この書き方だと、videoObjectがはやいもの勝ちになってしまうので、よろしくない。
    // これでvideoObjectではなく、このオブジェクトの名前の方がいいか・・・
    if(typeof(info.data[this.name]) != "undefined") {
      return task(info.data[this.name] as VideoObject);
    }
    else if(source != null) {
      var videoObject = new VideoObject(this.scene);
      info.data[this.name] = videoObject;
      return task(videoObject);
    }
    else {
      // なにもなければnullを応答しておきます
      return null;
    }
  }
  public _renderScene():void {
    // mediaがない場合、sourceがない場合は処理すべきものがないので、放置
    if(this.selectItem != null) {
      this.selector.update();
    }
    this.sources.forEach((source) => {
      var sourceInfo = source.refInfo(this);
      this._runTaskForVideoObject(
        sourceInfo,
        null,
        (videoObject:VideoObject) => {
          // 画像データでない場合はupdateをかけておく。
          // staticな画像は更新しなくても変更がないだろうということで
          if(!(source.refVideoImage() instanceof HTMLImageElement)) {
            videoObject.update();
          }
        }
      );
    });
    // 更新処理がおわったので描画を実施する。
    this.renderer.render(this.scene, this.camera);
  }
  // このmediaPluginのデータを表示するのに利用するcomponentを応答
  public refBodyComponent():React.ComponentClass<{}> {
    // 描画すべきコンポーネント
    return bodyComponent(this);
  }
  public onAddSource(source:ISource):void {
    // sourceが追加されたときにcallされるイベント
    // sourceが追加されたら該当sourceのnodeとここのnodeをコネクトしておく。
    if(source.refAudioNode() != null) {
      source.refAudioNode().connect(this.node);
    }
    this.sources.push(source);
  }
  // 自分がactiveになったかの通知は欲しいところ。
  // activeになったら、前までactiveだったのは・・・あ、そうかrefNodeをdisconnect・・・ってoutputへの接続のみdisconnectってできるのか？
  public onChangeActiveSource(source:ISource):void {
    // activeなsourceが変更になった場合にcallされるイベント
    // この部分でactiveなsourceがない場合はselectorを隠す
    // activeなsourceがある場合はupdateSourceで変更する
    if(source == null || source == undefined) {
      this.selectItem = null;
      this.selector.updateSource(undefined);
      this.selector.hide();
    }
    else {
      this.selectItem = source;
      this.selector.updateSource(source.refVideoImage());
    }
  }
  public onRemoveSource(source:ISource):void {
    // 現在選択されているitemがclearされた場合は、該当アイテムを撤去する。
    if(source == this.selectItem) {
      this.selectItem = null;
    }
    // sourceがclearされるときにcallされるイベント
    // 該当のinfoのvideoObjectをdisposeして撤去する
    this._runTaskForVideoObject(
      source.refInfo(this),
      null,
      (videoObject:VideoObject) => {
        videoObject.dispose();
      }
    );
    var index = this.sources.indexOf(source);
    if(index >= 0) {
      // sourcesから撤去しとく
      this.sources.splice(index, 1);
    }
  }
  public refCanvas():HTMLCanvasElement {
    // canvasを他の要素(output)に参照させる
    return this.canvas;
  }

  public refNode():AudioNode {
    // audioNodeを他の要素(output)に参照させる
    return this.node;
  }
  public setVolume(value:number):void {
    this.node.gain.value = value / 100.0;
  }
  // 外的要因でサイズが変更になった場合の処理
  // 描画フィールドのサイズ変更を実施した場合のみ呼ばれる。
  // windowのリサイズではcallされない。
  public _updateSize(data:{width?:number,height?:number}) {
    // あとでつくっておく。とりあえずはじめはresizeしないし
  }
  public _confirmVideoObject() {
    // 現在選択しているオブジェクトの位置が固定された場合の処理
    if(this.selectItem != null) {
      this._runTaskForVideoObject(
        this.selectItem.refInfo(this),
        this.selectItem,
        (videoObject:VideoObject) => {
          videoObject.updateSource(this.selectItem.refVideoImage());
          videoObject.copy(this.selector);
          videoObject.show(this.zpos);
          this.zpos --;
        }
      );
    }
  }
  public _refSelector():VideoObject {
    return this.selector;
  }
}

export var _ = new Default();
