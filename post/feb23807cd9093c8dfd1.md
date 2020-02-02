---
title: 高校生がFreeBSD触ってみた
tags: UNIX FreeBSD
author: onokatio
slide: false
---
私は某所で現役JK(情報科高校生)をやっているのですが、今回どうしてもFreeBSD機を触らなければ行けない環境があり、Unix機に挑戦することになってしまいました。

# 概要

はじめましての人は、はじめまして。
私は某所で現役JKをやっているのですが、今回どうしてもFreeBSD機を触らなければ行けない環境がとなってしまいました。
良い機会なので普段Ubuntu ServerかCentOSしか触ったことのない私が初Unix OSを触ってみることにしました。
この記事では、初期設定から、大体触っていて感じたLinuxとの違いまで書くつもりです。
目標としては、OSセットアップからLAMP環境でWordpressインストールくらいまで（したい）

ちなみにコードとかは手入力してるので省略とか誤字とか結構ある。ごめんね><

# 今回の環境

`FreeBSD 11.0` on `VirtualBox` on `Ubuntu server 17.04`

基本的にVMのターミナルを弄るつもり。ネットワークはVirtualBoxの設定でNATにしておいた。

# OSのインストール

公式サイトからvmdkイメージを落としてきてVirtualBoxにぶち込みました。
具体的に言うと[ここ](https://www.freebsd.org/ja/where.html)の仮想マシンイメージのamd64(64bit cpu)を選択して落としてきた。

# 起動

![k.png](https://qiita-image-store.s3.amazonaws.com/0/154157/3b9ff4ee-f2f9-456f-0936-bf909144ac83.png)
とりあえず起動してみたら数秒ブートローダーが表示された。たぶんデフォルトのマルチユーザーってので大丈夫そうなので放置したら無事ログイン画面に行きました。

![k3.png](https://qiita-image-store.s3.amazonaws.com/0/154157/3ccd4988-6236-f1e0-d1a1-2cc5ea767df5.png)

ログインは、普通にrootと入力すれば特にパスワードを効かれることもなくシェルまで入れました。

# ネットワーク

奇跡的にpingコマンドはあったのですが、8.8.8.8にpingが通らない。ということで第一関門のようです。とりあえずip aしてみるがコマンドがない。だめもとでifconfigをしたらありました。ifconfig -aしてみたら以下のようになった。

![image.png](https://qiita-image-store.s3.amazonaws.com/0/154157/440940d2-781c-ce41-06c5-967e38f7c153.png)

lo0がループぽいので、消去法でem0がメインNICぽい。でもUPしてないようなのでUPさせたい…がまたipコマンドが無いのでggった。

そしたらifconfigコマンドでできるとのこと。なので以下のようにNICのUPとDHCPの取得までしてみた。

```shell-session:shell
# ifconfig em0 up
# dhclient em0
```

![image.png](https://qiita-image-store.s3.amazonaws.com/0/154157/38cf2dc5-5bfe-123d-a0b2-5f84b03faceb.png)

うん。無事10.0.2.15てのが割り振られたみたい。

![image.png](https://qiita-image-store.s3.amazonaws.com/0/154157/4ca4abbe-247a-fd9c-e4ec-5a3b32f9198f.png)

pingもちゃんと帰ってきてる。やったね！
ちなみにルーティングは`netstat -nr`でできるようです。ってかLinuxでも同じくnetstatでできるとのこと。知らなかった…。

# パッケージ管理

Debian系だとdpkg(apt)、RHL系だとyumが入ってるので、FreeBSDにもあるかな〜っと思ったらありました。`ports`と`package`の2種類らしいです。しかもpackageはpkgという次世代バージョンが出ているとのこと。
2つの違いを調べてみたところ、portsはいわゆるソースのtarballでmake installする感じで、いわゆるdpkgでいうdeb作成みたいなもの。ソースから何かをインストールするときに使えるらしいです。
そしてpackage(pkg)はいわゆるパッケージインストーラーで、ビルド済みのバイナリをインターネットから落としてインストールできるらしいです。依存関係も解決してくれるとのこと。こっちのほうがaptとかに通ずるものがありますね。

とりあえず私は、以下のようにcurlをインストールしてみました。
ちなみに、どうやら初回起動時にpkg本体をダウンロードして来ているみたいです。
また、インストールするときにapt update的なことも自動でやってくれるみたいです。

```shell-session:shell
# pkg install curl
```

ちなみにpkgの使い方は簡単に書くと以下のよう。

```shell-session:shell
# pkg install <package name>
# pkg delete <package name>
# pkg info <package name>
# pkg upgrade
# pkg search <package name>
# pkg autoremove
# pkg claen
```
うん、まんまaptだね。

# ファイアウォール
インターネットに繋がったみたいなので、とりあえず壁だけ作ってみます。iptablesコマンドがないので調べてみると、firewall(ipfw)というのが動いているらしいです。
どうやら基本概念はinもoutもdenyするようです。また、設定はシェルスクリプトを作ってコマンドを叩くとのこと。CentOSとかでファイルに追記してくのと感覚似てますね。

### シェルスクリプトで設定ファイルを書く

まずipfwのルールを書く必要があるらしいです。サンプルファイルは`/etc/rc.firewall`とのこと。中身はシェルスクリプトとのことですが、別にどこでもいいらしい。でも色々なサイトでは`/usr/local/etc/ipfw.rules`に置くことが多いようなので便乗してそのパスに置いてみる。
あ、言い忘れてましたがファイアウォールの設定見するとsshは落ちるので直接コンソールから弄ったほうが良いらしいです。といってもssh鯖立ててないので私はもちろんコンソールですが…。

```shell-session:shell
# cp /etc/rc.firewall /usr/local/etc/ipfw.rules
# vi /usr/local/etc/ipfw.rules
```

とりあえず長いです。3行目くらいで読む気失せました。とりあえず中でやってるのを斜め読みすると、以下のようになってました。

>
- local to localを許可
- local to externalを許可
- lan to local（※ただしブロードキャストに限る）を許可
- 確立したtcpを許可
- 鯖で使われやすいポート開放(80,443,25,53 etc...)

とりあえず、本当はまずい（使わないポートは閉じたほうが良い）のですがまあ今回はデフォルトでなんとかなりそうなのでこのまま続行します。

### ipfwを有効にする

systemdみたいなのがあるのかな〜って思っていたらところがどっこい。どうやらFreeBSDはシステムの設定をすべて`/etc/rc.conf`と`/etc/defaults/rc.conf`に書くらしいです。ほえ〜。ということでipfwに関する設定を追記していきます。
基本的に`/etc/defaults/rc.conf`を読んだあとに`/etc/rc.conf`を読んで`/etc/rc.conf.d/*`を読むらしいです。
なので`/etc/rc.conf`の方を書き換えていこうと思います。

```shell-session:shell
# vi /etc/rc.conf

#以下を追記

firewall_enable="YES"
firewall_logging="YES"
firewall_script="/usr/local/etc/ipfw.rules"
```

これで再起動してみます。
そして本当に設定できてるか、`iptabels -L`のipfw版で確認してみます。

```shell-session:shell
# ipfw list
```

![image.png](https://qiita-image-store.s3.amazonaws.com/0/154157/3023a92a-12e1-53ea-b764-20d410e60651.png)

はい。いい感じに動いてるね。しかしまたしてもipアドレスの設定がリセットしてしまった…。

### インターフェイス設定の永続化っぽいことしてみる

調べたところ、またしてもrc.confを書き変える模様。とのことで以下のように変更してみた。

```shell-session:shell
# vi /etc/rc.conf

# 以下の行を追記
network_interfaces="em0"
ifconfig_em0="DHCP"
# あとこの際ホストネームまで設定しておく。以下を追記。
hostname="kirino"
```

また再起動する。

![image.png](https://qiita-image-store.s3.amazonaws.com/0/154157/3eee3cff-361c-5883-2902-e211b7a67817.png)

よし。これでDHCPで降ってくるipが、メインのNICに自動追加されるようになりました。

### DNSの名前解決をしてみる

これはLinuxと同じく`/etc/resolv.conf`を書き換えればいいらしい。とりあえず8.8.8.8を追加しといた。が…dhcpによってまんまと次回起動時に消されてしまった。
ということでどうやら本当は`/etc/dhclient.conf`に書くらしいです。あと文法も少し違うらしいです。
ということで`supersede domain-name-servers 8.8.8.8;`と書いて再起動してみました。

----

長くなりそうなので、一旦ここらで切りたいと思います。
続きは後日…

