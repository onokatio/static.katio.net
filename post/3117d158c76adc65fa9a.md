---
title: Linuxで簡単に無線Lanアクセスポイントを作る
tags: WiFi LAN ラズパイ Linux create_ap
author: onokatio
slide: false
---
どうも。かちおです。
自分の学校の教室の壁にLanポートがあるが学内wifiは無いので、ラズパイでアクセスポイントを作ってみました。別にラズパイでなくとも動くことは確認しています。
※この記事の内容について、施設管理者の許可を得て実行しています。大学などによっては怒られるだけじゃ済まない可能性があるため、注意してください。

# 環境
- Linux系OS (ラズパイ1B+、ラズパイ3、Ubuntuノートパソコンで動作確認しました。) 
- 有線Lanと無線LanのNICが両方パソコンに積んであること（要するにパソコンに有線Lanポートと無線Lanの機能が両方あればOK。） 

 もしパソコンに機能が無い場合でも、USBで取り付けるタイプの有線Lanポートや無線Lan子機で動作可能。

# インストール
本来はhostapdというものでL2層でパソコンとwifiをつなげて、さらにその上でLinuxブリッジを作成して、IP も動的割当にするためにDHCPサーバーを建てなければいけません。
が、面倒なので、それらを自動化してくれるシェルスクリプトを使用します。
これはcreate_apというもので、コマンド１つで無線Lanアクセスポイントを作ることができます。

まずは依存しているパッケージをインストールしましょう。

```shell-session:UbuntuやDebian系の場合
$ sudo apt install bash util-linux procps hostapd iproute2 iw
```
CentosやRHEL系の場合は…ごめんなさい自分で調べてください。
Macの場合も…ごめんなさい。

次に適当な場所でcreate_apをダウンロードしましょう。

```shell-session:全OS共通

$ curl https://raw.githubusercontent.com/oblique/create_ap/master/create_ap
```

そしてコマンドとして使えるように、パスの通った場所に移動させましょう。
また、実行フラグも付けておきましょう。

```shell-session:全OS共通
$ sudo mv ./create_ap /usr/local/bin/
$ sudo chmod +x /usr/local/bin/
```

これでコマンドとしてcreate_apが使えるようになりました。
もしシェルの予測変換が聞かない場合は一旦ターミナルを消してもう一度ターミナルを実行してみてください。

# 使い方

まず、以下のコマンドでパソコンに乗っているNIC（ネットに接続する機械）を表示させましょう。

```shell-session:全OS共通
$ ip a
```

これを実行すると、だらだら〜っと表示が流れてきます。このなかでenoやenpやethで始まるものが有線Lanのポート、wlpやwlanで始まるものが無線Lanのポートです。これがそれぞれのNIC名になります。
もし複数Lanポートがあったり無線Lanの子機を接続してる場合はそれぞれ複数出てくると思います。とりあえずなんとなく雰囲気でどれがどれか察してみてください。

両方ともその名前を控えておいてください。

そしてコマンドの標準の使い方は以下です。

```shell-session:全OS共通
$ create_ap 無線LanのNIC名 有線LanのNIC名 SSID(Wifiの名前) パスワード
```

例として以下のようになります。

```
$ create_ap wlan0 eth0 test password
```

この場合スマホ等からtestという名前のwifiを見ることができ、passwordというパスワードで接続することができます。

# カスタマイズ

玄人むけです。結構色々とできるみたいです。

オプション

- -c 数字 # wifiのチャンネル番号を指定（デフォルトは1）
- --isolate-clients # wifiのクライアント同士が通信できなくなる
- --hidden # アクセスポイントを非表示にできる
- --freq-band 数字 # 2.4か5を指定することで、周波数帯を選べる
- --daemon # デーモン化し、プロンプトが帰ってくる。
- --stop 無線LanのNIC名 # そのNICでデーモン化して動いているcreate_apを止められる

