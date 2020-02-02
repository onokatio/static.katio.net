---
title: NetworkManagerやらresolvconfやらLinuxのDNSまわりを調べて、DHCP環境下でDNSキャッシュしてみた
tags: Linux dns dnsmasq networkmanager
author: onokatio
slide: false
---
どうも。かちおです。自分はArchlinuxにNetworkManager(以下NM)を入れてWiFiに接続をしていますが、今回DNSサーバーを指定するに当たって、一体/etc/resolv.confを誰がどう書き換えているのか複雑すぎたため、備忘録がてら書いていこうと思います。

今回の目的は「DHCPで降ってくるDNSサーバーを上流とするDNSキャッシュサーバーを、自分のマシンで動かして、名前解決はpdnsdでようにする」です。

pdnsdは小型のDNSキャッシュサーバーですが、dnsmasqなどとは違い、再起動してもキャッシュが残ります。なのでこれを使うことを考えました。

# Linuxの名前解決について

Linuxでは様々なアプリケーションが名前解決をするためにDNSサーバーを必要とします。
このDNSサーバーは基本的に`/etc/resolv.conf`に書き込まれ、アプリケーションはここを見に行きます。

>/etc/host.confや/etc/nsswitch.confについては、名前解決をする順番を書くファイルとなっています。大体の場合「/etc/hostを見ろ。それでなかったら自分のホスト名と一致してるか見ろ。それでもだめだったら/etc/resolv.confを見に言ってDNSに問い合わせろ」みたいなことが書いてあります。
>/etc/hosts.confと/etc/nsswitch.confはそれぞれ同じ役割ですが、現在はhostsを使わずに/etc/nsswitch.confを使うことが推奨されています。

# resolver(リゾルバ)について

resolverは、自分の持っているDNSの情報を/etc/resolv.confに書き込むアプリケーションのことです。
NMやresolvconf、netctl、systemd-resolvedなどがこれに当たります。

# DNSサーバーについて

DNSサーバーは、DNS情報(主な場合ドメインとipアドレスの紐付け)に使われます。
DNSキャッシュサーバーというものもあり、これはDNS情報をキャッシュするものです。上流のサーバー(本来メインで使用するDNSサーバー)を指定し、自分がDNS情報を持っていればそれを返し、なければ指定した上流サーバーに問い合わせてそれを返すことができて、DNSサーバーのように振る舞うことができます。
dnsmasqやUnbound、systemd-resolvedがキャッシュサーバーに当たります。

# DNSサーバーの取得の流れ

NetworkManagerがWiFiや有線LANと接続し、DHCP情報を取得して、そこから配布されたDNSサーバーの値を取得します。これはNetworkManagerがwpa_supplicantやdhclientに頼んで代わりにやってもらっています。そして、NetworkManagerのもとにDNSサーバーのipアドレスが届けられます。
また、ネットワークの設定で特定のWiFiだけDNSを変更していた場合は、NetworkManagerはその値を使用します。

# NetworkManagerの仕事

NetworkManagerは、DNSサーバーを取得した後、設定ファイルの`dns`項目に基づき以下の振る舞いをします。


|dnsモード|振る舞い|
|:-:|:-:|
|default|取得したDNSサーバーをそのまま使います。|
|dnsmasq|キャッシュ用にdnsmasqをサブプロセスとして起動します。DNSサーバーは127.0.0.1を使います。|
|unbound|上のunboundバージョン|
|systemd-resolved|上のsystemd-resolvedバージョン|
|none|NetworkManagerはDNSに関して何もしません。また次に書いてある`rc-manager`も無効になります。|

>指定しない場合は`default`が使用されますが、もし/etc/resolv.confがsystemd-resolvedへのシンボリックリンクだった場合は、systemd-resolvedがDNSを司っているのだと判断し自動で`systmed-resolved`を使用します。

そして、次はresolv.confに関して、設定ファイルの`rc-manager`項目に基づいてresolvファイルの設定をします。また、このとき使用するDNSは、上でキャッシュを起動していた場合は127.0.0.1になります。

|rc-managerモード|振る舞い|
|:-:|:-:|
|symlink|/etc/resolv.confがただのファイルの場合は、NetworkManagerが直接ファイルに書き込みをします。もしシンボリックリンクだった場合はファイルに何もしません。|
|file|直接/etc/resolv.confに書き込みます。シンボリックリンクの場合もシンボリックリンク元に書き込みます。|
|resolvconf|NetworkManagerは、resolvconfにresolv.confの更新を頼みます。|
|netconfig|netconfigに更新を頼みます。|
|unmanaged|何もしません。|
|none|syslinkと同じ動作をします。|

>何も指定しない場合の動作はディストリビューションによってまちまちらしいですが、自分の環境だとresolvconfでした。`man NetworkManager.conf`と打ち`rc-manager`項目を確認することでで確認できます。


自分の場合は、`Default`と`symlink`の組み合わせだったので、「上流から取得したDNSをそのまま使い」「NetworkManagerがresolvconfに`/etc/resolv.conf`への書き込むを頼む」という動作になります。

# 今回の目標を達成する

最初に書いたとおり、今回はpdnsdという小さなキャッシュサーバーをかませることが目的です。
しかし、キャッシュのモードにはdnsmasqやunboundはありますが、pdnsdがありません。
なので、resolvconfに仲介役を頼みます。
つまり、

- NetworkManagerがDHCPで取ってきたDNSサーバーのアドレスをresolvconfに渡す
- → resolvconfがpdnsにDNSサーバーのアドレスを教える
- → resolvconfが/etc/rersolv.confに127.0.0.1を書き込む

といった流れになります。

## pdnsdをインストール

```bash
$ sudo apt install pdnsd # Debian、Ubuntuの場合
$ sudo pacman -S pdnsd   # ArchLinuxの場合
```
## resolvconfの設定

NetworkManagerがデフォルトでresolvconfにDNS情報を渡すので、それをゴニョゴニョします。
`/etc/resolvconf.conf`を以下のように編集してください。

```:/etc/resolvconf.conf
# Configuration for resolvconf(8)
# See resolvconf.conf(5) for details

resolv_conf=/etc/resolv.conf
# If you run a local name server, you should uncomment the below line and
# configure your subscribers configuration files below.
name_servers=127.0.0.1
name_servers_append=8.8.8.8
pdnsd_resolv=/etc/pdnsd-resolv.conf
```

resolvconfはpdnsdに対応しているので、コレだけで大丈夫です。この設定をすると、resolvconfが`/etc/pdnsd-resolv.conf`というファイルを生成します。これは`/etc/resolv.conf`と同じ気法です。

つまり、本当のDNS情報は`/etc/pdnsd-resolv.conf`に書き込み、`/etc/resolv.conf`には127.0.0.1を書き込みます。

## pdnsdの設定

resolvconfが本当のDNS情報を`/etc/pdns-resolv.conf`に書き込んでくれるので、pdnsdから読み込ませるようにします。
`/etc/pdnsd.conf`を以下のように編集してください。

```:/etc/pdnsd.conf
global {
        perm_cache=1024;
        cache_dir="/var/cache/pdnsd";
#       pid_file = /var/run/pdnsd.pid;
        run_as="pdnsd";
        server_ip = 127.0.0.1;  # Use eth0 here if you want to allow other
                                # machines on your network to query pdnsd.
        status_ctl = on;
#       paranoid=on;       # This option reduces the chance of cache poisoning
                           # but may make pdnsd less efficient, unfortunately.
        query_method=udp_tcp;
        min_ttl=15m;       # Retain cached entries at least 15 minutes.
        max_ttl=1w;        # One week.
        timeout=10;        # Global timeout option (10 seconds).
        neg_domain_pol=on;
        udpbufsize=1024;   # Upper limit on the size of UDP messages.
}

server {
    label=resolvconf;
    file=/etc/pdnsd-resolv.conf;
    proxy_only=on;
    timeout=4;
    uptest=if;
    interface=wlp1s0;
    interval=10;
    purge_cache=off;
#   edns_query=yes;
    preset=off;
}
```

## サービスの起動

最後に、`/etc/resolv.conf`を再生成します。
```
$ sudo resolvconf -u
```
そして、pdnsdのサービスを起動します。

```
$ sudo systemctl start pdnsd
$ sudo systemctl enable pdnsd #自動起動
```

これで完了です！キャッシュすると早くていいですね！

