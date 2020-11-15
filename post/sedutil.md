自己暗号化ドライブでS3スリープをする
===

世の中には、自己暗号化ドライブというものがあります。

- https://wiki.archlinux.jp/index.php/%E8%87%AA%E5%B7%B1%E6%9A%97%E5%8F%B7%E5%8C%96%E3%83%89%E3%83%A9%E3%82%A4%E3%83%96
- https://scrapbox.io/onokatio/%E8%87%AA%E5%B7%B1%E6%9A%97%E5%8F%B7%E5%8C%96%E3%83%89%E3%83%A9%E3%82%A4%E3%83%96

読んで字のごとく、HDDやSSDに組み込まれているハードウェア暗号化機能です。透過暗号化が可能で、暗号化がボトルネックになり速度低下することがありません（初期設定ですでに暗号化されているから）。

現在主流なのは、SSDに自己暗号化ドライブ規格であるOPAL 2.0です。ある程度ハイエンドなSSDなら付属しています。自分はSamsungのNVME SSDである970 EVO Plusを購入しました。

## 自己暗号化ドライブの設定

Archwikiに既にあるので割愛します。

## S3 スリープの対応

OPALでは一度復号(認証)できたSSDは電源が切れるまでずっと復号化されたままです。なので、ソフトウェアリブートを行っても改めてパスワードの入力が不要になっています。

CPUには状態が複数ありますが、その中でもS3がCPUの一部とメモリだけに電流を流し、割り込みをしない外部機器を電源断する状態です。
そのため、OPALが有効になった状態で`systemctl suspend`等を実行するとカーネルパニックや強制終了が起こります。

これを解決するためには、スリープ直前にカーネルが復号用のパスワードをメモリに覚えておき、スリープ解除時にデバイスIOが走る前に自動復号化を行う必要があります。それをするのが https://github.com/badicsalex/sedutil/ というフォークです。
このフォークは、本家のsedutilにS3対応機能を付け足したもので、ビルドして違う名前`sedutil-sleepなど`でパスに入れておけば使えます。
これを使ったS3スリープの方法は以下です。

https://github.com/Drive-Trust-Alliance/sedutil/issues/90#issuecomment-614319458

まあ英語読みにくいので、改めて説明します。

使い方は簡単で、スリープ前に`./sedutil-sleep --prepareForS3Sleep 0 YOUR_PASSWORD /dev/nvme0n1`か`sedutil-sleep -n -x --prepareForS3Sleep 0 <HASHED_PASSWORD> /dev/nvme0n1`を実行すればスリープ解除時に復号化ができます。セキュリティ上の理由からHASHED_PASSWORDを使うことを推奨します。ま、このコマンドが保存されているディスク自体が暗号化されているのであんまり心配することはないです。

パスワードをハッシュ化する方法は以下です。

`sedutil-cli --printPasswordHash <password> <device>`

これで<HASHED_PASSWORD>が取得できます。

最後に、これをスリープ時に自動化するためsystemdのユニットファイルを書きましょう。

```
[Unit]
Description=Sedutil

[Service]
Type=oneshot
ExecStart=-+/usr/bin/sedutil-sleep -n -x --prepareForS3Sleep 0 <HASHED_PASSWORD> /dev/nvme0n1

RemainAfterExit=true

[Install]
WantedBy=multi-user.target
```

あとは起動すれば完了です。

```
sudo systemctl daemon-reload
sudo systemctl start sedutil
sudo systemctl enable sedutil
```
