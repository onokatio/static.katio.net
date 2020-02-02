---
title: LVMチートシート
tags: Linux lvm
author: onokatio
slide: false
---
# LVMとは
複数のディスクの複数のパーティションを組み合わせて、大きな一つのディスクを作ることができる。さらにそのディスクをパーティションに切り分けられる。

- LVMで使われる複数のディスクの複数のパーティションのことを`物理ボリューム`と呼ぶ
- 大きな一つのディスクのことを`ボリュームグループ`と呼ぶ。これ自体も複数作れる。
- ボリュームグループのなかのパーティションを`論理ボリューム`と呼ぶ。普通にext4などでフォーマットしてマウントできる。

# 物理ボリューム

```
## 物理ボリュームの作成（パーティションをLVM管理下に置く）
pvcreate /dev/sda1
pvcreate /dev/sda2
…

## 物理ボリュームの解除（パーティションをLVM管理下に置かない）
pvremove /dev/sda1
…
```

# ボリュームグループ

```
## ボリュームグループの作成
vgcreate Vol1 /dev/sda1 /dev/sda2

## ボリュームグループに論理ボリュームを追加
vgextend Vol1 /dev/sdb1

## ボリュームグループの削除（無効化）
vgchange -a n Vol1

## ボリュームグループから論理ボリュームを取り除く(先に上記の無効化をしなければならない)
vgreduce Vol1 /dev/sdb1
vgremove Vol1

```

# 論理ボリューム

```
## 論理ボリューム（パーティション）の作成
lvcreate -L 10G Vol1 -n lvolroot
lvcreate -l 100%FREE Vol1 -n lvolhome
…

## 論理ボリュームの拡張（resize2fsも必要）
lvextend -L +10G Vol1/lvolroot

## 論理ボリュームの縮小（resize2fsも必要）
lvreduce -L -10G Vol1/lvolroot

## 論理ボリュームの削除
lvremove Vol1/lvolroot
```

# 情報表示

```
lvmdiskscan
vgscan
pvs
pvdisplay
vgdisplay
lvdisplay

```

