---
title: NetowrkManagerで特定のWiFiに繋がったタイミングで自動でコマンドを実行させる
tags: Linux Network networkmanager WiFi
author: onokatio
slide: false
---
あるwifiに繋がったら自動でsshトンネルを掘ってほしかったので調べました。

`/etc/NetworkManager/dispatcher.d/`以下にシェルスクリプトを置いておくと、ネットワークの状態が変化したときに実行されるらしい。第一引数には変更があった対象のNIC名、第二引数は状態のメッセージが来るみたいです。第一引数だけつかって以下のようなものを書いて配置しました。


```bash
#!/bin/bash

if [ "$1" == wlan0 ] && iwconfig wlan0|grep HogeHogeAccessPoint; then
        if ! ps ax|grep "[s]sh -fND 8080"; then
                ssh -fND 8080 user@myserver.com -i /home/onokatio/.ssh/id_rsa -o "StrictHostKeyChecking no"
        fi
fi
```

変更があったNICがwlan0であること、さらに現在繋がっているAPがHogeHogeAccessPointであることを確認した上で、既にssh -fnDが実行されていないか確認し、動いていなかったらsshを実行します。
>ちなみにgrepでsshが[s]shとなっているのは、自分自身(grep ssh)をps axの中から検出しないようにするためです。

最後にsudo chmod +xで実行属性を付けて完了。

