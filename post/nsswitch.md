---
title: LinuxのNSSwitchについて
date: 2019-10-06 22:29:10 +0900
---
LinuxのNSSwitchについて
===

名前解決の設定やsystemd-resolvedをいじっているときに、`/etc/nsswitch.conf`というファイルを弄ります。何をしているかよくわからなかったので調べてみました。

# Name Service Switch (NSSwitch)

Linuxの標準ライブラリであるGlibcには、`getaddrinfo()`という関数が実装されています。
これは、ドメインからIPアドレスなどの情報を得るための関数で、プログラム内で名前解決のために使用されます。

この`getaddrinfo()`は、`/etc/nsswitch.conf`を参照し、名前解決に何をどの順番で使用するかを決定します。

以下に、`/etc/nsswitch.conf`の例を示します。

```
# Name Service Switch configuration file.
# See nsswitch.conf(5) for details.

passwd: files mymachines systemd
group: files mymachines systemd
shadow: files

publickey: files

hosts: files mymachines myhostname resolve [!UNAVAIL=return] dns
networks: files

protocols: files
services: files
ethers: files
rpc: files

netgroup: files
```

今回注目するのは`hosts:`の行です。というか自分はこの行以外の意味がよくわかってないです、いつか調べます…。

`hosts:`行に、`files mymachines ...`の順で名前解決に使用するものを列挙しています。
優先順位は左が最高です。

以下に説明をします。

- `files`: `/etc/hosts`ファイルのことです。ここにはドメイン名とホスト名をあらかじめ指定できます
- `mymachines`: `systemd-machined`に登録されている、コンテナ（ここでいうコンテナはDockerなどではなくLinuxで実装されているLXC等のことだと思われる）の名前解決。コンテナ名からコンテナのIPアドレスを引けます
- `myhostname`: `localhost`と`localhost.localdomain`, `hoge.localhost`, `hoge.localhost.localdomain`を`127.0.0.2`と`::1`として名前解決します。また`_gateway`を引くと、メトリック順に並べ替えた現在のデフォルトゲートウェイのIPアドレスを返す機能も担っています
- `resolve`: systemd-resolvedを使用して、実際にDNSサーバーを使用します。systemd-resolvedは、設定ファイルである`/etc/systemd/resolved.conf`や、NetworkManagerなどからDNSサーバーのアドレスを取得し、そこへ名前解決します。またsystemd-resolvedにはDNSレコードをキャッシュする機能があります
- `dns`: 従来の通り、`/etc/resolv.conf`にあるDNSサーバーへ問い合わせます
- `[!UNAVAIL=return]`: 直前（左側）の名前解決が、そもそもサービスが存在しなかったために失敗したときのみ続行して右側を実行します。
これは、`resolve`で存在しないドメインなどを引いたときに`dns`を実行してほしくないが、そもそも`systemd-resolved`が実行されておらず`resolve`が使用できなかった場合には`dns`を使ってほしい、という意味になります
