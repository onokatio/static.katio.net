---
title: pacmanで覚えておくとめちゃくちゃ便利なサブコマンド集
date: 2019-11-16 15:19:00 +0900
---

pacmanで覚えておくとめちゃくちゃ便利なサブコマンド集
===

Arhlinux、使ってますか。勿論Archlinuxユーザーの皆様に置かれましては、パッケージマネージャであるpacmanコマンドを日常のように触るかと思いますが、そんなpacmanコマンドでしていると便利なサブコマンドを書いていこうかなと思います。

# パッケージを探す

```
$ pacman -Ss hoge
```

`hoge`をパッケージ名もしくは説明に含むパッケージ一覧を表示します。
このとき参照するパッケージのデータベースは、リモート(coreやextra)となります。

# ローカルにインストールしたパッケージを探す

```
$ pacman -Qs hoge
```

こちらはローカルから検索します。-Ssと異なり、AURからmakepkgでインストールしたパッケージもこちらでは検索にヒットします。その代わりインストールしていないパッケージは検索にヒットしません。

# パッケージの詳細を表示

```
$ pacman -Si hoge
$ pacman -Qi hoge
```

パッケージの詳細を表示します。見てわかるように、前者がリモート、後者がローカルです。

# 特定パッケージに含まれるファイル一覧を表示

```
$ pacman -Fl hoge
```

特定のパッケージに含まれているファイルを表示します。例えばslパッケージについてコマンドを実行すると、以下のような出力が得られます。

```
$ pacman -Fl sl
sl usr/
sl usr/bin/
sl usr/bin/sl
sl usr/share/
sl usr/share/licenses/
sl usr/share/licenses/sl/
sl usr/share/licenses/sl/LICENSE
sl usr/share/man/
sl usr/share/man/man1/
sl usr/share/man/man1/sl.1.gz
```

# 特定のファイルがどのパッケージに含まれているか探す

```
$ pacman -Fs hoge # こちらはいつの間にか使えなくなった模様。
$ pacman -Fx hoge
```

（-Fxや-Fsを使い前に、リモートからファイル一覧をダウンロードする必要があります。-Fyを実行してください。）

共有ライブラリや、コマンドなど、特定のファイルがどのパッケージに含まれているか探したいときに使います。
例えばlibncurses.soをどのパッケージが持っているか知りたい場合に、以下のように実行します。

```
$ pacman -Fx libncurses.so
core/ncurses 6.1-6 [installed]
    usr/lib/libncurses.so
multilib/lib32-ncurses 6.1-4 [installed]
    usr/lib32/libncurses.so
archlinuxcn/anaconda 2019.03-1
    opt/anaconda/lib/libncurses.so
    opt/anaconda/lib/libncurses.so.6
    opt/anaconda/lib/libncurses.so.6.1
    opt/anaconda/pkgs/ncurses-6.1-he6710b0_1/lib/libncurses.so
    opt/anaconda/pkgs/ncurses-6.1-he6710b0_1/lib/libncurses.so.6
    opt/anaconda/pkgs/ncurses-6.1-he6710b0_1/lib/libncurses.so.6.1
archlinuxcn/lib32-ncurses5-compat-libs 6.1-2
    usr/lib32/libncurses.so.5
archlinuxcn/ncurses5-compat-libs 6.1-1
    usr/lib/libncurses.so.5
archlinuxcn/netease-cloud-music 1.2.1-1
    opt/netease/netease-cloud-music/libs/libncurses.so.5
```

また、ファイル名だけではなくパスを含めても検索が可能です（例: `/usr/lib/libncurses.so`）

# .pkg.tar.xzをインストール

```
$ sudo pacman -U hoge.pkg.tar.xz
```

pacmanのパッケージの正体は、ファイルシステム上のそのパッケージのファイルを、絶対パスで固めたtarbollです。

# 変更したファイルを表示

```
$ pacman -Qii | grep "^MODIFIED"
$ pacman -Qii | awk '/^MODIFIED/ {print $2}'
```

pacmanで提供されたファイルから、なにかユーザーが編集をして変更されたファイル一覧を表示します。-Qiiが詳細なパッケージ一覧を吐くので、MODIFIEDでgrepまたはawkしているだけです。

# サブコマンドではないが便利なpacman系ツールについて

## pacdiff

pacmanの更新で生成される、`.pacdiff`や`.pacnew`を検知し、消すか置換するか尋ねてくれます。

```
$ sudo pacdiff
==> pacnew file found for /etc/default/grub
:: (V)iew, (S)kip, (R)emove pacnew, (O)verwrite with pacnew, (Q)uit: [v/s/r/o/q]
```

Vを押すとdiffが表示されます。

# その他

ここを見ましょう。

https://wiki.archlinux.jp/index.php/Pacman_%E3%83%92%E3%83%B3%E3%83%88
