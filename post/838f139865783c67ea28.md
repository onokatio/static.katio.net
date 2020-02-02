---
title: CISCO Wireless Networkにログインするのがめんどいのでシェルで解決
tags: Cisco curl シェル芸 Linux
author: onokatio
slide: false
---
学校の学内ネットワークに毎回ログインするのがとても面倒なので以下のように.zshrcに設定した。

```bash:.zshrc
alias login='curl -Ss --ciphers AES256-SHA --data "buttonClicked=4&username=<USERNAME>&password=<PASSWORD>&Submit=Submit" <LOGIN URL>'
```

使うときは`<USERNAME>`と`<PASSWORD>`と`<LOGIN URL>`は適宜変更して。

JSを読んだら案外簡単に実装できたのでカキコ。


また、以下と組み合わせると自動ログインが実装できる。

[NetowrkManagerで特定のWiFiに繋がったタイミングで自動でコマンドを実行させる
](https://qiita.com/onokatio/items/d9297e567e9cc75586ed)

