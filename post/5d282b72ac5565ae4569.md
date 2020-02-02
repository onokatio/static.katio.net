---
title: 【シェル芸奥義】tputを使ってみる【エスケープシークエンス】
tags: tput シェル芸 シェル
author: onokatio
slide: false
---
シェル芸を極めてみる。

# TL;DR

- echo（POSIX系のターミナル）はエスケープシークエンスで色とか座標とか変えられる
- C言語だとncursesとかが近い
- tputはそのエスケープシークエンスをラップしてくれてる

# echoでエスケープシークエンスって？

シェルのechoにはエスケープシークエンス（特殊文字）で色やカーソルの座標を変えることができます。
たとえば以下のコマンドを実行してみてください。

```shell-session:shell
$ echo -e '\e[31m HelloWorld'
```

ね？赤色になったでしょう。つまりは、バックスラッシュeとmで番号を挟むとそれに対応した文字色や背景色、カーソル位置なんかを弄れたりするのです。

![image.png](https://qiita-image-store.s3.amazonaws.com/0/154157/5501557c-ef7f-1ed8-b1e3-93eb34eab679.png)

ちなみに以下をみれば他にもいろいろと弄れることがわかります。色の変更も点滅も下線とかも。

[http://misc.flogisoft.com/bash/tip_colors_and_formatting](http://misc.flogisoft.com/bash/tip_colors_and_formatting)

# で、tputって？

例えばさっきの場合は人によって赤色にならなかった方も居るかもしれません。ていうのも、ターミナルエミュレーターの種類によって微妙にエスケープシークエンスの書き方が違ったりするからです。しかもさっきのだと見にくい。圧倒的に呪文。
ということでさっきの呪文をラップして（使いやすいようにして）くれてます。
つまりは、tputコマンドを実行するだけでさっきの謎呪文と同じ効果が得られるのです。
それじゃあ再び以下のようにコマンドを実行してください。

```shell-session:shell
$ tput setaf 1 && echo 'HelloWorld'
```

ね？赤色になったでしょ。っていうわけでtputをechoと同じコマンド行で実行したり同じシェルスクで実行したりすると、次から標準出力が装飾できるようになります。

![image.png](https://qiita-image-store.s3.amazonaws.com/0/154157/30421211-5475-46fd-2825-e0b3d545129d.png)

# tput装飾一覧

|色番号|色|
|:-:|:-:|
|0|黒|
|1|赤|
|2|緑|
|3|黄色|
|4|青|
|5|マゼンタ|
|6|シアン|
|7|白|

```
$ tput setaf <色番号> #文字色を色番号にする
$ tput setab <色番号> #文字色を色番号にする
$ tput cup <y座標> <x座標> # 上からx行目左からy文字目にカーソル移動
$ tput bold #太字
$ tput clear # clearコマンドと同じ効果
$ tput sgr0 # 装飾解除
$ tput cols # ターミナルの横幅を文字数で出力
$ tput lines # ターミナルの縦幅を文字数で出力
$ tput civis # カーソル非表示
$ tput cnorm # カーソル表示
```

あと詳しいことは`man terminfo`を読めばとても詳しく書いてあります。またターミナルによって対応していないものは変化がないので注意。

それでは快適なシェルの旅をお楽しみください！

