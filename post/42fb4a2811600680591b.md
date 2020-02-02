---
title: Cloudflareが1.1.1.1で超高性能DNS始めたし、いっちょ俺のパソコンもDNS over HTTPSしてみる
tags: Linux cloudflare dns
author: onokatio
slide: false
---
# Cloudflareが1.1.1.1で超高性能DNS始めたし、いっちょ俺のパソコンもDNS over HTTPSしてみる

はいど〜も！バーチャルYoutuberのおのかちおです！
先日、Cloudflareが 1.1.1.1:53 でパブリックDNSを始めたことが話題になってますよね。Googleが8.8.8.8でやってるあれと同じです。

![k.png](https://qiita-image-store.s3.amazonaws.com/0/154157/9b498681-c9b9-5adc-39e4-bd87c946f78e.png)

しかもこれ、超速いんですよね。自分の手元からだと、8.8.8.8の10倍速い。

![k1.jpg](https://qiita-image-store.s3.amazonaws.com/0/154157/01afb9ed-5f4b-bf37-33ec-d5f0b2b125a1.jpeg)


# 1.1.1.1の主な特徴

- ログを保管しない。破棄する。
- IPv6 対応
- DNSSEC の対応
- DNS over HTTPS の対応
- DNS over SSL の対応
- …

# IPアドレス

1.1.1.1
1.0.0.1
2606:4700:4700::1111
2606:4700:4700::1001

覚えやすくていいですね。

# DNS over HTTPS

DNS over HTTPSは、DNS要求をSSLで暗号化できるものです。また、通信するポートが443なため、80と443以外のポートで外に出れない環境などでも使用することができます。

Cloudflareが、手軽にDNS over HTTPSを使えるバイナリを提供しています。

https://developers.cloudflare.com/argo-tunnel/downloads/

```
$ wget https://bin.equinox.io/c/VdrWdbjqyF/cloudflared-stable-linux-amd64.tgz
$ tar xvf cloudflared-stable-linux-amd64.tgz
$ sudo mv ./cloudflared /usr/bin/
```

このcloudflaredは、元々Cloudflareとwebサービスをつなげる機能がメインですが、今回はそれを使いません。今回はproxy-dnsという機能を使用します。

proxy-dnsは、cloudflaredが127.0.0.1:53で起動します。
そこにリクエストが来ると1.1.1.1で動くHTTPSなDNSサーバーに問い合わせをし、帰ってきます。
つまりは、DNSとDNS over HTTPSの変換器的な役割ですね。
さらに、このcloudflaredは内部にキャッシュを持っているため、2回目からの問い合わせは高速になります。

さっそく起動しましょう。

```
$ sudo cloudflared proxy-dns

INFO[0000] Adding DNS upstream                           url="https://cloudflare-dns.com/.well-known/dns-query"
INFO[0000] Starting metrics server                       addr="127.0.0.1:49312"
INFO[0000] Starting DNS over HTTPS proxy server          addr="dns://localhost:53"
```

これで、ローカルの53でdns解決ができます。ためしてみましょう。

```
$ dig google.com @127.0.0.1

; <<>> DiG 9.12.1 <<>> google.com @127.0.0.1
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 1493
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1536
;; QUESTION SECTION:
;google.com.                    IN      A

;; ANSWER SECTION:
google.com.             152     IN      A       216.58.214.14

;; Query time: 131 msec
;; SERVER: 127.0.0.1#53(127.0.0.1)
;; WHEN: 月  4月 02 23:34:56 JST 2018
;; MSG SIZE  rcvd: 65

```

自分の実験だと、8.8.8.8が40ms、1.1.1.1が4msなので、そこそこ遅いですね。
ただ、外部DNSが使えない社内や学内から使いたいときにはとても便利だと思います。

# サービスにする

毎回コマンドを入れていたらきりがないので、systemd用のserviceファイルを作りましょう。

```ini:/etc/systemd/system/proxydns.service
[Unit]
Description=Proxy dns server over https
Before=network.target

[Service]
Type=simple
ExecStart=/usr/bin/cloudflared proxy-dns

[Install]
WantedBy=multi-user.target
```

起動させましょう。

```
$ sudo systemctl start proxydns.service
$ sudo systemctl enable proxydns.service #自動起動させたい場合のみ
```

あとは、NetworkManagerでDNS設定に書き足したり、systemd-resolvedで使うなり、自由に設定しましょう。

# さいごに

DoH (DNS over HTTPS)を使うことで、一定の環境下でも外部DNSに接続することができます。
> ちなみに、dns-cryptという汎用的なDoHデーモンなどを使うことで、1.1.1.1を含む様々なDoHサーバーを使うこともできます。

これから利用者が増えるに従って速度も落ちるかもしれません。今後に期待したいところです。

参考: https://developers.cloudflare.com/1.1.1.1/dns-over-https/cloudflared-proxy/

