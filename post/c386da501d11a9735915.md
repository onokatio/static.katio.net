---
title: Linuxのタッチパッドでピンチ・3本指・4本指ジェスチャーを使う
tags: Linux
author: onokatio
slide: false
---
どうも。WindowやMacでは、3本指、4本指を使った、さまざまなジェスチャーが使用できます。
Linuxでは、2本指スクロールが限界に思えてますが、もちろんLinuxでも、マルチタッチ・マルチジェスチャーを利用できます。

# libinputとは

XorgやWaylandと、キーボード・ポインティングデバイスの仲介をするライブラリ・ドライバです。
従来は`Synaptics`と呼ばれるものが使用されていましたが、メンテナンスに移行し、現在はこちらを使うことが推奨されています。

現在では、特に何も設定しなければデフォルトで使用されるはずです。
ArchLinuxでは`xf86-input-libinput`と`libinput`というパッケージ名でインストールできます。他のディストリビューションでもほとんどパッケージ名は変わりません。

# libinput-gestures

`libinput-gestures`は、libinputがサポートするさまざまなタッチパッドイベントが発生するたびに、任意のコマンドを実行できるパッケージ（デーモン）です。

## インストール

Archlinux: `yaourt -S libinput-gestures`

Ubuntuなどだと自力でソースからインストールする必要があるらしいです。
https://github.com/bulletmark/libinput-gestures

## 設定

`libinput-gestures-setup start`をどこかで実行させましょう。デスクトップ環境を使っているばら「自動起動」のメニューでコマンド追加をすると良いと思われます。

また、対応してるデスクトップ環境では`libinput-gestures-setup autostart`と入力すれば自動起動に勝手に追加されます。


また、ユーザーをinputグループに追加する必要があります。

```
sudo gpasswd -a $USER input
```

## 設定ファイル

```
$ cp /etc/libinput-gestures.conf ~/.config/libinput-gestures.conf
$ vi ~/.config/libinput-gestures.conf
```


それぞれの行に1つ設定を書くことができます。
構文は以下です

```
gesture <action> <motion> [finger_count] <command>
```

`<action>`には、`swipe`と`pinch`を書くことができます。

`<action>`を`swipe`にした場合、`<motion>`には、`up` `down` `left` `right`や、2つを組み合わせた`left_up` `right_down` ... を指定できます。
`<action>`を`pinch`にした場合、`<motion>`には、`in` `out` `clockwise` `anticlockwise`を指定できます。
それぞれ意味はそのままです。

swipeの場合、finger_countには、数字（3 or 4）を書くことができます。3本指か、4本指かの指定です。省略した場合3になります。

commandには任意のコマンドを指定できます。

例：

```
gesture swipe left xdotool key control+Tab
# 3本指で左にスワイプしたとき、xdotoolを使って、control+Tab（ブラウザで「次のタブ」）を押したことにします

gesture swipe up skippy-xd-toggle
# 3本指で上にスワイプしたとき、skippy-xd（MacのミッションコントロールのLinux版）を起動する

gesture pinch out xdotool keydown Alt click 4 keyup Alt
# ピンチアウトしたら、画面ズームを実行する
```

# さいごに

案外、Linuxでも高度なジェスチャーを利用することができました。
快適なLinuxライフを楽しんでください。

参考： https://github.com/bulletmark/libinput-gestures/blob/master/README.md

