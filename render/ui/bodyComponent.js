"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
var ReactBootstrap = require("react-bootstrap");
var Form = ReactBootstrap.Form;
var FormGroup = ReactBootstrap.FormGroup;
var FormControl = ReactBootstrap.FormControl;
var ButtonGroup = ReactBootstrap.ButtonGroup;
var Button = ReactBootstrap.Button;
var Panel = ReactBootstrap.Panel;
exports.bodyComponent = function (def) {
    var canvas = def.refCanvas();
    var selector = def._refSelector();
    var move = 0;
    var scale = 1;
    var rotate = 2;
    return (function (_super) {
        __extends(BodyComponent, _super);
        function BodyComponent() {
            var _this = _super.call(this) || this;
            _this.state = { width: canvas.width, height: canvas.height, mode: move };
            _this._handleChange = _this._handleChange.bind(_this);
            _this._clickMode = _this._clickMode.bind(_this);
            _this._fitMode = _this._fitMode.bind(_this);
            _this._keyDown = _this._keyDown.bind(_this);
            return _this;
        }
        BodyComponent.prototype._keyDown = function (event) {
            if (event.target == document.body) {
                switch (event.code) {
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
        };
        BodyComponent.prototype._mouseMove = function (event) {
            // なるほど・・負の数のほうが前にくるのか・・・
            selector.show(-999);
            switch (this.state.mode) {
                case move:
                    selector.setPosition({
                        x: event.layerX - canvas.width / 2,
                        y: canvas.height / 2 - event.layerY
                    });
                    break;
                case scale:
                    // ボタンがおされていたら、なにがしする。
                    if (event.buttons != 0) {
                        var pos = selector.getPosition();
                        var width = Math.abs(canvas.width / 2 + pos.x - event.layerX) * 2;
                        var height = Math.abs(canvas.height / 2 - pos.y - event.layerY) * 2;
                        selector.setSize({
                            width: width,
                            height: height
                        });
                    }
                    break;
                case rotate:
                    if (event.buttons != 0) {
                        // マウスの位置からradianを求めるか・・・
                        var pos = selector.getPosition();
                        var side = canvas.width / 2 + pos.x - event.layerX;
                        var vert = canvas.height / 2 - pos.y - event.layerY;
                        var addDeg = 0;
                        if (side > 0) {
                            addDeg += Math.PI;
                        }
                        selector.setRotation(-Math.atan(vert / side) + addDeg);
                    }
                    break;
                default:
                    break;
            }
        };
        BodyComponent.prototype._mouseClick = function (event) {
            switch (this.state.mode) {
                case move:
                    def._confirmVideoObject();
                    break;
                default:
                    break;
            }
        };
        BodyComponent.prototype._changeMode = function (mode) {
            if (this.state.mode == mode) {
                this.setState({ mode: move });
            }
            else {
                this.setState({ mode: mode });
            }
        };
        BodyComponent.prototype._handleChange = function (item) {
        };
        BodyComponent.prototype._clickMode = function (item) {
            var mode = parseInt(item._dispatchInstances._hostNode.name);
            this._changeMode(mode);
        };
        BodyComponent.prototype._fitMode = function (item) {
            selector.setPosition({
                x: 0,
                y: 0
            });
            selector.setSize({
                width: canvas.width,
                height: canvas.height
            });
            def._confirmVideoObject();
        };
        BodyComponent.prototype.componentWillUnmount = function () {
            document.removeEventListener("keydown", this._keyDown);
            document.body.appendChild(canvas);
            canvas.style["position"] = "absolute";
            canvas.style["top"] = "-10000px";
        };
        BodyComponent.prototype.componentDidMount = function () {
            document.addEventListener("keydown", this._keyDown);
            canvas.style["position"] = "relative";
            canvas.style["top"] = "0px";
            this.refs["canvas"].appendChild(canvas);
        };
        BodyComponent.prototype.render = function () {
            var _this = this;
            var height = 100;
            try {
                var element = ReactDOM.findDOMNode(this);
                while (element != null && element != undefined) {
                    if (element.style["height"] != null && element.style["height"] != "") {
                        break;
                    }
                    element = element.parentElement;
                }
                height = element.offsetHeight;
                height -= 80;
            }
            catch (e) {
            }
            // このタイミングでサイズを計算しなおさないとだめなわけか・・・
            canvas.onmousemove = function (event) {
                _this._mouseMove(event);
            };
            canvas.onclick = function (event) {
                _this._mouseClick(event);
            };
            // 上の部分に適当なボタンを配置するものとする。
            // 配置するのはサイズと操作ボタンとしようと思う。
            return (React.createElement("div", null,
                React.createElement(Form, { inline: true, onChange: this._handleChange },
                    React.createElement(ButtonGroup, null,
                        React.createElement(Button, { onClick: this._clickMode, name: scale + "", active: this.state.mode == scale },
                            React.createElement("span", { className: "glyphicon glyphicon-resize-full", "aria-hidden": "true" })),
                        React.createElement(Button, { onClick: this._clickMode, name: rotate + "", active: this.state.mode == rotate },
                            React.createElement("span", { className: "glyphicon glyphicon-refresh", "aria-hidden": "true" })),
                        React.createElement(Button, { onClick: this._fitMode },
                            React.createElement("span", { className: "glyphicon glyphicon-fullscreen", "aria-hidden": "true" })))),
                React.createElement("div", { style: { border: "0px", height: height + "px" } },
                    React.createElement("div", { ref: "canvas", style: { overflow: "scroll", width: "100%", height: height + "px" } }))));
        };
        return BodyComponent;
    }(React.Component));
};
