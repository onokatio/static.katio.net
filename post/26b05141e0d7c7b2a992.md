---
title: Tailsはシャットダウン時にRAMを消去する
tags: Linux tails
author: onokatio
slide: false
---
プライバシーとセキュリティに配慮したLinuxディストリビューションに、Tailsがあります。
Tailsは、[コールドブート攻撃](https://en.wikipedia.org/wiki/Cold_boot_attack)に対応するために、シャットダウン時にDRAM（メインメモリ）の内容を消去する機構が存在します。

# コールドブート攻撃とは

通常、Linuxで暗号化されたディスクを使用する場合、鍵ファイルやパスフレーズが必要となります。
この情報は、一旦入力されるとディスクの読み書きのため、終了時までメモリに保管されることになります。

コールドブート攻撃は上記のようなメモリ上にある機密情報を盗む攻撃です。
メインメモリに使われているDRAMは、電力の供給が切れると、しばらくした後（数十秒から数分）データを失います。

しかし、液体窒素などで急激に冷却することで、内容を保管したままにすることができます。

その状態で、別のマシンのメモリスロットに差し込まれメモリダンプをすることで、メモリ内容を取り出せしまいます。

# Tailsが利用する対処法

冒頭で示したとおり、Tailsは、この攻撃に対処するため、シャットダウン時にメモリの内容をすべて消去する機構が存在します。

この記事ではその機構がどう動作しているかを追っていきます。

# 仕組み

## 1. /run/initramfsの生成

まず、systemdのフックによって、起動時に以下のsystemd serviceが呼び出されます。

https://git-tails.immerda.ch/tails/plain/config/chroot_local-includes/lib/systemd/system/initramfs-shutdown.service

```ini:/lib/systemd/system/initramfs-shutdown.service
[Unit]
Description=Prepare /run/initramfs for shutdown
Documentation=https://tails.boum.org/contribute/design/memory_erasure/
ConditionPathExists=!/run/initramfs/bin/sh

[Service]
RemainAfterExit=yes
Type=oneshot
ExecStart=/usr/local/lib/initramfs-restore

[Install]
WantedBy=multi-user.target
```

このサービスは、`/usr/local/lib/initramfs-restore`を実行します。
その内容は以下のとおりです。

https://git-tails.immerda.ch/tails/plain/config/chroot_local-includes/usr/local/lib/initramfs-restore

```sh:/usr/local/lib/initramfs-restore
#!/bin/sh

set -e
set -u

WORKDIR=$(/bin/mktemp -d)

/usr/bin/unmkinitramfs \
    "$(/usr/local/bin/tails-get-bootinfo initrd)" \
    "$WORKDIR"

# We should not need any kernel modules in there at shutdown time,
# and they take 66% of the entire uncompressed initramfs size, so
# let's save some RAM.
/bin/rm -rf "$WORKDIR"/main/lib/modules

/bin/mv "$WORKDIR"/main/* /run/initramfs/

/bin/rm -rf "$WORKDIR"
```

`unmkinitramfs`で現在使用しているinitramfsの中身をtmpに展開し、カーネルモジュールを削除、その後中身を`/run/initramfs`に移動しています。

## 2. 通常シャットダウンの場合

正常にシャットダウンされる場合、Linuxカーネルのメモリ解放が実行されます。
Tailsのカーネルはオプションが追加しており、メモリを解法する際にメモリにゼロを書き込むようになっています(`slub_debug=P`)

## 2'. 異常シャットダウンの場合

正規の手段でシャットダウンされた場合はもちろんですが、OSが入ったディスクやメディアが抜かれた際も、udevで検知してシャットダウンに移行します。

シャットダウンが検知されると、メモリ消去の準備をします。

まず、シャットダウン時にメディア、つまりブートパーティションが消えている可能性があります。そのため、memlockdがファイルをページングに保管し開放されないようにすることで、メモリ消去に必要なバイナリ/ツールを確保します。

その後、通常シャットダウンが実行されます。

参考: https://tails.boum.org/contribute/design/memory_erasure/

