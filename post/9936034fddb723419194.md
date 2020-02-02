---
title: 暗号通貨（仮想通貨）プラットフォーム、NEMのウォレットを、ブラウザの拡張機能で動くようにしてみた。
tags: Bitcoin NEM xem ブラウザ拡張機能
author: onokatio
slide: false
---
# 暗号通貨（仮想通貨）プラットフォーム、NEMのウォレットを、ブラウザの拡張機能で動くようにしてみた。
## 名前
NanoWalletBrowserAppにした。そのまんま。
## 前書き
なぜ「生成する奴」と表現するかというと、手順が簡単すぎて**作った**というのは少し言い過ぎな気がしたからです。

ここでは、仕組みや技術的（？）解説をします。ダウンロードや使い方は以下のリンクからどうぞ。

https://github.com/onokatio/NanoWalletBrowserApp/releases/tag/v0.0.1
`
### そもそも暗号通貨（仮想通貨）ってなに？という方→

- （…。これといった良いサイトが見つかりませんでした。申し訳ないが自力で…）

### NEMってなに？という方→

- https://www.nem.io/
- http://jpbitcoin.com/bitcoin2/neweconomymovement
- http://newcoin.jp/free/nem

以上のサイト様が参考になるかと思われます。

## 1. 仕組み
Google Chrome 拡張機能、Google Chrome アプリのインストールファイル２つを生成しています。

現在のほとんどのブラウザの拡張機能は、webアプリ形式となっており、実態はhtmlファイル群です。なのでwebアプリであるNanoWalletのファイルを少しだけ弄って、そのままwebアプリとして使っています。

## 2. やってること

Makefileの中では、主に２つのことをしています。

最新版のNanoWalletのダウンロード・ビルド
NanoWalletのビルド成果物を元に、いくつかの設定ファイルを付け加えて、各ブラウザの拡張機能インストーラー形式にコンパイル
これだけです。

2をもう少し詳しく説明します。Makefileを使って説明していきます。 

``` Makefile:Makefile
dist/chrome_extension.crx: src/NanoWallet/build src/chrome_extension/bg.js src/chrome_extension/manifest.json src/logo128.png
	mkdir -p dist/chrome_extension
	cp -R $^ dist/chrome_extension/
	cat src/header.json > dist/chrome_extension/manifest.json
	cat src/chrome_extension/manifest.json >> dist/chrome_extension/manifest.json
	google-chrome --pack-extension=$(shell pwd)/dist/chrome_extension
	$(RM) -rf dist/chrome_extension
	$(RM) dist/chrome_extension.pem
```
これはChrome拡張機能のインストーラーを作る手順です。
二行目から、

- 新しいディレクトリを作成
- 必要なロゴ画像、NanoWallet本体、拡張機能用JSをコピー
- 設定ファイルを、ブラウザ共通のものにChrome拡張専用設定部分を付け足してコピー
- Chromeでコンパイル
- 作業用フォルダを削除
- 生成された拡張機能の署名ファイルを削除（今のところストアに公開等しないため）

の一連の流れを実行しています。

以上です。ブラウザによって多少の差異はありますが、ほとんど変わりません。

それでは、良い暗号通貨沼ライフを〜

