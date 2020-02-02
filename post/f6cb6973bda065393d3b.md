---
title: 高専生が無料で使えるLAMP Webサーバー KosenSpaceでsshfsを使ってみた
tags: Linux lamp KosenSpace
author: onokatio
slide: false
---
どうも。
最近、Kosen Spaceというサービスを見つけました。
高専生に対して、無償でLAMP(LEMP)環境を貸してくれるサービスです。

https://kosen.space/

>Kosen Spaceとは
Kosen Spaceは、現役高専生にLEMP（Linux、nginx、MySQL、PHP）が動作する環境を無償で提供するプロジェクトです。
社会人にとっては、そこまで大きな負担とは捉えられにくい、サーバ代。ですが、経済基盤がまだ整っていない、学生にとっては 大きな負担となる物です。
本プロジェクトでは、そんな現役高専生の手助けを行うため、学生に対し無償で場所を提供します。

どうせ無料なら遊んだろ、と思い登録してきました。
サーバーへの接続方法はsshです。シェルアクセスは禁止されていますが、ファイルをSFTP(SSH file transport)で送信できます。まあ、scpみたいなもんです。

※sftpとftpsは別物です。ftpsはftp over ssl、こちらはfile over sshです。

ただ、手動でファイル更新はクソめんどくさいです。古き良きFTP更新時代を生き抜いた方ならおわかりだと思います。

ということで、手元のマシンでSFTP環境を仮想的にマウントできるsshfsを便利に使ってみましょう！

# sshfsとは

sshfsとは、fuseの一種で、あたかもsftp先のサーバーを自分のマシンのディレクトリとしてマウントできるものです。手元のマシンでそこに新しくファイルを作成すると、sftp先にも同じファイルが転送されます。まあ自動ミラーリングみたいなものです。

# インストール

Archなので以下でした

```
$ sudo pacman -S sshfs
```

# マウント

どうやらsftp先はホームディレクトリのchroot監獄になっているようなので、素直に`/`を指定しましょう。

```
$ mkdir ~/kosenspace
$ sshfs hoge@kosen.space:/ ~/kosenspace -o IdentityFile=~/.ssh/fuga
```

はい、これだけで完了です。
ただ、パーミッションが何故かrootのみになっていたり色々と怪しいので、後述の自動マウントを使います。

# 自動マウント

`/etc/fstab`に追記するだけでいいようです。

```
hoge@kosen.space:/  /home/hoge/kosenspace  fuse.sshfs noauto,x-systemd.automount,_netdev,user,idmap=user,follow_symlinks,identityfile=/home/hoge/.ssh/huga,allow_other,default_permissions,uid=1000,gid=998 0 0
```

最後のUIDとGIDは`id`コマンドで確認できます。
これで、起動時に自動でマウントがされるようになりました。


# さいごに

学生が色々遊ぶためのサーバー、提供されることがないので結構面白いと思います！
ぜひ高専生は使ってみましょう！！

（あ、ステマじゃないです、この記事はマジで個人的に書きました

