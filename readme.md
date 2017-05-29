# takcast.media.imagemixer

# 作者

taktod

https://twitter.com/taktod

poepoemix@hotmail.com

# 概要

electronで作ってみる配信ツールのtakcastで利用する映像を合成するplugin
three.jsで2D描画させます。

ツールバーを選択することで
映像を拡大縮小したり(sキーでも切り替え可能)
任意の角度に回転したり(rキーでも切り替え可能)
表示領域全体にfitさせたりできます。

# 使い方

takcastのプロジェクトで

```
$ npm install taktod/takcast.media.imagemixer
$ npm run setup
```

としてインストール・有効化してください

# 構成

## node/index.ts

node側処理用のpluginエントリー
今回は利用しない

## render/index.ts

描画まわりの処理を実施する動作

## render/videoObject.ts

three.jsで利用するパネルを管理するオブジェクト

## render/ui/bodyComponent.tsx

実際に描画を実施するGUIの動作の定義