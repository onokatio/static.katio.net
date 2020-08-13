---
title: "Reactを勉強してブログに導入した その1"
date: 2019-12-16 00:39:00 +0900
---

Reactを勉強してブログに導入したその1
===

この記事は、[onokatio Advent Calendar 2019](/adventcalendar/2019/onokatio) 15日目の記事です。

以前から、このブログは、wordpressやhugo等既存のフレームワークを使用せず、自力でスクラッチから構築しているという投稿をしました。  
その過程で、DOMを描画するためにcreateElementの多用、スタイルを設定するために複数行に渡り代入分が連なっていました。可読性も悪く、再利用性も低いです。

この現状を解決するために、コンポーネント分割ができるWebフロントエンドのフレームワークを選定し、最終的にReact.jsを採用するに至りました。

# React.jsとは

React.jsは、Webページ上の各要素（コンポーネントと呼ばれる）を分割し定義し、状態をもたせ、描画できるライブラリです。  
また、特徴として、JSXと呼ばれるhtmlを有効なjsコードとしてみなしDOM構造の記述ができる記法が採用されています。

# 導入

導入方法は色々あるのですが、極力自動化ツールなどは使用せず、シンプルに使用していきたいと考えています。その結果、このページを参考にすることにしました。

https://blog.usejournal.com/creating-a-react-app-from-scratch-f3c693b84658

## おおまかなReac.jsのビルドの流れ

先日、webpackをブログへ導入しました。React.jsは、webpackとbabelへ依存します。

babelは、JSX記法を通常のjsコードに変換する役割を持ちます。他にも、TypescriptからJavascriptへのトランスパイルや、古いECMAScriptバージョンへの下位互換性のために使用できるそうです。

webpackでは、.jsファイルを読み込む際にbabelを使用してJSXをJavasciptにトランスパイルします。

あとはReact.jsをnpmのモジュールとして読み込めば完成です。

## babelのインストール

```shell
$ npm install --save-dev @babel/core @babel/cli @babel/preset-env @babel/preset-react
```

- @babel/core: ランスパイルを行うbabelの本体
- cli: それをコマンドラインツールから行うためのcliパッケージ
- preset-env: es6以降のjsコードをes6以前で動作する変換ルール
- preset-react: JSX記法をjsへ変換するルール

とのことです。

> ちなみに、npmの先頭にアットマークがついているのが不思議だったのでしらべてみましたが、これはパッケージ名を単一の名前ではなく、ユーザー名/パッケージ名として指定したい場合に必要らしいです。  
>パッケージ名が被ってもユーザー名さえ違っていれば問題ないようにするため、なのですが、なるほどですね。

次に、`.babelrc`と呼ばれるファイルを作ります。babelでどのルールを使用するかの設定ファイルとのことです。

```json=
{
  "presets": ["@babel/env", "@babel/preset-react"]
}
```

## webpackからbabelを使う

webpackのインストール自体は既にできているため、割愛します。

webpackからbabelを使えるようになりましょう。babelローダーを追加します。

```shell
$ npm install --save-dev babel-loader
```

次に、jsファイルをbabelに読み込ませるようにしましょう。webpack.config.jsを編集します。


```javascript=
$ diff --git a/webpack.config.js b/webpack.config.js
index 9eeaa39..d027fcc 100644
--- a/webpack.config.js
+++ b/webpack.config.js
@@ -9,8 +9,14 @@ module.exports = {
         test: /\.scss$/i,
         use: ['style-loader', 'css-loader', 'sass-loader'],
       },
+      {
+        test: /\.(js|jsx)$/,
+        exclude: /(node_modules|bower_components)/,
+        use: ['babel-loader'],
+      },
     ],
   },
+  resolve: { extensions: ["*", ".js", ".jsx"] },
   output: {
     ecmaVersion: 2015,
   }
```

rulesではjs/jsxファイルへbabelを通すように指示、resolveでは拡張子js/jsxを省略してもimport構文が使えるようにしています。

## reactをインストールする

```shell
$ npm install react react-dom
```

今日は遅いのでここらへんにしておきましょう。明日実際にReactを使ってみようと思います。
