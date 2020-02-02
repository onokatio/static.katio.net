---
title: ArchLinuxにmingw gccをインストールする
tags: Linux Windows archLinux
author: onokatio
slide: false
---
どうも。Archでexeを作らねばいけなくなりました。
gccのmingw版をインストールします。

今回は、自力でビルドするのは面倒だったので、非公式リポジトリを利用しました。

## リポジトリを追加します。

以下を`/etc/pacman.conf`に追記。

```ini:/etc/pacman.conf
[ownstuff]
SigLevel = PackageOptional
Server = http://martchus.no-ip.biz/repo/arch/$repo/os/$arch
```


アップデートしとく

```bash
$ sudo pacman -Sy
```

# インストール

```
$ sudo pacman -S mingw-w64-gcc
```

