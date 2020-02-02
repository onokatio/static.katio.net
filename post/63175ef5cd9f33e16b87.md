---
title: GriveでGoogleドライブをLinuxマシンと同期する
tags: Linux GoogleDrive
author: onokatio
slide: false
---
Googleドライブは便利ですが、自動でファイルエクスプローラーからアクセスできる機能は、WindowsやAndroid等でしか提供されておらず、Linuxマシンをデスクトップとして使っている場合不便です。

ここでは、Googleドライブのディレクトリの内容を、ローカルの特定ディレクトリの内容と同期して、ファイルをいい感じに移動させたりしたいと思います。

# Grive2のインストール

griveは更新が2年ほど前で終わっていますが、有志がフォークしてgrive2を作っているのでそれを使います。

https://github.com/vitalif/grive2 のREADME.mdやwikiに書いてあるとおり、CMakeでビルドしてインストールするのですが、自分はArchlinuxのAURがあったのでそれを使いました。

# ディレクトリの設定

```
cd $HOME
mkdir google-drive
cd google-drive
grive -a
```


`grive -a`を実行すると、URLが表示されるので、コピーしてブラウザで開きます。
開くと、Googleの認証画面でGoogle Driveへのアクセス権を尋ねられるので、連携or許可をクリックします。

そうすると、認証キーが表示されるのでターミナルに貼り付ければ完了です。

あとは自動でGoogleドライブ上の全ファイル・ディレクトリがダウンロードされます。

# 自動同期

```
systemctl --user enable grive-timer@$(systemd-escape google-drive).timer
systemctl --user start grive-timer@$(systemd-escape google-drive).timer
systemctl --user enable grive-changes@$(systemd-escape google-drive).service
systemctl --user start grive-changes@$(systemd-escape google-drive).service
```

上の例では、`google-drive`という名前のホームディレクトリ直下のディレクトリを同期しています。
`grive-timer@.timer`で5分間隔の自動ダウンロード、`grive-changes@.service`でinotifyファイル検知を使って自動アップロードをしています。

これで、Google Driveでファイルの作成/削除やローカルでファイルの作成/削除をすると、同期されるようになりました。

※AURにはsystemdのファイルがなかったので、ソースから.inを直接ダウンロードして手直しして入れました。

#まとめ

内容が、README.mdを日本語訳しただけなので、ほどんど「いかがでしたかブログ」並に薄くなってしまいましたが、役に立てば嬉しいです。

今回のgrive2は、必要になったらファイルの実態をダウンロードする方式(google drive ocamlfuse mount)とは違い、単純にダウンロードして差分同期を取る方式でした。

自分はネットワーク帯域もストレージ帯域も余裕が有り、こちらのほうが便利で使いやすかったのですが、これは人によって異なると思うので、両方試して自分が使い勝手の良い方を使ってみると良いと思います。

