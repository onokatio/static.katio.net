---
title: "flatpakパッケージを自作したかった"
date: 2020-01-02 00:53:00 +0900
---

flatpakパッケージを自作したかった
===

参考: https://docs.flatpak.org/en/latest/first-build.html


flatpakについて知りたい方は、この記事をどうぞ。 [FlatpakをArchlinuxで運用する](https://blog.katio.net/page/onokatio-adc2019-day14-flatpak)

# 今回作るもの

Minecraftの多機能ランチャー、multimcをflatpakのパッケージにします。

# 準備

```
flatpak install flathub org.freedesktop.Platform//19.08 org.freedesktop.Sdk//19.08
```

これでSDKというか、ビルドツール一式が手に入るそうです。

# マニフェストについて

マニフェストの雛形は、以下のようなjsonです。

```json=
{
    "app-id": "org.flatpak.Hello",
    "runtime": "org.freedesktop.Platform",
    "runtime-version": "19.08",
    "sdk": "org.freedesktop.Sdk",
    "command": "hello.sh",
    "modules": [
        {
            "name": "hello",
            "buildsystem": "simple",
            "build-commands": [
                "install -D hello.sh /app/bin/hello.sh"
            ],
            "sources": [
                {
                    "type": "file",
                    "path": "hello.sh"
                }
            ]
        }
    ]
}
```

マニフェストについて詳しく知りたい場合は以下を読みましょう。

https://docs.flatpak.org/en/latest/manifests.html  
https://www.mankier.com/5/flatpak-manifest

斜め読みしてきました。`app-id`から`sdk`はまあわかるとして、それ移行の説明をします。

- `command`: このパッケージが主に提供するバイナリファイルです
- `modules`: このパッケージを作るために必要なファイル群です。これをモジュールと呼びます。modulesの配列の中に、メインのソースコードや、依存関係にある別のソースコード、それらのコンパイル方法を書いていきます
  - `name`: モジュール名
  - `buildsystem`: そのファイルのビルド方法です。`simple`の場合はその後の`build-commands`へコマンドを書きます。その他にも、以下のようなビルド方法を指定できます
    - autotools/make
    - cmake
    - ninja
    - meson
  - `sources`:
    モジュールのソースコード取得方法を書きます
    - `type`: ソースコードの取得方法を指定します。`file`の場合はローカルのファイルを使用しますが、それ以外にもURLからファイルを取得するなどの方法があります。使える方法は以下です
      - archive(tar/zip)
      - git
      - bzr
      - file
      - dir
      - script
      - shell
      - patch
      - extra-data


以上がマニフェストの説明です。めちゃくちゃ簡単にいえば、「ソースコードをどう取ってきてどうビルドしたらパッケージが作れるか」を定義しています。

個人的には、ArchLinuxのPKGBUILDに似ているな、と感じました。

# runtimeとsdkについて

先程軽く流しましたが、各flatpakパッケージにはruntimeとsdkを指定する必要があります。runtimeやsdkも、flatpak内ではパッケージとして扱われており、内容はルートからのディレクトリ構造です。

runtimeは、アプリケーションが実行される際に一番ベースとなるファイルシステムを指定します。つまり、本来OSやディストリビューションが提供しているOSのイメージのような概念です。
(Dockerでいう、FROMに指定するイメージ)

自分で作成したアプリケーションを展開するだけでは、もちろんflatpakのコンテナは動作しないため、/bin/shやglibcを含んだruntimeを指定する必要があるわけです。

ある程度デスクトップ系のライブラリが追加されており、flatpak公式から提供されているランタイムが先程出てきた`org.freedesktop.Platform`です。この他にも、このランタイムをベースにGTKやKDEなどが含まれたランタイムも配布されています。

sdkは、コンパイル時に使用するファイルシステムです。いわゆるdev dependencyってやつですね。コンパイルする際に必要なベースのファイルシステム（パッケージ）を指定します。
これも公式からある程度配布されています。

[公式が提供するランタイム/SDK一覧](https://docs.flatpak.org/en/latest/available-runtimes.html)

# 依存関係について

単刀直入に言うと、flatpakではライブラリの依存関係は自力で解決する必要があります。つまり、ライブラリごとにパッケージを作らず、1つのパッケージに必要なライブラリを全部含めた上で配布する必要があります。  
Linuxでよくあるパッケージマネージャーとは、ここが大きな違いです。  
ただ、ランタイムが提供されている場合に限り、自身でライブラリをインストールせずランタイム内部のファイルを使用できます。ただ、ランタイムは1つまでしか指定できないことに注意してください。

こういう思想は、LinuxのAppImageや、静的リンクした単体のexeファイルで配布するWindowsアプリケーションに似ていますね。

まあともかく、この仕様のおかげで、flatpakのパッケージは`.flatpak`拡張子のファイルさえダウンロードすれば動かすことが可能です。

# マニフェストを書く

ということで、マニフェストを書きます。

```
{
    "app-id": "org.multimc.MultiMC",
    "runtime": "org.kde.Platform",
    "runtime-version": "5.13",
    "sdk": "org.kde.Sdk",
    "sdk-extensions" : [ "org.freedesktop.Sdk.Extension.openjdk8" ],
    "command": "MultiMC",
    "finish-args": [
	    "--socket=x11",
	    "--share=ipc",
	    "--device=dri",
	    "--socket=pulseaudio",
	    "--share=network"
    ],
    "modules": [
	{
	    "name" : "openjdk",
	    "buildsystem" : "simple",
	    "build-commands" : [
		    "/usr/lib/sdk/openjdk8/install.sh"
	    ]
	},
        {
            "name": "multimc",
	    "buildsystem": "simple",
	    "build-commands" : [
		    "ls -l MultiMC/",
		    "mkdir -p /app/bin/bin",
		    "install -Dm744 MultiMC/bin/MultiMC /app/bin/MultiMC",
		    "echo $LD_LIBRARY_PATH",
		    "mkdir /app/lib",
		    "cp MultiMC/bin/*.so /app/lib/"
	    ],
            "sources": [
                {
                    "type": "archive",
                    "url": "https://files.multimc.org/downloads/mmc-stable-lin64.tar.gz",
		    "sha256": "ec47f28dcf7952ccbfbcc48b787f01ce945738eea086ae7243e625b636a4ceaa"
                }
            ]
        }
    ]
}
```

書いたのですが、動かん…。

```
qt.qpa.xcb: could not connect to display
qt.qpa.plugin: Could not load the Qt platform plugin "xcb" in "" even though it was found.
This application failed to start because no Qt platform plugin could be initialized. Reinstalling the application may fix this problem.

Available platform plugins are: eglfs, minimal, minimalegl, offscreen, vnc, wayland-egl, wayland, wayland-xcomposite-egl, wayland-xcomposite-glx, xcb.
```

5時間ぐらい探したのですが、よくわからないのでここらへんで終わります。うーん…。