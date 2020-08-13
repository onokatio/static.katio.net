---
title: "フロントエンドの環境を勉強しつつブログをwebpack対応にする"
date: 2019-12-11 01:07:00 +0900
---

フロントエンドの環境を勉強しつつブログをナウいコードにする
===

この記事は、[onokatio Advent Calendar 2019](/adventcalendar/2019/onokatio) 10日目の記事です。

さて、魔改造を続けてきたこのブログですが、純粋なhtml/jsのみで管理することに限界を感じてきました。何でもかんでも`<script>`タグでライブラリを読み込むのにも無理があります。

そこで、この際モダンなWebフロントエンドで使われている技術を勉強して活用してしまおうではないか、というのが今回の考えです。

# 過去のフロントエンド界の歴史について


参考:
- https://havelog.ayumusato.com/develop/others/e630-npm_meets_frontend.html
- https://qiita.com/jonghyo/items/e931f7b6357995314599


ここから読み取るに、npmがbowerとwebpackを、bowerがフロントエンドのパッケージを、webpackがファイルの結合を担っています。
ただ、bowerは現在あまり活発に使われては居ないようです。

# 大体理解してみる

参考:
- https://goworkship.com/magazine/how-to-webpack/
- https://www.slideshare.net/ssuser46977e/webpack-why-cant-you-understand-the-webpack

npmでwebpack.jsを導入し、node.js環境で実行します。webpackは、複数のjsファイルをnode.js風にモジュールとして読み込む形式(import/export)を、ブラウザで読めるように結合してくれる役割があります。またgulpのように、sassやts、hamlのトランスパイル、lintなど動的にプラグインを読み込み、バンドル中のファイルへ手を加えることができるようです。

ということで、以下導入していきます。

# webpackを使う

https://webpack.js.org/guides/getting-started/

なるべく公式のドキュメント（英語）を読みながらやります。こういうのは一次ソース見ながら動かすのが一番いい気がする…。

```shell
$ npm init
$ npm install webpack webpack-cli --save-dev
```

で、どうやら`~/src`以下にjavascriptをすべて入れるのがお作法のようです。ということで、ディレクトリを作ってそこへjsを放り込みます。


```shell
On branch master
Your branch is ahead of 'origin/master' by 2 commits.
  (use "git push" to publish your local commits)

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   .gitignore
        renamed:    RenderAdventCalendar.js -> src/RenderAdventCalendar.js
        renamed:    RenderIndex.js -> src/RenderIndex.js
        renamed:    RenderMarkdown.js -> src/RenderMarkdown.js
        renamed:    RenderSlide.js -> src/RenderSlide.js
        renamed:    index.js -> src/index.js
```

ついでに、import文で他のjsファイルを読み込むように設定します‥と言いたいところですが、実はes6のimport/exportは今日の午前中終わらしておいたので、特にすることはありません。

で、以下がコンパイルコマンドとのことです。

```shell
$ npx webpack
```

npxはnpmに含まれているネイティブバイナリ実行ツールだとか。まあおそらくnode_modules/.bin/以下の何かを実行しているんでしょう。

ここまで来ると、./dist/というディレクトリが完成します。その中を見ると、src/にあるすべてのjsファイルがつながって、かつ変数名などが文字数削減されているのがわかります。

あと、package.jsonのscriptにbuild: webpackを書いておくと良さそうです。ここへ書かれたコマンドは、npm runのサブコマンドとして認識されるので、次回から`npm run build`でwebpackが走ります。

どうやらwebpack.config.jsはまだ作成しなくてもよさそうです。

# ライブラリをnpmでインストールする

試しに、marked.jsをcdnからではなくnpm経由で読み込みます。

まず、npm install markedして、scriptタグを消して…

```diff=
diff --git a/index.html b/index.html
index 5a646a2..e2572ca 100644
--- a/index.html
+++ b/index.html
@@ -34,7 +34,6 @@
     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.10/styles/solarized-dark.min.css" integrity="sha384-p6WZvQLdHPn3qN+qHxW8HTPV11ZECxUCxol/Rg+glNgBrkyTUwNiPIrXE2EESD3z" crossorigin="anonymous">
     <link rel="stylesheet" href='/main.css'>

-    <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/0.6.1/marked.min.js" integrity="sha384-EiOGSCEMZcrL0lbddeRRJEF8+qWFNoCH1guk5GrDVcojQEy4XZMchqvucM+f1WCG" crossorigin="anonymous"></script>
     <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.10/highlight.min.js" integrity="sha384-Lq4dkOUVSNElT8uHCChL3Wlg1H2PWo8qxHqROqOMeVSHAtBe0lWY8KT+yJwHNQ2Q" crossorigin="anonymous"></script>
     <script src="https://cdn.jsdelivr.net/npm/emoji-toolkit@5.0.5/lib/js/joypixels.min.js" integrity="sha384-/V6VO2jGZCWFzezwso2jMRnCax57hJMEraI7gDvClvJTqTh8Ij7IzfAmdzkHQDDS" crossorigin="anonymous"></script>
     <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/emoji-toolkit@5.0.5/extras/css/joypixels.min.css" integrity="sha384-4ok+tBQQdy5hcPT56tzcE11yQ2BkN0Py1uDE8ZOiXYstHOpUB61pJafm+NidByp4" crossorigin="anonymous">
```

で、importして…

```diff=
diff --git a/src/RenderMarkdown.js b/src/RenderMarkdown.js
index d607be7..fa577ce 100644
--- a/src/RenderMarkdown.js
+++ b/src/RenderMarkdown.js
@@ -1,5 +1,7 @@
 "use strict";

+import marked from 'marked';
+
 marked.setOptions({
        langPrefix: 'hljs ',
        highlight: (code) => hljs.highlightAuto(code).value,
```

これでnpm run buildします。うまく動きました。この調子で他のライブラリもロードしていきましょう。

# webpack dev serverを導入する

どうやら、毎回webpackでビルドをせずとも、ファイルの更新を検知して自動でホストしてくれるライブラリがあるようです。入れます。

```shell
$ npm install webpack-dev-server --save-dev
```

で、package.jsonにstart: webpack-dev-serverを追記しておきます。これで完了です。

# まとめ

webpackを導入しましたが、案外簡単に入門できました。しっかり勉強したことはなかったものの、ざっくりとしてイメージを持っていたのが役に立ったのかなと思います。

ひとまず、これで依存関係はキレイに解決できるようになったので、今後はトランスパイルや圧縮を試していこうと思います。


あ、あとnetlifyでnpm run buildを忘れずにね…。（今気づいた）
