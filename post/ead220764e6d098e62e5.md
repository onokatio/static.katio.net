---
title: webサイトを再帰的にダウンロードして、ローカルでも閲覧できるようにする
tags: Linux
author: onokatio
slide: false
---
まあ端的に言えば以下です。

```
$ wget -rkp -linf -H example.com
```

wgetを使って再帰的にダウンロードしています。また、絶対リンクはすべて相対リンクに置き換えてくれます。
ただ、あまりにも多すぎると永遠に終わらないので、-lで階層を指定しましょう。
また、-Hを外すと、違うドメインの場合はダウンロードしないようになります。

ちなみに、シェル芸でクロールする裏技もあります。

```
$ curl -Ss http://www5a.biglobe.ne.jp/~todoroki/nct.htm|rg data|rg pdf|sed -e 's/.*[href|HREF]=\"//'|sed -e 's/pdf\".*$/pdf/'|while read name;do echo http://www5a.biglobe.ne.jp/~todoroki/$name;done|xargs wget
```

