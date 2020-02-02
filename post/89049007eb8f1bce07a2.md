---
title: HTTPキャッシュ、したくない？
tags: HTTP proxy squid
author: onokatio
slide: false
---
# tl;dr
ラズパイでhttpキャッシュ鯖立てました。ソフトはsquid使いました。別にラズパイじゃなくてもPOSIX系マシン(LinuxとかUnixとかOSXとか)ならできそうだけどたまたま足元にラズパイが落ちてたので。

ん？記事の構成が使い回しだって？
気のせい気のせい。

# インストール

```shell-session:shell
$ sudo apt install squid
```

以上。自前ビルドしなくていいご時世はいいね。

# 設定
ぼくの場合```/etc/squid/squid.conf```が設定ファイルだった。
ってかDebian系のディストリはだいたい```/etc/パッケージ名```の中に色々あるよね。
ところどころに説明があるのだが、何しろ設定ファイルの量が多すぎてとてもじゃないけど設定する気になれない。なので情強のぼくはggることにした。
最終的にコメント行を除くとこんな感じになった。
```:squid.conf
acl localnet src 192.168.0.0/16
acl PURGE        method PURGE

acl SSL_ports port 443
acl Safe_ports port 80          # http
acl Safe_ports port 21          # ftp
acl Safe_ports port 443         # https
acl Safe_ports port 70          # gopher
acl Safe_ports port 210         # wais
acl Safe_ports port 1025-65535  # unregistered ports
acl Safe_ports port 280         # http-mgmt
acl Safe_ports port 488         # gss-http
acl Safe_ports port 591         # filemaker
acl Safe_ports port 777         # multiling http
acl CONNECT method CONNECT

http_access deny !Safe_ports
http_access deny CONNECT !SSL_ports
http_access allow localhost manager
http_access deny manager
http_access allow PURGE localhost
http_access allow localhost
http_access allow localnet
http_access deny all

http_port 3128
coredump_dir /var/spool/squid

forwarded_for off
request_header_access Referer deny all
request_header_access X-Forwarded-For deny all
request_header_access Via deny all
#request_header_access Cache-Control deny all
visible_hostname unknown

fqdncache_size 4096
ipcache_size 4096
ipcache_low 90
ipcache_high 95

cache_mem 4096 MB
maximum_object_size 128 MB
cache_swap_low 90
cache_swap_high 95
maximum_object_size_in_memory 128 MB
memory_pools on

cache_dir ufs /var/spool/squid 102400 32 256

refresh_pattern -i .(gif|png|jpg|jpeg|ico|webp|webm|avi|wav|mp3|mp4|mpeg|swf|flv|x-flv|js|css|shtml)$ 525600    100%    525600 override-expire override-lastmod ignore-reload ignore-reload ignore-no-cache  ignore-private
refresh_pattern .       525600  100%    525600

shutdown_lifetime 1 seconds
cachemgr_passwd taishi offline_toggle
dns_nameservers 8.8.8.8
dns_v4_first on
dns_timeout 5 seconds

pipeline_prefetch on
icp_port 0
client_db off
```

# 起動

```
sudo systemctl start squid
```

あとサービスの自動起動もさせとく

```
sudo systemctl enable squid
```
# テスト

```shell-session:shell
$ netcat localhost 3128
GET http://google.com/ HTTP/1.1

HTTP/1.1 302 Found
Cache-Control: private
Content-Type: text/html; charset=UTF-8
Referrer-Policy: no-referrer
Location: http://www.google.co.jp/?gfe_rd=cr&ei=oJgGWfzDDMPd8AfX5ZToBQ
Content-Length: 261
Date: Mon, 01 May 2017 02:08:32 GMT
X-Cache: MISS from unknown
X-Cache-Lookup: MISS from unknown:3128
Via: 1.1 unknown (squid/3.5.23)
Connection: keep-alive

<HTML><HEAD><meta http-equiv="content-type" content="text/html;charset=utf-8">
<TITLE>302 Moved</TITLE></HEAD><BODY>
<H1>302 Moved</H1>
The document has moved
<A HREF="http://www.google.co.jp/?gfe_rd=cr&amp;ei=oJgGWfzDDMPd8AfX5ZToBQ">here</A>.
</BODY></HTML>
```
うん、動いてるね。
ちなみに、netcatでTCPを平文で喋ってるのは僕の趣味です。

それでは。

