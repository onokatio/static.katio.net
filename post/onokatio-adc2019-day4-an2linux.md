---
title: "AN2Linux でAndroidスマートフォンの通知をLinuxデスクトップから受け取る"
date: 2019-12-04 23:18:00 +0900
---

AN2Linux でAndroidスマートフォンの通知をLinuxデスクトップから受け取る
===

この記事は [onokatio Advent Calendar 2019](https://blog.katio.net/adventcalendar/2019/onokatio) 4日目の記事です。

今回は、題名とおりスマホの通知をパソコンで受け取れるように設定します。

# AN2Linuxとは

AN2Linuxは、スマートフォンの通知を、WiFi、モバイル回線、もしくはBluetooth経由でLinuxデスクトップで起動するデーモンに送信できるツールです。

クライアント、デスクトップ共にgithubでソースコードが公開されています。

Bluetoothの場合はペアリングできる範囲にパソコンがあれば通知を送ることができ、おそらく一番使いやすい通信方式です。

WiFiの場合は、LAN内に存在するIPアドレス/ポートを、モバイル回線の場合はグローバルIPアドレス/ポートを指定することで通知を飛ばせますが、ファイアウォールの設定等が面倒くさいので今回は利用しません。

# インストール

## スマートフォン

- https://play.google.com/store/apps/details?id=kiwi.root.an2linuxclient
- https://github.com/rootkiwi/an2linuxclient/

Google Play Storeから入手するか、もしくはGithubのリポジトリのReleasesからapkがダウンロードできます。

## PC

Archlinux環境を前提に話を進めます。

```
$ yay -S an2linuxserver-git
$ sudo powerpill -S libnotify python-pybluez
```

# 設定

設定ファイルは`~/.config/an2linux/config`に存在します。

githubのドキュメントから引用すると、設定項目は以下のとおりです。

-    tcp_server [on/off] default: on
-    tcp_port [0-65535] default: 46352
-    bluetooth_server [on/off] default: off
-    bluetooth_support_kitkat [on/off] default: off
-    notification_timeout [integer] default: 5
-    list_size_duplicates [0-50] default: 0
-    ignore_duplicates_list_for_titles [comma-separated list] default: AN2Linux, title
-    keywords_to_ignore [comma-separated list] default: ''

デフォルトでbluetooth_serverがoffになっているため、そこだけonにして保存します。

# 起動

systemd unitファイルが提供されています。
system serviceとしてもuser serviceとしても提供されていますが、後者を利用します。

まず、AN2Linuxは`/var/run/sdp`を使用しbluetoothdを会話します。その機能を有効にします。

```
$ systemctl edit bluetooth.service
```

以下のように追記します。

```
[Service]
ExecStart=
ExecStart=/usr/lib/bluetooth/bluetoothd -C
ExecStartPost=/bin/chmod 662 /var/run/sdp
```

これはドキュメントに書かれていた行為で、旧bluetoothのapiであるsdpを有効にしているようです。
ただ、こいつを誰でも書き込み可にするとbluetoothの操作を一般ユーザーでも行えちゃうのでは…？いや、どのみちDBUSでどのユーザーも弄れるから問題ないか‥みたいな思考に落ち着きました。多分大丈夫です。

次に、ペアリングをします。ペアリングをする場合は標準入力で操作が必要なので、systemdサービスではなく直接pythonファイルを起動します。

```
$ /usr/bin/an2linuxserver.py
```


その状態でまずはPCと普通にBluetoothペアリングを行います。完了したら、スマホアプリ側からServer configuration -> + -> Bluetoothを選択し、ペアリングしたPC -> EDIT選択します。

INITIATEPARING WITH SERVERを選択し、SAVEを惜します。そうすると、pythonではこのような表示が出ているはずです:

```
2019-12-04 23:07:28.361 root         INFO     Server certificate fingerprint:   (an2linuxserver.py:809)
2019-12-04 23:07:28.364 root         INFO     (Bluetooth) Waiting for connections on RFCOMM channel 1 (an2linuxserver.py:858)
2019-12-04 23:07:34.215 root         INFO     (Bluetooth) Pair request from: 
 (an2linuxserver.py:396)
It is very important that you verify that the following hash matches what is viewed on your phone
It is a sha256 hash like so: sha256(client_cert + server_cert)

If the hash don't match there could be a man-in-the-middle attack
Or something else is not right, you should abort if they don't match!


Enter "yes" to accept pairing or "no" to deny (Client accepted pairing): 
```

ここですかさずyes <enter>を打ち込みます。これでペアリングは完了です。
このpythonプロセスは殺しましょう。

次に、サービスを起動します。

```
$ systemctl start an2linuxserver.service
$ systemctl enable an2linuxserver.service
```


以上で完了です。試しに通知を送ってみましょう。

![](https://static.katio.net/image/AN2Linux.png)

無事受け取ることができました。
