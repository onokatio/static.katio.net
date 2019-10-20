Amazon Dash Buttonでインターホンを作る
===

どうも。Amazon Dash Buttonを以前知人からもらったのにもかかわらず、まったく活用していなかったため、おもちゃにしようと思います。

# 今回作るもの

Amazon Dash Buttonが押されたら、Archlinuxパソコンに通知が飛ぶようにするやつ

# 作り方
事前に、Dash Buttonはwifiネットワークの設定を済ませた前提とします。

これを使います

https://github.com/Nekmo/amazon-dash

## インストール
```bash
$ sudo pip3 install amazon-dash  # and after:
$ sudo python3 -m amazon_dash.install
```

## お手元のdash buttonのmacアドレスを見つける

```bash
$ sudo amazon-dash discovery
```

dash buttonはarpか何かでブロードキャストしてるみたいです。
このコマンドを実行した状態でdash buttonを押すとmacアドレスが出ます。控えてください。

## 設定

`/etc/amazon-dash.yml`というファイルを以下のように作成or編集します。

```yaml=
# amazon-dash.yml
# ---------------
settings:
  # On seconds. Minimum time that must pass between pulsations.
  delay: 10
devices:
  ## Example of how to execute a system command
  fc:65:de:2c:fa:0d:
    name: Dash button  # You can put the name you want
    user: katio  # System user. Necessary if it is executed as root
    cmd: notify-send "Dash button pressed. ($(date))"  # Command to execute

```

## Unitファイルを作る


`/etc/systemd/system/amazon-dash.service`というファイルを以下のように作成します。

```
[Unit]
Description=Amazon Dash service
After=network-online.target
Wants=network-online.target

[Service]
User=root
ExecStart=/usr/bin/env amazon-dash run --config /etc/amazon-dash.yml
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

で、起動&自動起動

```
$ sudo systemctl daemon-reload
$ sudo systemctl start amazon-das
$ sudo systemctl enable amazon-das
```

以上！
