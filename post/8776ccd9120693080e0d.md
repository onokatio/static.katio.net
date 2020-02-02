---
title: Ubuntu16.04のNIC名を固定する(変更する)
tags: Linux Ubuntu NIC
author: onokatio
slide: false
---
Ubuntu16.04から、命名規則が変わったりいろいろあったが、自分は判別しやすい用にNICに固定名をつけてるから方法を自分用にメモ

 
/etc/udev/rules.d/99-nic-name.rulesってファイルを作る。99は一番最後に、つまり設定内容が最優先されるってこと。ファイル名の先頭が99で拡張子がrulesならファイル名はなんでもいい（はず）。

内容：

```
SUBSYSTEM=="net", ACTION=="add", ATTR{address}=="MACアドレス", NAME="NIC名"
```
 これを難行も書けば大丈夫なはず。

ちなみに自分は、オンボードのイーサーネットをpc-eth0、オンボードの無線ドングルをpc-wlan0、USB接続をusb-wlan0にしている。

