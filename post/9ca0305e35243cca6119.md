---
title: Gnome Keyringの使い方
tags: Linux Gnome-Keyring
author: onokatio
slide: false
---
Gnome Keyringは、Linuxで動作するキーリングツールです。
Linuxマシンをデスクトップで使うとき、あまり直接ユーザーが触ることは少ないですが、内部では重要は役割を果たしています。

# キーリング とは

キーリングは、直訳で鍵束となります。複数の鍵（≒認証情報）を一つにまとめる役割を持ちます。
Gnome KeyeingはGnomeで開発されているキーリングです。

- パスフレーズで暗号化されたSSH秘密鍵の、パスフレーズ
- ChromeやFirefoxなどのブラウザが保管するWebサイトのパスワード
- 暗号化したUSBメモリの複合パスフレーズ
- NetworkManagerが使う、WiFiのアクセスポイントのパスワード

などを暗号化して保管し、ユーザーがLinuxにログインしたタイミングや任意のタイミングで復号化し、持ち主のユーザーしか使用できないようにします。
Lastpassや1passwordのような、パスワードマネージャーのような物だと考えるとわかりやすいかもしれません。もっと簡単に言えば、暗号化できるキーバリューストアです。

キーリングを使うことで、安全に情報を保管できます。利用する場合も、ひとつだけパスワードを覚えておけば問題がありません。
また、パスワードをLinuxのログインパスワードと同じにし、起動時に自動で復号化されるような処理もできます。（※ubuntu Desktopなどはこの方法を採用しているため、ユーザーが直接キーリングを使う機会はほとんどありません、）

# Gnome Keyringのインストール

Ubuntuなど、有名なディストリビューションでは最初からインストールされてると思います。
自分はArchlinuxなので以下のコマンドでインストールしました。

```
$ sudo pacman -S gnome-keyring seahorse
```

seahorseというのは、gnome-keyringの内容を見るためのGUIツールです。Ubuntuの場合は「パスワードと鍵」というソフトがインストールされてると思います。

# 起動の設定

Archwikiによると、GDMなど主要なディスプレイマネージャーは自動で起動をしてくれるようです。
自分の場合はコンソールでログインしてるため、PAMに設定をします。
（PAMを使うことで、ログイン時に自動起動と自動復号化を介入して処理できます。）

```conf:/etc/pam.d/login
#%PAM-1.0

auth       required     pam_securetty.so
auth       requisite    pam_nologin.so
auth       include      system-local-login
auth       optional     pam_gnome_keyring.so
account    include      system-local-login
session    include      system-local-login
session    optional     pam_gnome_keyring.so        auto_start
```

2行追加しました。

```conf:/etc/pam.d/passwd
#%PAM-1.0
#password       required        pam_cracklib.so difok=2 minlen=8 dcredit=2 ocredit=2 retry=3
#password       required        pam_unix.so sha512 shadow use_authtok
password        required        pam_unix.so sha512 shadow nullok
password        optional        pam_gnome_keyring.so
```

こちらは一行追加です。

また、.xinitrcに以下を追加します

```shell-session:.xinitrc
eval $(/usr/bin/gnome-keyring-daemon --start --components=pkcs11,secrets,ssh)
export SSH_AUTH_SOCK
```

これで、起動時に自動でgnome-keyringが起動、また復号化されます（gnome keyringのパスワードとログインパスワードが同じ場合です。）

ここで、一度再起動します。
そうすると、起動時にgnome-keyringのパスワードを設定するよう求められるので設定します。
ここでログイン時と同じパスワードを設定すると、起動時に自動で復号化されるようになります（もう何回も言っているのでわかるとは思いますが。）

