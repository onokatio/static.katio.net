---
title: "Archlinuxのミラーサーバーを構築する"
date: 2019-11-16 22:14:00 +0900
---

Archlinuxのミラーサーバーを構築する
===

参考： [https://wiki.archlinux.jp/index.php/ローカルミラー](https://wiki.archlinux.jp/index.php/%E3%83%AD%E3%83%BC%E3%82%AB%E3%83%AB%E3%83%9F%E3%83%A9%E3%83%BC)

Archlinuxのミラーサーバーを立ましょう。

ArchWikiにかかれている注意事項をここに引用しておきます。

>注意事項
>
>    - ミラーの帯域幅は無料ではありません。あなたにデータを届けるためにミラーは必要経費を払っています
>        - あなたが ISP に払っている料金とは別にミラーは費用を負担しています
>        - 完全なミラー (32+64ビット) を作成すると容量が 41GB 以上にもなります (2015年1月21日現在)
>    - ダウンロードされたパッケージの多くは一度も使われないでしょう
>    - ミラーの運営者は必要なパッケージだけがダウンロードされることを好むはずです
>    - 上記のリンクに書かれている方法で問題を解決できないか試してみてください
>
>ローカルミラー以外に方法がないという場合にのみ、以下のガイドを見てください。 

# 上流を選ぶ

https://www.archlinux.org/mirrors/tier/1/ 

ここから、地理的、ネットワーク的に近そうなノードを選びます。

# systemd unitファイルを書きます

/etc/systemd/system/archlinux-mirror-rsync.service

```ini=
[Unit]
Description=Archlinux mirror server rsync service
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=root
ExecStart=/usr/bin/rsync -rtlvH --delete-after --delay-updates --safe-links --exclude iso --exclude archive ftp.tku.edu.tw::archlinux /home/katio-nc/archlinux-mirror

[Install]
WantedBy=multi-user.target
```

# systemd timerを書きます

/etc/systemd/system/archlinux-mirror-rsync.timer

```ini=
[Unit]
Description=Archlinux mirror server rsync servier timer

[Timer]
OnBootSec=10min
OnUnitActiveSec=1d

[Install]
WantedBy=timers.target
```

# start & enableする

```
$ sudo systemctl enable archlinux-mirror-rsync.timer
$ sudo systemctl start archlinux-mirror-rsync.service
```
