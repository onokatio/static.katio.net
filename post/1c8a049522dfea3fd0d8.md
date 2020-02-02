---
title: おい、ChromeでPicture In Pictureできるようになったぞ(2018/04/15)
tags: Chrome
author: onokatio
slide: false
---
どうも！！！！！！

![k.png](https://qiita-image-store.s3.amazonaws.com/0/154157/3b8cc9a8-5fa9-7c16-5589-b8a6a9e88187.png)


Mac OSのSafariなどで使える、Picture In Picture。任意の動画をポップアップウィンドウで再生できる機能です。
それが、ついにGoogle Chromeで使えるようになりました。
Youtubeなどのストリーミングでも正常に動作します。

# インストール

現行のGoogle Chrome、Google Chrome beta、Google Chrome developer、またChromiumでも対応されていません。
現在確認しているのは、毎日ビルドされる超不安定版Chrome、その名も`chromium snapshot`です。
これは、最新のchromiumのソースをビルドして作られるChromeで、一番のベータ版となっています。

リンク: https://www.chromium.org/getting-involved/download-chromium

Archlinuxの場合はAURがあるのでコマンド一発です。

```
$ yaourt -S chromium-snapshot-bin
```

自分が動作を確認したバージョンは、`68.0.3398`です。

# 有効化

`chrome://flags`とURL欄に入力すると、開発者向けの実験機能を有効化するページを開けます。
そこで`Enable Picture-in-Picture`という項目で、ドロップダウンを`Disabled`から`Enabled`に変更しましょう。

# 使い方

動画などの再生エリア（<video>）の上で、右クリックをします。（Youtubeなど、オリジナルの右クリックメニューが搭載されている場合はダブル右クリック）
そうすると、「ピクチャー　イン　ピクチャー」という項目が増えているので、そこをクリックします。
そうすると、常に最前面で枠なしのウィンドウで動画が再生され始めます。

それでも再生されない場合、「コントロールを表示」を選択し、動画右下の縦三点リーダーを選択、「ピクチャー　イン　ピクチャー」を選択しましょう。

10回に1回ほどブラウザがクラッシュし、5回ほどタブがクラッシュし、3回ほど再生されなくなります。運です。

![k.jpg](https://qiita-image-store.s3.amazonaws.com/0/154157/d50f662b-d851-6c82-976f-51b881ad0a4f.jpeg)
![k1.jpg](https://qiita-image-store.s3.amazonaws.com/0/154157/43e2ad52-3fde-1074-3849-f6321d2e443d.jpeg)


# まとめ

Picture In Pictureは、動画を再生しながら別の作業をする場合にとても便利な機能です。
未だ不安定で、リリースビルドには含まれていませんが、ぜひともこれから安定化してほしいところです。

ちなみに、記念すべきマージコミットは以下のようです。
https://chromium-review.googlesource.com/c/chromium/src/+/854719/

