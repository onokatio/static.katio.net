---
title: VPN Gate(VPN over https)とかいう闇の力でVPNを使おう on Linux
tags: VPN SSL HTTPS
author: onokatio
slide: false
---
LinuxでSSL-VPNを使ってみましょ。

# VPN Gateって？
筑波大での研究の一環で、「政府による検問を回避」「オープンWifiでセキュリティ性を保つ」ために開発されているVPNプロジェクトです。
それで、このプロジェクトのために開発されているすごいVPNがSSL-VPNとか呼ばれています。

通常のhttp proxyのhttps版との違いは、https プロキシの場合通信できるプロトコルはHTTPだけですが、SSL-VPN(VPN over https)はHTTP以外のTCP通信をそのままカプセル化することができます。

# SSl-VPNって？
従来のVPNはTCPコネクションを貼るときに専用のポート（PPTPなら1723と47）を使います。しかしそれでは「80と443以外にアクセスする外向きのパケットは通さない」なんていう企業や国があった場合利用できません。
そのためSSL-VPNではL3をSSL/TLS(L4)に乗せています。
なのではたから見たらHTTPSサイトに接続しているようにしかみえないってわけです。これなら政府や企業も「インターネットを完全に遮断する」以外の方法では検問を掛けることができなくなります。

# VPN Gateプロジェクト用のVPN-SSLサーバー一覧

http://www.vpngate.net/ja/

これがサーバー一覧&公式サイトのURLです。サーバーによってはSSL-VPN以外にもOpenVPNやIPSecに対応しているものもありますね。
とりあえずここの一番上のサーバーのIPアドレスとVPN-SSLのポートを控えておきましょう。

# 環境
Ubuntu Server 16.04 LTS

# ソースコードのダウンロード

http://www.softether-download.com/ja.aspx

こちらから、「SoftEther VPN (Freeware)」→「Source code of SoftEther VPN」と辿って、自分のアーキテクチャを選択すればリンク一覧がでてきます。とりあえず一番上のものをダウンロードしておけば問題ないと思います。

# ビルド
ダウンロードしたファイルを回答すると、バージョン番号の名前のディレクトリが出てくるのでその中に入り、ビルドします。

```bash:shell
$ ./configure
$ make
$ sudo make install
```

# 使い方

## ルーティングの設定

まず、VPNサーバーに接続するときにVPNのネットワークを通られたら困るので、以下のコマンドでVPNサーバーへの通信だけはデフォルトのNICを通じて通信できるように設定します。

```shell-session:shell
$ sudo ip route add <VPNサーバーのip> via default dev <ネットに繋がってるNIC名>
```

## vpnclientサービスの起動
次に、起動します。Makefileがあるフォルダのbinの中に入り、以下のコマンドを入力してください。

```shell-session:shell
$ sudo vpnclient start
```

## vpnコマンドラインの起動

```shell-session:shell
$ sudo vpncmd
```

そうすると、プロンプトが出てきます。今回はクライアントの設定をしたいので2を押して決定します。その次は空欄で決定します。ちなみにこれうまくいかないことが結構あるので、できなかったら何回か試してみてください。

```bash:vpnccmd
vpncmd コマンド - SoftEther VPN コマンドライン管理ユーティリティ
SoftEther VPN コマンドライン管理ユーティリティ (vpncmd コマンド)
Version 4.22 Build 9634   (Japanese)
Compiled 2016/11/27 14:33:59 by yagi at pc30
Copyright (c) SoftEther VPN Project. All Rights Reserved.

vpncmd プログラムを使って以下のことができます。

1. VPN Server または VPN Bridge の管理
2. VPN Client の管理
3. VPN Tools コマンドの使用 (証明書作成や通信速度測定)

1 - 3 を選択: 2

接続先の VPN Client が動作しているコンピュータの IP アドレスまたはホスト名を指定してください。
何も入力せずに Enter を押すと、localhost (このコンピュータ) に接続します。
接続先のホスト名または IP アドレス:

VPN Client "localhost" に接続しました。

VPN Client>
```

## VPN用のNIC作成

次はVPN用の仮想NICを作成します。`Niccreate`と入力したあとに任意のNIC名(ここではvpn0)を入力しましょう。
そして次に有効するためにenableをしましょう。


```bash:vpncmd
VPN Client>Niccreate vpn0
NicCreate コマンド - 新規仮想 LAN カードの作成
コマンドは正常に終了しました。

VPN Client>Nicenable vpn0
NicEnable コマンド - 仮想 LAN カードの有効化
コマンドは正常に終了しました。
```

## アカウント登録

ユーザー情報を登録しましょう。ここでは名前を適当にvpngateとしています。


```shell-session:vpncmd
VPN Client>AccountCreate vpngate /SERVER:<VPNサーバーのIP>:<ポート> /HUB:<ハブ名> /USERNAME:<ユーザー名> /NICNAME:vpn0
```

筑波大学の公開サーバを利用する時には、ハブ名をVPNGATE、ユーザー名をvpnにしてください。

## パスワード追加

次にパスワードを設定しましょう。

__筑波大の公開サーバーの場合__

```bash:vpncmd
VPN Client>AccountAnonymousSet vpngate
AccountAnonymousSet コマンド - 接続設定のユーザー認証の種類を匿名認証に設定
コマンドは正常に終了しました。
```

__その他のサーバーの場合__

```bash:vpncmd
VPN Client>AccountPasswordSet vpngate
AccountPasswordSet コマンド - 接続設定のユーザー認証の種類をパスワード認証に設定
パスワードを入力してください。キャンセルするには Ctrl+D キーを押してください。

パスワード:****
確認入力  : ********

standard または radius の指定: standard

コマンドは正常に終了しました。
```

## 接続

そしてサーバーに接続しましょう。さっき登録したユーザー名を指定します。

```bash:vpncmd
VPN Client> AccountConnect vpngate
AccountConnect コマンド - 接続設定を使用して VPN Server へ接続を開始
コマンドは正常に終了しました。
```

これでvpnの接続は完了しました。exitと入力してvpncmdを終了しましょう。

## DHCP取得

次にipアドレスをもらってこなければいけないのでdhcpで取得します。
またこのときにnic名を指定するのですが、最初に指定したnic名の先頭にvpnを付加した名前になっています。

```shell-session:shell
$ sudo dhclient vpn_vpn0
```

# 参考
https://rauq04.blogspot.jp/2014/02/linux-softether-vpn-client-vpngate.html

