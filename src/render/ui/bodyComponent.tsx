import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactBootstrap from "react-bootstrap";

var Form = ReactBootstrap.Form;
var FormGroup = ReactBootstrap.FormGroup;
var FormControl = ReactBootstrap.FormControl;
var ButtonGroup = ReactBootstrap.ButtonGroup;
var Button = ReactBootstrap.Button;
var Panel = ReactBootstrap.Panel;

import {Default} from "..";

export var bodyComponent = (def:Default):any => {
  var canvas = def.refCanvas();
  var selector = def._refSelector();

  const move = 0;
  const scale = 1;
  const rotate = 2;

  return class BodyComponent extends React.Component<{}, {}> {
    state = {width:canvas.width, height:canvas.height, mode:move};
    private obj:THREE.Mesh;
    private texture:THREE.Texture;
    constructor() {
      super();
      this._handleChange = this._handleChange.bind(this);
      this._clickMode = this._clickMode.bind(this);
      this._fitMode = this._fitMode.bind(this);
      this._keyDown = this._keyDown.bind(this);
    }
    public _keyDown(event:KeyboardEvent) {
      if(event.target == document.body) {
        switch(event.code) {
        case "KeyS":
          this._changeMode(scale);
          break;
        case "KeyR":
          this._changeMode(rotate);
          break;
        default:
          break;
        }
      }
    }
    public _mouseMove(event:MouseEvent) {
      // なるほど・・負の数のほうが前にくるのか・・・
      selector.show(-999);
      switch(this.state.mode) {
      case move:
        selector.setPosition({
          x: event.layerX - canvas.width / 2,
          y: canvas.height / 2 - event.layerY
        });
        break;
      case scale:
        // ボタンがおされていたら、なにがしする。
        if(event.buttons != 0) {
          var pos = selector.getPosition();
          var width  = Math.abs(canvas.width  / 2 + pos.x - event.layerX) * 2;
          var height = Math.abs(canvas.height / 2 - pos.y - event.layerY) * 2;
          selector.setSize({
            width: width,
            height:height
          });
        }
        break;
      case rotate:
        if(event.buttons != 0) {
          // マウスの位置からradianを求めるか・・・
          var pos = selector.getPosition();
          var side = canvas.width / 2 + pos.x - event.layerX;
          var vert = canvas.height / 2 - pos.y - event.layerY;
          var addDeg = 0;
          if(side > 0) {
            addDeg += Math.PI;
          }
          selector.setRotation(-Math.atan(vert / side) + addDeg);
        }
        break;
      default:
        break;
      }
    }
    public _mouseClick(event:MouseEvent) {
      switch(this.state.mode) {
      case move:
        def._confirmVideoObject();
        break;
      default:
        break;
      }
    }
    private _changeMode(mode:number) {
      if(this.state.mode == mode) {
        this.setState({mode:move});
      }
      else {
        this.setState({mode:mode});
      }
    }
    public _handleChange(item) {
    }
    public _clickMode(item) {
      var mode = parseInt(item._dispatchInstances._hostNode.name);
      this._changeMode(mode);
    }
    public _fitMode(item) {
      selector.setPosition(
        {
          x:0,
          y:0
        }
      );
      selector.setSize(
        {
          width: canvas.width,
          height:canvas.height
        }
      );
      def._confirmVideoObject();
    }
    public componentWillUnmount() {
      document.removeEventListener("keydown", this._keyDown);

      document.body.appendChild(canvas);
      canvas.style["position"] = "absolute";
      canvas.style["top"] = "-10000px";
    }
    public componentDidMount() {
      document.addEventListener("keydown", this._keyDown);
      canvas.style["position"]="relative";
      canvas.style["top"]="0px";
      (this.refs["canvas"] as HTMLElement).appendChild(canvas);
    }
    public render() {
      var height = 100;
      try {
        var element = ReactDOM.findDOMNode(this) as HTMLElement;
        while(element != null && element != undefined) {
          if(element.style["height"] != null && element.style["height"] != "") {
            break;
          }
          element = element.parentElement;
        }
        height = element.offsetHeight;
        height -= 80;
      }
      catch(e) {
      }
      // このタイミングでサイズを計算しなおさないとだめなわけか・・・
      canvas.onmousemove = (event:MouseEvent) => {
        this._mouseMove(event);
      }
      canvas.onclick = (event:MouseEvent) => {
        this._mouseClick(event);
      }
      // 上の部分に適当なボタンを配置するものとする。
      // 配置するのはサイズと操作ボタンとしようと思う。
      return (
        <div>
          <Form inline onChange={this._handleChange}>
            <ButtonGroup>
              <Button onClick={this._clickMode} name={scale + ""}  active={this.state.mode == scale} ><span className="glyphicon glyphicon-resize-full" aria-hidden="true"></span></Button>
              <Button onClick={this._clickMode} name={rotate + ""} active={this.state.mode == rotate}><span className="glyphicon glyphicon-refresh" aria-hidden="true"></span></Button>
              <Button onClick={this._fitMode}><span className="glyphicon glyphicon-fullscreen" aria-hidden="true"></span></Button>
            </ButtonGroup>
            {/* サイズ変更のdialogを出すのをつくろかと思ったけど、とりあえずやめとく */}
{/*            {" "}
            <Button onClick={this._fitMode}><span className="glyphicon glyphicon-cog" aria-hidden="true"></span></Button>*/}
          </Form>
          <div style={{border:"0px",height:height + "px"}}>
            <div ref="canvas" style={{overflow:"scroll", width:"100%", height:height + "px"}}>
            </div>
          </div>
        </div>
      );
    }
  }
}