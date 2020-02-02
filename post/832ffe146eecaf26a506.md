---
title: ArchlinuxでモナコインをビルドするとBigNumでエラーが出る
tags: archLinux Monacoin
author: onokatio
slide: false
---
モナコイン（と、元のソースであるビットコイン）は、内部で使用する多倍長整数に、`<openssl/bn.h>`が持つ'BIGNUM'を利用しています。

このBIGNUMは、openssl 1.0ではクラスなのですが、1.1から構造体になりました。
そのため、標準のopensslが1.1であるArchlinuxなどでモナコインをビルドしようとすると、以下のようなエラーが発生します。

```c++:エラーメッセージ
bignum.h:56:24: error: invalid use of incomplete type ‘BIGNUM’ {aka ‘struct bignum_st’}
    class CBigNum : public BIGNUM
                        ^~~~~~ 
```

これを防ぐためには、openssl 1.1と共生できるopensslの1.0パッケージをインストールし、オプションでそちらを使うように指定します。

```sh
$ sudo pacman -S openssl-1.0
$ ./configure --with-openssl PKG_CONFIG_PATH=/usr/lib/openssl-1.0/pkgconfig
```



まあ、今はarithっていうbignumを使ってるみたいですね

