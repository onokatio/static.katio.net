---
title: DNS over HTTPS over Tor to Cloudflareしよう。名付けてDoHoT。
tags: dns HTTPS Tor
author: onokatio
slide: false
---
# 1.1.1.1 について
DNSブロッキングを受けて、DNS over HTTPSが注目されました。
ただ、安全を気にする方は、`1.1.1.1`が信用できるのか、`1.1.1.1`へのネットワークは安全なのかについて疑問を抱くと思います。

`1.1.1.1`を提供するCloudflareは、米国の企業です。
ただ、`1.1.1.1`のバックエンドはGeoipなどで分散されているはずなので、必ずしも太平洋のファイバーを通って西海岸へと通信するわけではなさそうです。(≒PRISMでパケット監視されるとは限らない)
Cloudflareは、定期的に透明性レポートを発行していますが、あくまでレポートです。

`1.1.1.1`のアドレスを提供したAPNICは、アジア地域を管轄するレジストリです。
(APNICの親玉であるICANN、その前身であるInterNICはAT&T等が運営していました。)

Cloudflareは、[ガリレオプロジェクト](https://www.cloudflare.com/galileo)を運営し、社会的弱者に対する技術援助を行っています。

ここまでの情報を見る限り、（個人的には）あまり危険性が無いように思えます。
なので、今回の記事は過剰反応し過ぎなのかもしれません。

このQiitaページは、単なる趣味の延長線上なので、もし安全性を気にしてこのページに来た方には、今のところは問題がない（はず）と言い切っておきます。

それでは、本題に入りましょう。

# DNS over HTTPS と DNS over HTTPS over tor では何が違うのか

`DNS over HTTPS(以下、DoH)`は、CloudflareとPC間の通信を暗号化するものです。
自分とCloudflare以外からは、リクエスト内容が見られることはありません。
ただ、Cloudflare側では、リクエストはもちろん、接続元のIPアドレスを確認することができます。
（一応、Cloudflareは24時間以内にログを消去することを明言しています https://blog.cloudflare.com/announcing-1111/）

`DNS over HTTPS over Tor`は、CloudflareとPC間のHTTPS通信を、Torネットワーク上で行う方法です。
この場合、Cloudflareからはリクエストを確認できても、接続元のIPアドレスはTorネットワークによって秘匿されます。
そのため、リクエスト内容も、自分も識別されないようになります。
ただ、サイトにアクセスした時間と、名前解決をしたログを突き合わせれば、Torの回路が切り替わるまでの間の名前解決のリストはもちろんバレる可能性があります。そして忘れては行けないのが、Torネットワークに対する信頼です。
Torはオープンソースで、善意のエンジニアによって開発されていますが、まだ見つかっていないバックドアがtorノードのソフトにあるかもしれません。
また、Torを使う人間は、ほぼセキュリティに関心がある人間か、もしくはクラッカーなので、盗聴や攻撃などの可能性を考えると、通常のネットワークを使うよりも、Torを使うほうが危険性が高い__かも__しれません。

自分はある程度そこは仕方がないと思ってTorを使うことを選びました。ここの選択は結構重要です。

# 今回やること

通常の方法で、Cloudflareとの間でDoHができるようにします。そのときに、1.1.1.1に対してDoHするのではなく、TorのSOCKSプロキシを通して1.1.1.1（正確には違う、以下参照）にアクセスします。

1.1.1.1にアクセスする場合、出口ノードが必要になりますが、1.1.1.1はonionアドレスでも提供がされています。

ためしに、以下を実行してみてください。

```
$ curl -I https://tor.cloudflare-dns.com/
```

（ちなみにですが、`tor.cloudflare-dns.com`の実態は、1.1.1.1と同じサーバーです。心配な方は、TLS証明書を確認してください、EV SSLでCloudflareになっています。）

このコマンドを実行すると、`tor.cloudflare-dns.com`にHTTP GETしたときのリクエストヘッダが表示されます。たとえば以下のようになります。

```
HTTP/2 200
date: Mon, 26 Nov 2018 10:24:36 GMT
content-type: text/html
alt-svc: h2="dns4torpnlfs2ifuz2s2yf3fc7rdmsbhm6rw75euj35pac6ap25zgqad.onion:443"; ma=315360000; persist=1
last-modified: Thu, 15 Nov 2018 02:54:12 GMT
strict-transport-security: max-age=31536000; includeSubDomains; preload
cache-control: max-age=600
x-content-type-options: nosniff
expect-ct: max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"
server: cloudflare
cf-ray: XXXXXXXXXX-NRT
```

ここで、`alt-svc`から始まる行に`dns4torpnlfs2ifuz2s2yf3fc7rdmsbhm6rw75euj35pac6ap25zgqad.onion:443`という文字列が有ります。これがCloudflareが提供する1.1.1.1のonionアドレスです。
OSとブラウザのルートCAを信用しているならば、信用の多段ロケットにより、このonionアドレスが改ざんされていないことを確認できます。

ということで、今回の最終設計は以下のようになります。

1. ローカルに、DoHできるDNSキャッシュを構築し、上流DNSを`localhost:443`にする。(443でなくても良いです。)
2. `localhost:443`にアクセスが来ると、TorのSOCKS4である`localhost:9050`を使用し、`dns4torpnlfs2ifuz2s2yf3fc7rdmsbhm6rw75euj35pac6ap25zgqad.onion`へリクエストをするコマンドを起動する。

では、次から実際の手順を説明していきます。

__あ、もちろんlocalhost:9050でtorのSOCKSポートが動いているのが前提です。ここではそこには触れないので各自自力でtorノードを構築しておいてください。__

# 1. ローカルにDNSキャッシュを構築

以前自分が書いた記事があるので、それを参考にしてください。

[Cloudflareが1.1.1.1で超高性能DNS始めたし、いっちょ俺のパソコンもDNS over HTTPSしてみる](https://qiita.com/onokatio/items/42fb4a2811600680591b)

ただ、一番最後にsystemdのserviceファイルを作るときのファイル内容が変わります。
具体的には、以下のようにしてください。

```ini:/etc/systemd/system/proxydns.service
[Unit]
Description=Proxy dns server over https
Before=network.target

[Service]
Type=simple
ExecStart=/usr/bin/cloudflared proxy-dns --upstream "https://dns4torpnlfs2ifuz2s2yf3fc7rdmsbhm6rw75euj35pac6ap25zgqad.onion/dns-query"

[Install]
WantedBy=multi-user.target
```

見てわかるとおり、`--upstream "https://dns4torpnlfs2ifuz2s2yf3fc7rdmsbhm6rw75euj35pac6ap25zgqad.onion/dns-query"`が追記されています。これにより、DoHの上流サーバーが変更されます。

また、systemdが`dns4torpnlfs2ifuz2s2yf3fc7rdmsbhm6rw75euj35pac6ap25zgqad.onion`を解決できるように、`/etc/hosts`にも追記をします。

```
$ cat << EOF > /etc/hosts
127.0.0.1 dns4torpnlfs2ifuz2s2yf3fc7rdmsbhm6rw75euj35pac6ap25zgqad.onion
EOF
```

これにより、ローカルのDNSキャッシュサーバー（cloudflared）が127.0.0.1:443を上流DNSとして扱うようになります。

なぜ、 `--upstream https://127.0.0.1/dns-query`を書かずに、こんなことをするかというと、cloudflaredがTLS証明書を確認できるようにするためです。IPが127.0.0.1になっていようが、ドメイン名が正しければTLS証明はできます。

onionアドレスを使う場合、出口ノードがないのでhttps通信は必要ないかとも思いますが、.onionに正式なCAから証明書が出るのはまれなこと（facebookcorewwwi.onionなど）なので、今回はそれを有効利用しようという考えです。

# 2. コマンドを起動する。

socatコマンドをインストールして、以下のコマンドを実行してください。

```bash
socat TCP4-LISTEN:443,reuseaddr,fork SOCKS4A:127.0.0.1:dns4torpnlfs2ifuz2s2yf3fc7rdmsbhm6rw75euj35pac6ap25zgqad.onion:443,socksport=9050
```

これにより、`localhost:443`へ来たTCPリクエストが、すべてlocalhost:9050のSOCKSポートを通じて`dns4torpnlfs2ifuz2s2yf3fc7rdmsbhm6rw75euj35pac6ap25zgqad.onion:443`へと転送されます。

ただ、毎回このコマンドを入力するのは面倒なので、またsystemdのserviceファイルを書きましょう。

```/etc/systemd/system/toCloudflare.service
[Unit]
Description=Proxy tor to cloudflare
Before=network.target

[Service]
Type=simple
ExecStart=/usr/bin/socat TCP4-LISTEN:443,reuseaddr,fork SOCKS4A:127.0.0.1:dns4torpnlfs2ifuz2s2yf3fc7rdmsbhm6rw75euj35pac6ap25zgqad.onion:443,socksport=9050


[Install]
WantedBy=multi-user.target
```

これで完了です、最後に起動だけしましょう。

```
$ sudo systemctl start toCloudflare
$ sudo systemctl enable toCloudflare
```

# 使ってみる

LinuxならNetworkManager、MacならWifiの設定などから、名前解決サーバーを127.0.0.1に変更してみてください。その状態ならすべての通信がDNS over HTTPS over Torされます。

自分の環境では、だいたいAレコードを引くのに100ms〜5秒程度かかるようです。
案外実用に耐える速度だと思います。また、一回名前解決すると、次からcloudflaredのキャッシングが効くため、二回目以降は高速になります。

さて、これで名前解決の匿名性が保たれるようになりました。エドワード・スノーデンのように内部告発したい方はぜひ試してみてください。

# 2018/11/27追記

今回使ったcloudflaredは、DNSSECの検証をしません。DNSSECを使うためにdnsmasqを使用します。

dnsmasqをインストールしたら、/etc/dnsmasq.confに以下を追記します。

```
conf-file=/usr/share/dnsmasq/trust-anchors.conf
dnssec
dnssec-check-unsigned

server=127.0.0.1#10053
proxy-dnssec
```

そして、cloudflaredの.serviceファイルに--portオプションを追加します。

```ini:/etc/systemd/system/proxydns.service
[Unit]
Description=Proxy dns server over https
Before=network.target

[Service]
Type=simple
ExecStart=/usr/bin/cloudflared proxy-dns --port 10053 --upstream "https://dns4torpnlfs2ifuz2s2yf3fc7rdmsbhm6rw75euj35pac6ap25zgqad.onion/dns-query"

[Install]
WantedBy=multi-user.target
```

これで、127.0.0.1:53で動くdnsmasqが、127.0.0.1:10053から帰ってきたクエリーを見てDNSSECの検証をするようになります。

なぜかDNSSEC Resolver Testなどでは不合格になりますが、ターミナルからdigしたら正常に動いた（DNSSEC署名がおかしいとfail）ので、これで良しとします。

