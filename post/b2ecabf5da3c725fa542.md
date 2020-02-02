---
title: rc.localが消えたUbuntu 16.04でコマンド自動実行
tags: Linux Ubuntu
author: onokatio
slide: false
---
tlpの--auto-tuneをしようと思った時、いつもどおりrc.localに書こうとしたら、まさかの存在しないではないですか！？

```
 ~ $ ls /etc/rc.local 
ls: '/etc/rc.local' にアクセスできません: そのようなファイルやディレクトリはありません
```

おそらく、initからsystemd（serviceからsystemctl）にサービス関連が移行されつつあるので、それに関連してのことでしょう。

なので、起動時にコマンドを自動実行するサービスを一個追加しておきましょう。

```
[Unit]
Description=auto start commands in /etc/onboot.sh on boot

[Service]
Type=simple
ExecStart=/etc/onboot.sh
User=vagrant

[Install]
WantedBy=multi-user.target
```
私はこんな感じにしました。

そして

```
$ sudo touch /etc/onboot.sh
```

こんな感じでroot権限でファイルを作ってあげればOK。 

あとはいつもどおり、

```
$ sudo systemctl enable onboot.service 
Created symlink /etc/systemd/system/multi-user.target.wants/onboot.service → /etc/systemd/system/onboot.service.
```


すれば完成。好きなコマンドを、こんどは/etc/rc.localから/etc/onboot.shに突っ込んでどうぞ！

以上！

