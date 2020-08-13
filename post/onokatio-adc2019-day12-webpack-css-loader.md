---
title: "webpackをsass対応 & CSSインポートしてみる"
date: 2019-12-12 23:35:00 +0900
---

webpackをsass対応 & CSSインポートしてみる
===

この記事は、[onokatio Advent Calendar 2019](/adventcalendar/2019/onokatio) 12日目の記事です。

先日、webpackを導入しましたが、今度はsass対応とcssのロードをしてみます。

# webpackのローダーとは

webpackのローダーとは、名前の通り、何らかのファイルをwebpackが最終的に生成するmain.jsへ含める機能を持つnode.jsプラグインです。

以下に軽くローダーを挙げてみます。

## css-loader

https://webpack.js.org/loaders/css-loader/

こいつは、`.css`ファイルを、jsのDOMの`style`系オブジェクトを生成するjsコードに変換するプラグインです。また、import文やurl()記法等、cssの依存関係を解釈するのもここのようです。  
書いたcssが、jsとして認識できる形になってimportできるっぽいですね。その他にも、これ単体でCSSの拡張記法が使えたりするようです。

## style-loader

https://webpack.js.org/loaders/style-loader/

css-loaderは、あくまでcssをjs形式のオブジェクトに変換し、jsの中で`.style`メンバに特定クラスのスタイルの代入ができるようにする役割しか持ちませんでした。そうではなく、importしたcssファイルを`<style></style>`としてhtmlへ出力する役割があるのがこのローダーです。  
正確には、htmlではなくmain.jsへ、`style`エレメントをcreateElementしてそのinnerTextにcssを突っ込むコードを書き込んでいるようです。

## sass-loader

https://webpack.js.org/loaders/sass-loader/

sass-loaderは、sass/scssファイルをcssファイルへトランスパイルするローダーです。

# ローダーを使う

とりあえず、URL先の指示に従ってプラグインをインストールします。

```shell
$ npm install --save-dev css-loader style-loader sass-loader node-sass
```

で、`src/index.js`にimport文を追加します。

```diff=
diff --git a/src/index.js b/src/index.js
index a9c513c..435821d 100644
--- a/src/index.js
+++ b/src/index.js
@@ -5,6 +5,9 @@ import { RenderIndex } from './RenderIndex.js'
 import { RenderMarkdown } from './RenderMarkdown.js'
 import { RenderSlide } from './RenderSlide.js'

+import './styles/main.scss'
+import './styles/reset.scss'
+
 //navigator.serviceWorker.register('/serviceworker.js')
 //     .then( () => console.log('sw registered.') )

```

es2015のimport記法でいう単純な展開と同じで、importのあとにfromなどをつけずにファイル名のみ指定します。

で、webpack.config.jsというファイルを作成し、以下のように設定します。

```js=
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
};
```

ちゃんと説明を見ずにコピペしましたが、やってることはmodule.exportsなのでこれもどこかからか読み込まれる設定DSL用のjsファイルで、rules:の中に配列としてルールを入れていけば良いんだと思います。

testは正規表現で、useは使用するローダーの順番らしいです。右から順に適用されるとのこと。

最後にhtmlでの手動linkタグを消します。

```diff=
diff --git a/index.html b/index.html
index 61b377b..d26f6c3 100644
--- a/index.html
+++ b/index.html
@@ -30,9 +30,9 @@
     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/3.8.0/css/reveal.min.css" integrity="sha256-OxiHrn+gXudPDHxTvXiQzeFjZU/FllSSPmOOYAZ1O/g=" crossorigin="anonymous" />
     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/3.8.0/css/theme/black.min.css" id="theme" integrity="sha256-FMkhwnY485HRoNNbvFB6F2PHHAfpGSbJQwgGXSCPozM=" crossorigin="anonymous" />
     -->
-    <link rel="stylesheet" href='/reset.css'>
+    <!-- link rel="stylesheet" href='/reset.css' -->
     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.10/styles/solarized-dark.min.css" integrity="sha384-p6WZvQLdHPn3qN+qHxW8HTPV11ZECxUCxol/Rg+glNgBrkyTUwNiPIrXE2EESD3z" crossorigin="anonymous">
-    <link rel="stylesheet" href='/main.css'>
+    <!--link rel="stylesheet" href='/main.css' -->

     <script src="https://cdn.jsdelivr.net/npm/emoji-toolkit@5.0.5/lib/js/joypixels.min.js" integrity="sha384-/V6VO2jGZCWFzezwso2jMRnCax57hJMEraI7gDvClvJTqTh8Ij7IzfAmdzkHQDDS" crossorigin="anonymous"></script>
     <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/emoji-toolkit@5.0.5/extras/css/joypixels.min.css" integrity="sha384-4ok+tBQQdy5hcPT56tzcE11yQ2BkN0Py1uDE8ZOiXYstHOpUB61pJafm+NidByp4" crossorigin="anonymous">
```

これで完了です。  
npm run startでブラウザから確認したところ、動的に`<head>`以下に`<style>`が追加されているのが確認できました。
