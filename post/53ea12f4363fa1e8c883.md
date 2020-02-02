---
title: LinuxでVLANを触ってみる
tags: Linux vlan
author: onokatio
slide: false
---
LinuxでVLANの処理をする必要があり、ちょうど良いので方法や仕組みをまとめました。

# VLANって?

https://ja.wikipedia.org/wiki/Virtual_Local_Area_Network

VLANとは、L2でパケットにタグというものをつけて、複数のL2を分割して考えることができます。
本当に単純に、L2パケットにVLANタグを付けているのみです。ちなみにVLANは整数の番号を割り当てることができます。
これの何が嬉しいかと言うと、L3でセグメントをわけなくてもLAN内でL2を擬似的に分割することができちゃったりします。
他にもスイッチの特定のポートとVLANを結びつければVLANを使ってルーティングの設定ができます。

# 原理
基本的に、マシンの物理NICをトランク(すべてのVLANが通れる、というかVLANを気にしない)として、さらに物理NICを通ったあとにVLANがついてるパケットだけをそのVLAN用に作成した仮想NICへとばしてくれます。

# 環境
Ubuntu Server 16.04 LTS

# インストール

```shell-session:shell
$ sudo apt install vlan
```
# 作成

```shell-session:shell
$ sudo vconfig add eno1 10 # eno1を通ったときに10番のVLANパケットがあったときに、eno1.10という仮想NICにそのパケットを飛ばすようにする
$ sudo vconfig rem eno1 10 # eno1.10を削除する
```

めちゃくちゃ簡単ですね。これで生成した仮想NIC(物理NIC名.VLAN番号)を仮想ブリッジに追加したりなんかすれば、ホストとL3スイッチを接続して仮想マシンにしかアクセスできないポートなんかをL2だけで実現することができます。

セキュリティ的にネットワークを分けたいけどルーターのポートは1つしか用意できない!なんてときに使うと幸せになれると思います。

それでは。

