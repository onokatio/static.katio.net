---
title: Oneplus 6 & Android 9 (OxygenOS 9)をTWRPとMagisk導入でroot化する
date: 2019-01-26 10:55:10 +0000
---
Oneplus 6 & Android 9 (OxygenOS 9)をTWRPとMagisk導入でroot化する
===

参考:https://forum.xda-developers.com/oneplus-6/help/root-android-pie-9-0-t3845400

Oneplus 6 & OxygenOS 9ではtwrpの最新版が動作しないので、blu_sparkという、twrpをフォークしたローダーを使用します。

まず、Android 9にアップデートしたOneplus 6内のブラウザなどで、以下のリンクからzipファイルをダウンロードしてください。

[https://forum.xda-developers.com/devdb/project/dl/?id=30420](https://forum.xda-developers.com/devdb/project/dl/?id=30420)

また、以下リンクから、Magiskの最新版をダウンロードしてください（執筆時点ではMagisk-v17.1.zipで動作しました。17.2だとブートループしました。）

[https://github.com/topjohnwu/Magisk/releases/tag/v17.2](https://github.com/topjohnwu/Magisk/releases/tag/v17.2)

この２つを、Oneplus 6内に保管します。

次に、PCで以下のリンクから、twrpの一時起動イメージ（拡張子img）をダウンロードします。

[ttps://forum.xda-developers.com/devdb/project/dl/?id=30421](https://forum.xda-developers.com/devdb/project/dl/?id=30421)

ダウンロードできたら、fastbootで起動します。  
※ファイル名は適宜変えてください。

```
$ adb reboot bootloader
$ sudo fastboot boot ./twrp-3.2.3-x_blu_spark_v9.85v2_op6.img
```

起動時にパスコードやPINを聞かれるかもしれません。入力しましょう。

入力できたら、「インストール」を押し、先程本体にダウンロードしたtwrpのzipファイルを選択、インストールします。

インストールが終わったら、今度は同じ手順でmagiskのzipファイルをインストールします。

終わったら再起動します。アプリメニューにmagisk managerがあれば成功です。magiskの機能でroot ユーザーが使えます。
