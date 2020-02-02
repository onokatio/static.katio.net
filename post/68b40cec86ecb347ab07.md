---
title: セキュリテイ特化型Archlinux、Blackarchをインストールしてみた
tags: Linux archLinux blackarch
author: onokatio
slide: false
---
どうも。
自分はペネトレーションツール系OSというと、Kali Linuxぐらいしか知らなかったのですが、どうやらArchlinuxにもBlackarchという派生OSがあるらしいです。

OSごとインストールするのは面倒なので、手軽に既存のArchlinuxをBlackarchにしてみます。

# 手順

通常はインストールスクリプトがあるようなのですが、ちょっと何をしているか確認せずに動かすのは気持ち悪いので、適宜シェルスクリプトの内容を手動で実行します。

1. gpg鍵の追加
2. キーリングの追加
3. リポジトリの追加

## gpg鍵の追加

```bash
$ gpg --keyserver pgp.mit.edu --recv-keys 4345771566D76038C7FEB43863EC0ADBEA87E4E3
```

## キーリングの追加

```bash
$ curl -LO https://www.blackarch.org/keyring/blackarch-keyring.pkg.tar.xz
$ sudo pacman --config /dev/null --noconfirm -U blackarch-keyring.pkg.tar.xz
$ rm blackarch-keyring.pkg.tar.xz
```

## リポジトリの追加

以下を`/etc/pacman.conf`に追記

```ini
[blackarch]
Server = http://www.ftp.ne.jp/Linux/packages/blackarch/$repo/os/$arch
Server = ftp://ftp.kddilabs.jp/Linux/packages/blackarch/$repo/os/$arch
Server = http://www.mirrorservice.org/sites/blackarch.org/blackarch/$repo/os/$arch
```

```bash
$ sudo pacman -Syy
```

# パッケージをインストール

通常通り、パッケージは`pacman -S`でインストールできます。

```bash
$ sudo pacman -S aircrack-ng
```

