---
title: Archlinuxで、Notoフォント、Noto CJKフォントを使う
tags: font archLinux
author: onokatio
slide: false
---
- Notoは、一般的なユニコード文字と記号が含まれています。
- Noto CJKは、Notoフォントの仲間で、Notoフォントに含まれていないアジア圏の漢字フォントです。
- Noto Emojiは、絵文字フォントです。Androidスマートフォンで表示される絵文字フォントになっています。

以上の3つを使うことで、英数字も、漢字も、ひらがなも、絵文字も、綺麗に表示することができます。

# インストール

```
$ sudo pacman -S noto-fonts noto-fonts-cjk noto-fonts-emoji
```
(もし、太細や大小、狭広バージョンも必要なのであれば、`noto-fonts-extra`もインストールしてください。)

# 設定

```
$ cd /etc/fonts/conf.d 
$ sudo ln -s ../conf.avail/66-noto-sans.conf .
$ sudo ln -s ../conf.avail/66-noto-serif.conf .
$ sudo ln -s ../conf.avail/66-noto-mono.conf .
$ sudo ln -s ../conf.avail/70-noto-cjk.conf .
```

> root権限がないのであれば、`~/.config/fontconfig/conf.d`を作り、その中から`/etc/fonts/conf.avail`内からシンボリックリンクを貼ったり、オリジナルのファイルを入れても大丈夫です。

# 絵文字の設定

@TsutomuNakamura さんの記事を参考にしました。
https://qiita.com/TsutomuNakamura/items/f48b9ed690cfc008acd2 


