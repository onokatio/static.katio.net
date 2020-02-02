---
title: LinuxでVPN Gate（闇の力）をもっと簡単に使おう
tags: Linux vpngate ssl-vpn VPN ShellScript
author: onokatio
slide: false
---
以前の記事 [VPN Gate(VPN over https)とかいう闇の力でVPNを使おう on Linux](https://qiita.com/onokatio/items/aa656c23e24d721eed31) でVPN GateにLinuxから接続する方法を書きましたが、それさえもめんどくさいので自動化するためにsystemd serviceとシェルスクリプトを書きました。

# 事前にやること

事前に、[VPN Gate(VPN over https)とかいう闇の力でVPNを使おう on Linux](https://qiita.com/onokatio/items/aa656c23e24d721eed31)の「ソースコードのダウンロード」と「ビルド」に従ってvpn clientのインストールを済ませておいてください。

# ダウンロード

https://github.com/onokatio/vpngate-utils

git cloneなりzipダウンロードなりで任意の場所にダウンロードしてください。

# 使い方

README.mdにも書いていますが、以下の手順を追ってください。

### systemd用のserviceファイルをコピーしてリロードしてください。

```bash
$ sudo cp ./vpngate-client.service /etc/systemd/system/vpngate-client.service
$ sudo systemctl daemon-reload
```

### VPN Gate Clientのサービスを起動してください。

```bash
$ sudo systemctl start vpngate-client.service
$ sudo systemctl enable vpngate-client.service
```

### 最後に、設定用のシェルスクを実行し、パスワードを入力してください。

```bash
$ sudo ./setup-client.sh -s vpngate-server.com:443 -b VPN -u user1

パスワード : ********
確認入力　 : ********
```

このシェルスクの使い方は以下のようになっています。

```bash:help
Usage: setup-client.sh [-h] [-s <server:port>] [-b <HUB>] [-u <USERNAME>] [-f]

  -h                このヘルプを表示
  -s <server:port>  VPNサーバーのアドレスとポートを指定
  -b <hub>          VPNのハブの名前を指定（大体の場合は'VPN'）
  -u <username>     VPNのユーザー名
  -f                既にVPNの設定があっても、それを削除して強制的に再登録する。
```

これで完了です。

