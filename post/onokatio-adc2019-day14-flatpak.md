---
title: "FlatpakをArchlinuxで運用する"
date: 2019-12-15 01:14:00 +0900
---

FlatpakをArchlinuxで運用する
===

この記事は、[onokatio Advent Calendar 2019](/adventcalendar/2019/onokatio) 14日目の記事です。

# Flatpakとは

Flatpakは、パッケージマネージャの一種で、パッケージごとにSandboxが起動するのが特徴です。
少し詳しく話しましょう。

## 従来のパッケージマネージャーの場合

従来、Linux系のOSに付属するパッケージマネージャ(aptやyumなど)では、アプリケーションごとに`/`を最上位としたディレクトリ構造を作成し、圧縮したものをパッケージ(.debや.rpm)と呼んでいます。  
それを各パッケージマネージャーが特定のURLからダウンロードし、システム上で展開します。

例えば、slコマンドでは以下のような構造を持った圧縮ファイルが生成されます。

```
usr/
usr/bin/
usr/bin/sl
usr/share/
usr/share/licenses/
usr/share/licenses/sl/
usr/share/licenses/sl/LICENSE
usr/share/man/
usr/share/man/man1/
usr/share/man/man1/sl.1.gz
```

これを`/`で展開することで、/usr/bin以下にバイナリが置かれる、といった仕組みです。

> 割愛しましたが、実際にはパッケージのファイルには圧縮ファイルだけではなくインストール前に実行してほしいコマンドのシェルスクリプトや、パッケージマネージャーへ情報を伝えるためのメタデータなどが含まれています。
> 

また、アンインストールする場合には、この圧縮ファイルに含まれている構造をリストアップし、当該パスに存在するファイルを消せば良いわけです。

## Flatpakの場合


### OSTreeについて

Flatpakでは、内部的にはOSTreeと呼ばれるプログラムを使用しています。

https://ostree.readthedocs.io/en/latest/manual/introduction/

OSTreeは、OSのファイルシステム構造を部分的にアップデートするシステムです。簡単に言えば、「差分を保管しない、バイナリ専用のgit」と説明できます。どういうことか説明していきましょう。

OSTreeは、OSのファイルシステム以下をgitのように木構造の集合体として扱います。

木の一部ディレクトリより以下(refと呼ぶ)を更新するには、その一部より以下の木構造をどこからか持ってきます。  
その持ってくる木構造がパッケージです。木構造を更新するには、ハードリンクを使って一部のディレクトリを、パッケージから別のパッケージへ挿げ替えます。これがパッケージの更新です。

このように、特定ディレクトリ以下の構造を、gitのようにブランチを切り替えるように簡単に付け替えることができます。そのため、特定パッケージを削除したい場合はそのrefs/ディレクトリごと消してしまえば問題ありません。

各パッケージが、gitのsubmoduleで、パッケージのアップデートが各submoduleのブランチのチェックアウトと考えるとわかりやすいかもしれません。

これにより、`/usr`以下をOSTree以外の方法で書き込み不可にした読み取り専用ファイルシステムとして管理します。

以上が、OSTreeの説明です。

Flatpakは、このOSTreeを使用して、各Flatpakパッケージが含むルートファイルシステムの特定のバージョンを`~/.local/share/flatpak/app/<package name>/<arch>/<version>`、へ置き、  
その複数のバージョンの中から現在使用しているバージョンのブランチを`~/.local/share/flatpak/app/<package name>/current/`としてマウント（ハードリンクの付け替え）します。  
OSTreeにより、アプリケーションが使用するファイルの本体を別の場所に置いておき、本来置きたいところからハードリンクを貼るというアプローチです。

これにより、パッケージの更新やアンインストールが簡単に行えるようになりました。  
まあ複雑に聞こえますが、特に難しいことはしておらず、ちょっとファイルの置き方を工夫しているだけです。

### sandbox/bubblewrapについて

Flatpakでは、各パッケージのファイルシステムを`/`へ展開せずに、ホームディレクトリ以下にマウントしました。ではアプリケーションをどう起動するかというと、そのマウントしたディレクトリをルートとしたsandboxを起動します。このsandboxがbubblewrapと呼ばれるプログラムです。

https://github.com/containers/bubblewrap

sandboxは、具体的には、ファイルシステムの隔離、プロセスのnamespaceの隔離、seccompでsyscallのフィルタリングなどを行っています。  
まあLinuxのchrootだとかFreeBSDのjailだとか、最近流行りのコンテナ技術の上位互換だと思ってもらって構いません。というか内部的にはrunCでコンテナを使っているはずです。

で、sandbox内部に/procだとか/devとか/sysをいい感じにバインドマウントしてアプリケーションの実行ファイルを実行している感じです。

もちろん、sandbox内部でプロセスをフォークしてもその隔離は継承されます。

### アプリケーション間通信について

sandboxをまたいだ各アプリケーション間で通信する場合や、sandboxの外へのファイルアクセスを行う際は、dbusを利用して権限を求めるそうです。(例えば`~/Download/`以下へのアクセス権限だったり。)  
iOSやAndroidに似ていますね。

### おまけ: Snappyとの違い

Ubuntu Canonicalが開発している、Snappy/snapがあります。
参考先のページを見てみましたが、思想の違いやシステムの違いがあります。

参考: https://askubuntu.com/questions/866511/what-are-the-differences-between-snaps-appimage-flatpak-and-others

あまり良くわかりませんでしたが、snapの方はあまり開発がオープンでない、っぽいですね。

また、flatpakではライブラリも1つのパッケージとして扱われていて、ライブラリをアプリケーションから使用する際はやはり読み込み専用でバインドマウントするようです。

# ArchLinuxでFlatpakを使う

https://wiki.archlinux.org/index.php/Flatpak

```shell
$ sudo powerpill -S flatpak
```

インストールしたら、リポジトリを追加します。

```shell
$ flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
```

このリポジトリというのは、まさにgitと同じで、パッケージを取ってくる上流サーバーを指定するものです。flatpak公式ではflathubと呼ばれるリポジトリを管理していますが、もちろん独自に運用することも可能です。

また、$XDG_DATA_DIRSへパスを追加しましょう。

```diff=
--- a/zsh/zprofile.d/01-path.zsh
+++ b/zsh/zprofile.d/01-path.zsh
@@ -64,6 +64,8 @@ export PATH=$HOME/.linuxbrew:$PATH
 #eval $(brew shellenv)

 export XDG_DATA_DIRS="/home/linuxbrew/.linuxbrew/share:$XDG_DATA_DIRS"
+export XDG_DATA_DIRS="/var/lib/flatpak/exports/share:$XDG_DATA_DIRS"
+export XDG_DATA_DIRS="/home/katio/.local/share/flatpak/exports/share:$XDG_DATA_DIRS"

 export PATH=/usr/local/opt/coreutils/libexec/gnubin:$PATH
 export PATH=/usr/local/opt/gnu-sed/libexec/gnubin:$PATH
```

自分はこのように.zprofileへ追加しました。

試しに、アプリケーションをインストールしてみましょう。パッケージの検索サブコマンドはsearch、インストールはinstallです。

```shell
$ flatpak search blender
Name            Description                                    Application ID             Version        Branch        Remotes
Blender         Free and open source 3D creation suite         org.blender.Blender        2.81           stable        flathub

$ flatpak install blender
Looking for matches…
Found similar ref(s) for ‘blender’ in remote ‘flathub’ (system).
Use this remote? [Y/n]:
Found ref ‘app/org.blender.Blender/x86_64/stable’ in remote ‘flathub’ (system).
Use this ref? [Y/n]:
Required runtime for org.blender.Blender/x86_64/stable (runtime/org.freedesktop.Platform/x86_64/19.08) found in remote flathub
Do you want to install it? [Y/n]:

org.blender.Blender permissions:
    ipc    network    pulseaudio    x11   dri   file access [1]

    [1] host


        ID                                                    Branch            Op            Remote             Download
 1. [✓] org.freedesktop.Platform.GL.default                   19.08             i             flathub             90.8 MB / 90.8 MB
 2. [✓] org.freedesktop.Platform.GL.nvidia-440-36             1.4               i             flathub            102.5 MB / 102.5 MB
 3. [✓] org.freedesktop.Platform.Locale                       19.08             i             flathub             16.7 kB / 318.9 MB
 4. [✓] org.freedesktop.Platform.VAAPI.Intel                  19.08             i             flathub              8.7 MB / 8.7 MB
 5. [✓] org.freedesktop.Platform.ffmpeg-full                  19.08             i             flathub              3.6 MB / 3.6 MB
 6. [✗] org.freedesktop.Platform.openh264                     19.08             i             flathub            594.2 kB / 593.4 kB
 7. [✓] org.freedesktop.Platform                              19.08             i             flathub            223.7 MB / 237.7 MB
 8. [✓] org.blender.Blender                                   stable            i             flathub            113.7 MB / 113.7 MB

Warning: org.freedesktop.Platform.openh264 not installed
Installation complete.

```

で、起動します。

```shell
$ /var/lib/flatpak/exports/bin/org.blender.Blender
```

本来は、さきほど$XDG_DATA_DIRSを追加したため、.desktopファイルが認識され、アプリエクスプローラーなどから起動できますが、再起動が面倒くさいのでコマンド直打ちしました。
これでBlenderが無事立ち上がることを確認できました。

![](https://static.katio.net/image/blender.png)