---
title: Encrypted SNI / TLSハンドシェイクの暗号化
tags: sni
author: onokatio
slide: false
---
# SNI とは

一つのIPアドレスと一つのTCPポートで、複数のWebサイトをホスティングする技術の一つに、`virtualhost`があります。
これは、HTTPリクエスト内で指定するドメイン名から、同じIPに対するアクセスをドメインごとに振り分ける機能です。

たとえば、以下のコマンドを実行すると、こんな出力がされます。

（ちなみに、vがリクエストヘッダの表示、 Iがボディの非表示のオプションです。）

```bash
$ curl -v -I example.com

*   Trying xxxxx...
* TCP_NODELAY set
* Connected to example.com (xxxxx) port 80 (#0)
> HEAD / HTTP/1.1
> Host: example.com
> User-Agent: curl/7.62.0
> Accept: */*
>

…（省略）
```

真ん中の行に、`Host: example.com`という行があるのが見えます。HTTP通信はTCPの上で行われる通信ため、通信内容にドメイン名は必要ないのですが、HTTP/1.1対応のブラウザだとこのようなリクエストが投げられます。

Nginxなどのサーバーは、このHostを見分けて、同じIPアドレスへのリクエストでも、異なる処理ができるように
なります。格安レンタルサーバーなどではこの手法を取っています。

>今HTTP/2.0はどうなんだろうなーと調べてみましたが、やはりHostフィールドはあるようです。 
 [RFC 8.1.3章](http://http2.github.io/http2-spec/index.html#rfc.section.8.1.3)


そしてここからが本題です。HTTPSを使う場合、Hostはどうなるでしょう。
はい、そこのあなた、正解です。HTTPヘッダごと暗号化されます。

なので、もし判別しようと思った場合、TLSハンドシェイクの時点で、どのサーバーにアクセスしたいのかをリバースプロキシにあたるサーバーが知る必要が有ります。
また、そのときにクライアントはサーバー（virtualhost）のTLS証明書を取得します。

このために、拡張TLS通信のハンドシェイクの一番最初の段階である`ClientHello`では、__SNI(Server Name Indication)__と呼ばれる技術を使います。
これはClientHelloの中で、`server_name`の項目にドメイン名を入れて、接続するホスト先を指定してあげることができます。

```
      enum {
          server_name(0), max_fragment_length(1),      ←これ
          client_certificate_url(2), trusted_ca_keys(3),
          truncated_hmac(4), status_request(5), (65535)
      } ExtensionType;
```
( https://www.ipa.go.jp/security/rfc/RFC6066JA.html より )

また、このSNIは、RFCの中で
>「クライアントは、あるサーバをサポートされている名前種別によって見つけ出す（locate）ときはいつでも、その client hello 中に種別が "server_name" の拡張を含むこと」が推奨される（RECOMMENDED）。」


と定められています。どういうことかというと、ChromeやFirefoxといった、モダンなブラウザは基本的にこのserver_nameを使用しています。

つまり、HTTPS通信を使う場合でも、最初のコネクション時に、接続するドメインを指定することになります。


ということは、HTTPSを使っても、__どのドメインに接続しているかはネットワーク上の機械が確認できてしまう__ということになります。

このため、HTTP bodyやパスだけを暗号化したところで、ネットワーク側である程度の検閲やブロッキング、ログ収集ができてしまいます。

この対策として考えられたのが、Encrypted SNIです。

# Encrypted SNI とは

__Encrypted SNI__(以下、ESNI)は、その名前の通りSNI、つまりClientHelloの中のserver_nameを暗号化してしまう技術です。

パケットを割り振ったり、Hostによって処理を変えるサーバー（リバースプロキシ、Nginxなど）が、SNIを解釈できればその後TLS暗号が使えるわけです。
初回接続時だけ、HostやTLSによらない暗号化を行います。

# 暗号化とDNS

具体的な暗号化についてです。

server_nameを暗号化し、ClientHelloを送信します。
それを受け取ったサーバーは、復号化したのち、server_nameを見て、ホスト振り分けを行うことになりますね。

（このとき使うのは、ディフィー・ヘルマン半静的鍵共有と呼ぶらしいですが、ちょっと普通の公開鍵暗号と何が違うのかわかりませんでした、ごめんなさい。）

では、TLS通信のハンドシェイクの暗号化につかう鍵は、どうやって手に入れるのでしょう。ここまで来ると卵が先か鶏が先か、の気分になってきます。

この方法ですが、DNSを使用します。DNSのレコードの中に、鍵交換に使うための公開鍵をサーバーが埋め込んでおきます。
クライントは、まずTLSハンドシェイクの中で、DNSクエリーで取得した鍵で暗号化を使えるわけですね。

DNSクエリーの中身を覗かれる心配、改ざんされる心配ですが、前者はDNS over HTTPSやDNS over TLS、後者はDNSSECによって解決できます。

いや、またTLS使うんならそこのESNIはどうなんだよ…と言いたくなりますが、まあ1.1.1.1などはvirtualhostを使っていないようなので、SNIをあえて使わないようにすれば大丈夫な様子です。（これ僕も思いました。）

# ESNI の実用例

今の所、ESNIはTLS 1.3の拡張提案でしかないため、実際にブラウザで利用することはできません。
ただ、Firefox Nightlyに追加している途中という噂もあります。 

ESNIを使うことで、先程の問題点などを解決することができ、より安全にインターネットが使えるようになるのはそう遠くないことだと思います。
もちろん、IPアドレスの逆引きなど、最後の穴はいくつか残っています。これからのESNIの動向に注目したいです。

（参考: https://blog.cloudflare.com/encrypted-sni/ ）
（また、使っているブラウザがDNSSECやTLS1.3に対応しているかどうかはここで確認できます。 https://www.cloudflare.com/ssl/encrypted-sni/ ）

