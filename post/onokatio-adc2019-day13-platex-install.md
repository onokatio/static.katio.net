---
title: "pLaTeXの環境構築をする"
date: 2019-12-13 19:12:00 +0900
---

pLaTeXの環境構築をする
===

この記事は、[onokatio Advent Calendar 2019](/adventcalendar/2019/onokatio) 13日目の記事です。


# 各用語について

参考: https://qiita.com/zr_tex8r/items/a924be192ecea7e6bbe4

## TeX

TeXは、記法の一種で、いわゆるマークアップ言語。例えばHackMDはTeX記法をサポートしている。各コマンドはバックスラッシュ（Windowsの場合は円マーク）から始まり、かもめカッコ{}によって引数を取る。

## LaTeXに

LaTeXは、TeX記法を使って組版ドキュメント、つまり段落や表のある文書を作成できるシステム。

## pLaTeX

日本語対応LaTeXを、縦書き表示や縦組に対応させたもの。

# 今回やること

LaTeXの環境構築(依存関係)がクソ面倒くさかったので、今後のために手順を残しておく。

## Archlinuxにインストール

とりあえずArchwikiを参考にしながら進めましょう。

https://wiki.archlinux.jp/index.php/TeX_Live

```
$ sudo pacman -S texlive-core
```

これでtexlive-coreと、依存であるtexlive-binがインストールされます。  
前者が`/usr/share`、後者が`/usr/bin`を提供しているみたいですが、よく違いがわかりません。

で、日本語対応します。


```
$ sudo pacman -S texlive-langjapanese
```

正直のところこれが何をしているのかはわかっていません。フォントの追加なのか、日本語独自の機能を追加するのか、まあ気にせずとりあえず入れましょう。

以上で終わりです。試行錯誤しましたが最終的には案外簡単でしたね。

# .texファイルをpdfへコンパイルする

まず、`.tex`ファイルをdvi形式へ変換します。また、この時使用している`.sty`ファイルなどがあればカレントディレクトリへ置いておきます。

```
$ platex hoge.tex
```

この時点で、`hoge.aux` `hoge.log` `hoge.dvi`の3つのファイルが生成されます。

latexは本来、このdvi形式のファイルを生成することが目的のシステムだったとのこと。

次に、`.dvi`をpdfへ変換します。

```
$ dvipdfmx hoge.dvi
```

このコマンドはtexlive-coreに含まれています。以上で大体の操作は完了です。