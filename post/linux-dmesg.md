---
title: dmesg, syslog, journalについて調べてみた
date: 2019-10-03 20:20:45 +0900
---

dmesg, syslog, journalについて調べてみた
===

Linuxマシンをラップトップに入れて使っていると、様々な場面でログを見る機会が訪れると思います。
ふとログを見ているときに、dmesgとjournalって何が違うんだろうなー、と疑問に思い調べたので、備忘録として残しておこうと思います。

# dmesg について

https://ja.wikipedia.org/wiki/Dmesg

dmesgは、カーネルが持っているメッセージバッファです。カーネル内で起こるドライバやカーネルモジュールなどが`printk()`を使用した際にここに出力されます。

# syslog について

https://ja.wikipedia.org/wiki/Syslog

syslogはLinux内の各プロセスや様々な場所からログを受け取り、分類し、`/var/log/message`やその他`/var/log/hoge`に保管する役割を持ちます。
Linuxの場合`rsyslog`という実装が有名です。
また、プロセスからのログだけではなくシステムのログ、つまりdmesgコマンドの結果、もっというと`/dev/kmsg`、カーネルのメッセージバッファもリアルタイムで受け取り、分類し、ファイルに保管しています。

sendmailやcronなど、システムで動く様々なプロセス（主にinit.dで起動されるような）は、標準出力を使うためのttyが割り当てられないため、syslogを利用しています。

(内部的な話) プロセスから、`/dev/log`へファイル書き込みをすることで、syslogにログを送信できます。syslogは`/dev/log`を作成し、様々なプロセスからのログを収集します。 `/dev/log`は標準的なログ管理用の特殊ファイルとのことです。

# journal について

syslogとinitの時代は今まで説明した構成で何も問題はありませんでした。initは各サービスを起動し、サービスや揮発性のあるカーネルのログはsyslogが受信しファイルに保管してくれていました。

ただ、その後systemdが誕生しました。systemdはUnitファイルにより任意のコマンド（=サービス）を実行します。また、systemdのコンポーネントの1つとしてsystemd journaldが開発されました。
systemd journaldが何をしているか解説していきます。

## journaldの動作

journaldはログを収集する仕組みです、syslogをほとんど置き換える役割を持っています。
journaldは、以下のログを収集します。

- カーネルメッセージ `/dev/kmsg`
- systemdのUnitファイルにより起動されたプロセスの、標準出力、標準エラー出力
- `/dev/log`に送られてきたログ
- その他、journaldに直接送られてきたログ

そうです。journaldはsyslogの代わりに/dev/logを提供するようになりました。
そして、journaldは`/var/run/log/journal/hoge`か、もしくは`/var/log/journal/hoge`にログを書き出します。前者は揮発、後者が永続保管です。後者のディレクトリがあれば後者を、なければデフォルトで前者を使うようになっています。

```
$ ls /dev/log -l
lrwxrwxrwx 1 root root 28 Oct  3 18:52 /dev/log -> /run/systemd/journal/dev-log
```

journaldを導入した環境では、こんな感じに`/run/systemd/journal`以下のUnixドメインソケットファイルにリンクされてますね。

## syslogとの連携

journaldに移行したあとも、様々な理由でsyslogが作るログファイルを使いたい場合があります。
その場合は共存が可能です。
journaldに`/dev/log`を奪われたsyslogは、しぶしぶ`/var/log/journal/syslog`ファイルを作成、listenし、journaldにそこへログを書き込むように頼みます。(具体的には.so形式でjournaldに介入しているようですが。)

そのため、journaldが収集するログのすべての複製をsyslogが従来どおり受け取り、syslogは`/var/log/message`など従来のパスへログを保管するようになります。

## journalctl

journalctlはjournaldが`/var/log/journal`や`/var/run/log/journal`に保管したログをコマンドラインから確認するツールです。

よく使いそうなオプション

- `-e` ログの最後を表示する
- `-f` ログをリアルタイムで更新する
- `-k` カーネルのメッセージバッファ(dmesgで出てくるもの)だけ表示する
- `-u hoge.service` 特定のUnitのログだけ表示する
