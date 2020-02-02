---
title: CUIなサーバーだけでradikoを聞きたい！
tags: radiko
author: onokatio
slide: false
---
どうも。かちおです。ちょっと作業をしているときに、無性にコマンドラインだけでラジオを聞きたくなりますよね？ということで自分なりにどうすれば再生できるか色々と試してみました。

## 方法1

https://gist.github.com/matchy2/3956266 で紹介されているスクリプトを使う方法です。
これだと録音しかできないのですが、有志の方が再生にも対応させるシェルスクリプトを書いてくれていました。

https://mtunn.wordpress.com/2017/02/08/raspberrypi3%E3%81%A7radiko/

swftoolsというパッケージが必要です。`sudo apt install swftools`で導入できました。

```bash
$ ./radiko.sh -p BAYFM78
```

で聞くことができた。この`BAYFM78`みたいなキー（文字列）は、radiko.jpの各ラジオ局のページのURLで確認できる。w3mとか使えばサーバーでもok。

自分で各ラジオ局のキーをまとめてみたら以下のようになった。

| ラジオ局  | キー |
|:--------------:|:---:|
| NHK第1         | `JOAK`
| NHK第2         | `JOAB`
| NHK FM         | `JOAK-FM`
| FM横浜         | `YFM`
| 文化放送        | `QRR`
| ラジオNIKKEI第1 | `RN1`
| ラジオNIKKEI第2 | `RN2`
| Jwave          | `FMJ`
| bayfm78        | `BAYFM78`
| TBSラジオ       | `TBS`
| NACK5          | `NACK5`
| TOKYOFM        |  `FMT`
| ニッポン放送     | `LFR`
| ラジオ日本      | `JORF`
| 放送大学        | `HOUSOU-DAIGAKU`
| InterFM       | `INT`

もしバッググラウンドで動かしたいなら以下のように。

```
$ ./radiko.sh -o key >/dev/null 2>&1 &
```

ただmplayerの出力である標準出力と標準エラー出力を捨ててるだけ。

## 方法2

上のがめんどくさかったので、もっと簡単にできないかと思い、radiko.jpをchrome開発者ツールで見ているとm3u8なリクエストを発見。ということで以下のようにすればもっと簡単にradikoを聞くことができた。

1.  mplayerをサーバーにインストール
2.  radiko.jpをなんらかのブラウザで開き、開発者ツールのnetwork欄から拡張子が`.m3u8`なリクエストを見つけ、そのURLをコピー。
3.  mplayerの引数にURLを渡すだけ。

たとえばbayfm78は以下のようになった。

```
$ http://f-radiko.smartstream.ne.jp/BAYFM78/_definst_/simul-stream.stream/chunklist_w710715257.m3u8
```

で、これの問題は時間が立つとこのURLが変わってしまうこと。
なので素直に方法1を使うことにした。

----

結局他の人が書いたブログを引用するだけになってしまったけど、まあとりあえずこれでサーバーでラジオが聞けるね！
やったね！

