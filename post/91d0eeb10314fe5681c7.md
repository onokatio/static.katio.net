---
title: ArchlinuxでGoogle ChromeとChromiumの比較
tags: archLinux Chrome
author: onokatio
slide: false
---
突然ですが、僕の推しブラウザはChromeです。
ArchliuxでもChromeを使おうと思ったのですが、いろいろパッケージがあり、なにをどうすればいいかわからなかったのでまとめました。

# パッケージ

- chromium
- chromium-beta
- chromium-dev
- chromium-snapshot-bin
- google-chrome
- google-chrome-beta
- google-chrome-dev

chromium以外はAURです。
元々Google Chromeは、オープンソースである`Chromium`と、Google固有の機能などを追加した`Google Chrome`の２つが存在します。

Google Chrome = Chromium + α です。
ただ、Google Chromeはクローズドソースです。
ChromiumでOSS開発をし、自分たちに重要なものはクローズで追加する、頭の良い開発方法を取っています。

# Google ChromeとChromiumの主な機能差分

Google ChromeでできてChromiumでできないこと

- Flash Playerの再生・実行
- AAC, H.264, MP3の再生
- PDFビューア(v37からchromiumにも追加されました)
- サンドボックス機能
- クラッシュレポート
- コンテンツ保護系
- 同期機能

ある程度、ブラウザに機能を追加するプラグインが権利の関係で同梱されていないことが原因です。
同期機能自体は、Googleのサーバーを使っていることが原因です。
Google ChromeにはGoogleのサーバーにアクセスするためのAPIキーが埋め込まれていますが、Chromiumは自力ビルドなためありません。

※ただ、ArchのAURにあるchromiumは解析されたAPIキーが入ってるらしいです

自力でFlash Playerの実行とPDFビューワ、コンテンツ保護系を追加するには、以下のパッケージをインストールします。

- pepper-flash 
- chromium-libpdf (※今は要らない)
- chromium-widevine

# API系

ブラウザ本体に機能を追加する「プラグイン」ですが、Google Chrome、Firefoxなど、ブラウザによってAPI規格が異なりますが、ある程度共通化されています。

Google Chrome : PPAPI
Firefox ： PPAPI, NPAPI(flash playerのみ)

Flash playerの対応するパッケージは以下です。

PPAPI用のFlashplayer： `flashplugin`
NPAPI用のFlashplayer： `pepper-flash`

# さいごに

よほどのことがない限り、`google-chrome`パッケージを使うことをおすすめします。
ただ、自分は新しいもの好きなので、一日一回ビルドされる`chromium-snapshot-bin`を使っています。人によって最適なChromeを選びましょう。

