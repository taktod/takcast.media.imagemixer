"use strict";
// デフォルトのmediaPlugin
// 普通の音声と普通の映像を扱う感じで
// 映像はあれか・・・混ぜれる方が楽しそうだな・・・
// そっちをデフォルトにしとくか・・・
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var videoObject_1 = require("./videoObject");
var bodyComponent_1 = require("./ui/bodyComponent");
// これはデフォルトのmediaPluginをつくっておく。
var Default = (function () {
    function Default() {
        this.name = "default";
        this.type = "media";
    }
    // pluginのloadがおわってからcallされるloader動作
    Default.prototype.setPlugins = function (plugins) {
        var _this = this;
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
        this.canvas.onmouseout = function (event) {
            switch (event.type) {
                case "mouseout":
                    _this.selector.hide();
                    _this.selector.setPosition({ x: 0, y: 0 });
                    break;
                default:
                    break;
            }
        };
        this._setupThree();
        // どうやっても裏にまわるとちゃんと動作しなくなる。
        // これはcanvasの縛りかな
        // 音声はbackgroundにいってもOK
        var draw = function () {
            _this._renderScene();
            requestAnimationFrame(draw);
        };
        draw();
        var basePlugin = plugins["base"][0];
        if (plugins["output"] && plugins["output"].forEach) {
            plugins["output"].forEach(function (plugin) {
                _this.outputPlugins.push(plugin);
            });
        }
        var context = basePlugin.refAudioContext();
        // audioNodeをつくっておく
        this.node = context.createGain();
        // 今回は特に考えずにそのままbasePluginのoutputにつなげる。
        // 本来なら、ここもdevNullに繋いでおいて、activeになったらoutputにつなげる的な感じがいいはず。
        this.node.connect(basePlugin.refDevnullNode());
    };
    Default.prototype._setupThree = function () {
        this.camera = new THREE.OrthographicCamera(-this.canvas.width / 2, this.canvas.width / 2, this.canvas.height / 2, -this.canvas.height / 2, 1000, -1000);
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
        this.renderer.setSize(this.canvas.width, this.canvas.height);
        this.selector = new videoObject_1.VideoObject(this.scene, 0.5);
    };
    /**
     * sourceInfoにあるvideoObjectをみつけてタスクを実行します。
     * @param info   データがあると思われるvideoObject
     * @param task   実行すべき関数
     * @param source 大元のsourceの値(指定している場合は、なければ新設します)
     */
    Default.prototype._runTaskForVideoObject = function (info, source, task) {
        // この書き方だと、videoObjectがはやいもの勝ちになってしまうので、よろしくない。
        // これでvideoObjectではなく、このオブジェクトの名前の方がいいか・・・
        if (typeof (info.data[this.name]) != "undefined") {
            return task(info.data[this.name]);
        }
        else if (source != null) {
            var videoObject = new videoObject_1.VideoObject(this.scene);
            info.data[this.name] = videoObject;
            return task(videoObject);
        }
        else {
            // なにもなければnullを応答しておきます
            return null;
        }
    };
    Default.prototype._renderScene = function () {
        var _this = this;
        // mediaがない場合、sourceがない場合は処理すべきものがないので、放置
        if (this.selectItem != null) {
            this.selector.update();
        }
        this.sources.forEach(function (source) {
            var sourceInfo = source.refInfo(_this);
            _this._runTaskForVideoObject(sourceInfo, null, function (videoObject) {
                // 画像データでない場合はupdateをかけておく。
                // staticな画像は更新しなくても変更がないだろうということで
                if (!(source.refVideoImage() instanceof HTMLImageElement)) {
                    videoObject.update();
                }
            });
        });
        // 更新処理がおわったので描画を実施する。
        this.renderer.render(this.scene, this.camera);
    };
    // このmediaPluginのデータを表示するのに利用するcomponentを応答
    Default.prototype.refBodyComponent = function () {
        // 描画すべきコンポーネント
        return bodyComponent_1.bodyComponent(this);
    };
    Default.prototype.onAddSource = function (source) {
        // sourceが追加されたときにcallされるイベント
        // sourceが追加されたら該当sourceのnodeとここのnodeをコネクトしておく。
        if (source.refAudioNode() != null) {
            source.refAudioNode().connect(this.node);
        }
        this.sources.push(source);
    };
    // 自分がactiveになったかの通知は欲しいところ。
    // activeになったら、前までactiveだったのは・・・あ、そうかrefNodeをdisconnect・・・ってoutputへの接続のみdisconnectってできるのか？
    Default.prototype.onChangeActiveSource = function (source) {
        // activeなsourceが変更になった場合にcallされるイベント
        // この部分でactiveなsourceがない場合はselectorを隠す
        // activeなsourceがある場合はupdateSourceで変更する
        if (source == null || source == undefined) {
            this.selectItem = null;
            this.selector.updateSource(undefined);
            this.selector.hide();
        }
        else {
            this.selectItem = source;
            this.selector.updateSource(source.refVideoImage());
        }
    };
    Default.prototype.onRemoveSource = function (source) {
        // 現在選択されているitemがclearされた場合は、該当アイテムを撤去する。
        if (source == this.selectItem) {
            this.selectItem = null;
        }
        // sourceがclearされるときにcallされるイベント
        // 該当のinfoのvideoObjectをdisposeして撤去する
        this._runTaskForVideoObject(source.refInfo(this), null, function (videoObject) {
            videoObject.dispose();
        });
        var index = this.sources.indexOf(source);
        if (index >= 0) {
            // sourcesから撤去しとく
            this.sources.splice(index, 1);
        }
    };
    Default.prototype.refCanvas = function () {
        // canvasを他の要素(output)に参照させる
        return this.canvas;
    };
    Default.prototype.refNode = function () {
        // audioNodeを他の要素(output)に参照させる
        return this.node;
    };
    Default.prototype.setVolume = function (value) {
        this.node.gain.value = value / 100.0;
    };
    // 外的要因でサイズが変更になった場合の処理
    // 描画フィールドのサイズ変更を実施した場合のみ呼ばれる。
    // windowのリサイズではcallされない。
    Default.prototype._updateSize = function (data) {
        // あとでつくっておく。とりあえずはじめはresizeしないし
    };
    Default.prototype._confirmVideoObject = function () {
        var _this = this;
        // 現在選択しているオブジェクトの位置が固定された場合の処理
        if (this.selectItem != null) {
            this._runTaskForVideoObject(this.selectItem.refInfo(this), this.selectItem, function (videoObject) {
                videoObject.updateSource(_this.selectItem.refVideoImage());
                videoObject.copy(_this.selector);
                videoObject.show(_this.zpos);
                _this.zpos--;
            });
        }
    };
    Default.prototype._refSelector = function () {
        return this.selector;
    };
    return Default;
}());
exports.Default = Default;
exports._ = new Default();
