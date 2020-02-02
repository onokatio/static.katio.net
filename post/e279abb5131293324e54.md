---
title: DNSキャッシュ、したくない？
tags: RaspberryPi unbound dns
author: onokatio
slide: false
---
# tl;dr
ラズパイでdnsキャッシュ鯖立てました。ソフトはunbound使いました。別にラズパイじゃなくてもPOSIX系マシン(LinuxとかUnixとかOSXとか)ならできそうだけどたまたま足元にラズパイが落ちてたので。

# インストール

```
sudo apt install unbound
```

以上。自前ビルドしなくていいご時世はいいね。

# 設定
ぼくの場合```/etc/unbound/unbound.conf```が設定ファイルだった。
中を見たら、どうやら```/usr/share/doc/unbound/example/unbound.conf```がexampleらしい。

ということなので

```
sudo cp /usr/share/doc/unbound/example/unbound.conf /etc/unbound/unbound.conf
```
した。
ところどころに説明があるので適度に編集。最終的にコメント行を除いたらぼくはこんな感じになった

```:unbound.conf
server:
        verbosity: 1 #冗長化の設定
        num-threads: 4 #スレッド数
        interface: 0.0.0.0 #受け入れる宛先インターフェース
        msg-cache-size: 128m #キャッシュ
        msg-cache-slabs: 4 #スレッド数を同じ数を書いとけって言われた
        rrset-cache-size: 128m #キャッシュ
        rrset-cache-slabs: 4 #スレッド数を同じ数を書いとけって言われた
        infra-cache-slabs: 4 #スレッド数を同じ数を書いとけって言われた
        access-control: 192.168.0.0/16 allow #キャッシュを教えてあげるマシン
        key-cache-size: 128m #キャッシュ
        key-cache-slabs: 4 #スレッド数を同じ数を書いとけって言われた
        neg-cache-size: 128m #キャッシュ
forward-zone:
    name: "."
    forward-addr: 8.8.8.8 #キャッシュなかったらgoogleのdnsに聞きに行く
```

# 起動
```
sudo systemctl start unbound
```

あとサービスの自動起動もさせとく

```
sudo systemctl enable unbound
```
# 使ってみる
自分のパソコンの/etc/resolve.confの先頭に```nameserver 192.168.1.1```を追記しとく（ipアドレスはラズパイの奴）

# テスト

```
$ nslookup qiita.com
Server:         192.168.1.1
Address:        192.168.1.1#53

Non-authoritative answer:
Name:   qiita.com
Address: 54.248.122.184
```

うん、とりあえずうまくいってそう。心なしか早くなった気もする。
# 参考
http://unbound.jp/

