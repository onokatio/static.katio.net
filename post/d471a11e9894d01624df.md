---
title: Bitcoinが楕円曲線暗号の公開鍵からアドレスを生成する流れをシェル芸だけで実装してみる
tags: Bitcoin Linux Blockchain シェル芸 ビットコイン
author: onokatio
slide: false
---
どうも。ひょんなことから、公開鍵 to アドレス の自力変換をしなければいけなくなったので書きます。
端的に言えば以下のページの通りになります。

https://en.bitcoin.it/wiki/Technical_background_of_version_1_Bitcoin_addresses

![k.png](https://qiita-image-store.s3.amazonaws.com/0/154157/05a73fb1-539b-0f85-8ccb-f148104c6b4b.png)

```
0. 楕円曲線署名の秘密鍵を取得
1. 0x04,座標のx,yから公開鍵を取得
2. SHA256する
3. RIPEMD-160する
4. 先頭にアドレスプレフィックスを付ける

# ここで一旦止めて、5からはチェックサムを作っていきます。
5. 4をSHA256
6. 5をSHA256
7. 6の先頭4バイトを取る
8. 7を4の末尾に追加する。
9. 8をbase58check encodeする。

# 完成！
```

ではやっていきます。

# 1. 公開鍵の取得

0は飛ばして、1.の公開鍵の取得から始めます。
今回はリンク先と同じように「`0450863AD64A87AE8A2FE83C1AF1A8403CB53F53E486D8511DAD8A04887E5B23522CD470243453A299FA9E77237716103ABC11A1DF38855ED6F2EE187E9C582BA6`」を使用します。

```bash
$ p1="0450863AD64A87AE8A2FE83C1AF1A8403CB53F53E486D8511DAD8A04887E5B23522CD470243453A299FA9E77237716103ABC11A1DF38855ED6F2EE187E9C582BA6"
```
# 2. SHA256する

```bash
$ p2=$(for i in `seq 1 2 129`;do echo $p1|cut -c$i-$((i+1));done|while read B;do printf "\x$B";done|sha256sum|cut -c-64)

$ echo $p2
600ffe422b4e00731a59557a5cca46cc183944191006324a447bdb2d98d4b408
```

forとcutで2文字ずつ文字列から切り出し。printfで16進数からむりやりバイナリ（文字列）に変換、sha256sumを通し、最後にcutで余分な出力を消しています。

# 3. RIPEMD-160

```bash
$ p3=$(openssl rmd160 <(for i in `seq 1 2 63`;do echo $p2|cut -c$i-$((i+1));done|while read B;do printf "\x$B";done)|awk '{print $2}')

$ echo $p3
010966776006953d5567439e5e39f86a0d273bee
```

前回と同じように、文字列からバイナリに変換した後、opensslコマンドを使ってRIPEMD-160を計算、awkで余計な出力を省いています。

# 4. アドレスプレフィックス

```bash
$ p4=$(echo 00$p3)

$ echo $p4
00010966776006953d5567439e5e39f86a0d273bee
```

ビットコインのアドレスプレフィックスである0x00を先頭に足しています。

# 5. 4をSHA256

```bash
$ p5=$(for i in `seq 1 2 41`;do echo $p4|cut -c$i-$((i+1));done|while read B;do printf "\x$B";done|sha256sum|cut -c-64)

$ echo $p5
445c7a8007a93d8733188288bb320a8fe2debd2ae1b47f0f50bc10bae845c094
```

バイナリに変換した後、SHA256しています。

# 6. 5をSHA256

```bash
$ p6=$(for i in `seq 1 2 63`;do echo $p5|cut -c$i-$((i+1));done|while read B;do printf "\x$B";done|sha256sum|cut -c-64)

$ echo $p6
d61967f63c7dd183914a4ae452c9f6ad5d462ce3d277798075b107615c1a8a30
```

# 7. 6の先頭4バイトを取る

```bash
$ p7=$(echo $p6|cut -c-8)

$ echo $p7
d61967f6
```

# 8. 7を4の末尾に追加する。

```bash
$ p8=$(echo $p4$p7)

$ echo $8
00010966776006953d5567439e5e39f86a0d273beed61967f6
```

# 9. 8をbase58check encodeする

まず、ここでbase58check encodeの仕組みを見ていきます。
https://en.bitcoin.it/wiki/Base58Check_encoding

- 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyzだけを使って値を表す。
- 入力を、巨大なただの整数だと考え、商が0になるまで58で割っていく。そして毎回出るあまりを取得する。つまり、base58checkは58進数に変換しているのと同じこと。

- もし上で先頭に0x00が来た場合、0は割り算の際に無視されてしまう。つまり、先頭の0はついていてもついていなくても結果が同じになってしまう。そのために、先頭についていた0x00のぶん、つまり0が2つあるごとに、4.の出力の先頭に一つ'1'を付けなおす。つまり、base58checkで'1'を追加する。


これを実装していきます。

### 9.1 入力を巨大な整数として考える。
10進数に直します。

```bash
$ p91=$(echo "obase=10; ibase=16; $(echo $p8|tr 'abcdef' 'ABCDEF')"|bc)

$ echo $p91
25420294593250030202636073700053352635053786165627414518
```

bcで進数変換をします。また、bcは16進数をアルファベットの大文字でしか読んでくれないので、trで小文字to大文字の変換をしています。

### 9.2 0になるまで58で割って、あまりを取得する。

```bash
$ ans=$p91 && p92=( $(while [[ "$ans" != "0" ]];do r=$(echo "$ans%58"|bc);ans=$(echo "$ans/58"|bc);echo $r;done|tac|tr '\n' ' ') )

$ echo $p92
5 27 54 19 19 8 24 41 50 35 2 23 38 22 48 10 27 53 18 46 38 16 44 10 23 6 54 20 51 42 53 20
```

bcであまりと商の計算をしています。さいごに、並びを元に戻すため、tacしたのち、trで改行を空白に置き換え、配列にしています。
これで改行区切りの10進数のあまりが取得できました。

### 9.3 あまりをbase58check形式に変換する

`123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`だけを使って表します。

```bash
$ i=0 && base58=(1 2 3 4 5 6 7 8 9 A B C D E F G H J K L M N P Q R S T U V W X Y Z a b c d e f g h i j k m n o p q r s t u v w x y z) && p93=$(for i in $p92;do echo $base58[(($i+1))];done|tr -d '\n')

$ echo $p93
6UwLL9Risc3QfPqBUvKofHmBQ7wMtjvM
```

p92から数値を取り出し、base58配列の要素から文字列をとってきて、さいごに連結しています。

### 9.4 8.で先頭が0だった場合、最後に'1'を付ける。

```bash
$ num=$(( ($(echo $p8|sed -e 's/\(0*\).*/\1/'|wc -c)-1)  / 2  )) && p94=$(echo $(yes 1|head -n$num|tr -d '\n')$p93)

$ echo $p94
16UwLL9Risc3QfPqBUvKofHmBQ7wMtjvM
```

sedで、「先頭に並ぶ0とそれ以外」を「先頭に並ぶ0」だけに置き換えた後、wcでバイト数をしらべ、改行コード分の1を引いた後、0x00が1バイト、つまり2つならんでいるまとまりを数えるため、2で割っています。そしてその数だけyesで大量生成した1の羅列から1を取ってきます。

# まとめ


無事にリンク先と同じアドレスが生成できましたね！
ここで上記のシェルコマンドをすべてまとめ、シェルスクリプトにしてみました。

```bash:base58check-encode.sh
p1="0450863AD64A87AE8A2FE83C1AF1A8403CB53F53E486D8511DAD8A04887E5B23522CD470243453A299FA9E77237716103ABC11A1DF38855ED6F2EE187E9C582BA6"

p2=$(for i in `seq 1 2 129`;do echo $p1|cut -c$i-$((i+1));done|while read B;do printf "\x$B";done|sha256sum|cut -c-64)

p3=$(openssl rmd160 <(for i in `seq 1 2 63`;do echo $p2|cut -c$i-$((i+1));done|while read B;do printf "\x$B";done)|awk '{print $2}')

p4=$(echo 00$p3)

p5=$(for i in `seq 1 2 41`;do echo $p4|cut -c$i-$((i+1));done|while read B;do printf "\x$B";done|sha256sum|cut -c-64)

p6=$(for i in `seq 1 2 63`;do echo $p5|cut -c$i-$((i+1));done|while read B;do printf "\x$B";done|sha256sum|cut -c-64)

p7=$(echo $p6|cut -c-8)

p8=$(echo $p4$p7)

p91=$(echo "obase=10; ibase=16; $(echo $p8|tr 'abcdef' 'ABCDEF')"|bc)

ans=$p91 && p92=( $(while [[ "$ans" != "0" ]];do r=$(echo "$ans%58"|bc);ans=$(echo "$ans/58"|bc);echo $r;done|tac|tr '\n' ' ') )

i=0 && base58=(1 2 3 4 5 6 7 8 9 A B C D E F G H J K L M N P Q R S T U V W X Y Z a b c d e f g h i j k m n o p q r s t u v w x y z) && p93=$(for i in $p92;do echo $base58[(($i+1))];done|tr -d '\n')

num=$(( ($(echo $p8|sed -e 's/\(0*\).*/\1/'|wc -c)-1)  / 2  )) && p94=$(echo $(yes 1|head -n$num|tr -d '\n')$p93)

echo $p94
```

シェル芸は、ほとんど見直しをせずに、その場で思いつくように書きました。もっとうまい・見やすい・高速な書き方があるかもしれません。そういうときはそっと編集リクエストをいただけると嬉しいです。
また、誰が見てもわかるように、可読性は皆無です。良い子の皆さんは、決してシェルスクリプトなどではなく、pythonやruby、C++で実装しましょう。
それでは！

