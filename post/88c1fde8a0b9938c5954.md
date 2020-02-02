---
title: MonacoinでLightning Networkを使ってみた
tags: Blockchain LightningNetwork Monacoin Linux
author: onokatio
slide: false
---
![k.jpg](https://qiita-image-store.s3.amazonaws.com/0/154157/6cd93fc5-2a9f-f7c9-8227-81bfd688172b.jpeg)


どうも。
今回は、日本発祥の暗号通貨、モナコインでLightning Network(以下LN)を使い、知り合いとマイクロペイメントチャネルを開いて、手数料ゼロで送金してみたいと思います。


# LNってなに

LNとは、ブロックチェーン技術の一つです。
元々、マイクロペイメントチャネルというものを使い、2者間で送金手数料を無料にする仕組みがあります。
それをさらに複数人で稼働させ、メッシュネットワークのような送金チャネルを作り出し、多数の人間で、手数料を無料で送金し合える仕組みをLNと呼びます。手数料問題・遅延問題が話題になっているビットコインをスケールアウトする仕組みです。
詳しくはググって、どうぞ。

# monacoind または monacoin-qt のインストール

LNを実行するために、まずはフルノードが必要となります。
自分は以下のようにしてappimageを落としました。

```bash
$ wget https://github.com/monacoinproject/monacoin/releases/download/monacoin-0.14.2/monacoin-0.14.2-x86_64-linux-gnu.tar.gz
$ tar xvf monacoin-0.14.2-x86_64-linux-gnu.tar.gz
$ cd monacoin-0.14.2/bin
$ ls
monacoin-cli  monacoin-qt  monacoin-tx  monacoind
```

他のOSやアーキテクチャのダウンロードリンクは[公式ページ](https://monacoin.org/)にあります。
ここでフルノードを起動させます。monacoin-qt（GUI）を使用します。

# monacoind/monacoin-qtの設定
まず、設定ファイルを作ります。

```bash
$ mkdir ~/.monacoin
```

```ini:~/.monacoin/monacoin.conf
server=1
rpcuser=myuser
rpcpassword=12345678
txindex=1
zmqpubrawblock=tcp://127.0.0.1:30000
zmqpubrawtx=tcp://127.0.0.1:30000
```

ユーザー名とパスワードは適宜好きなものに変更してください。

# monacoind/monacoin-qtの起動

```bash
$ nohup ./monacoinqt &
```
起動したら、monacoin-qtの場合はデータディレクトリを聞かれるので、`~/.monacoin/monacoin.conf`(初期値)を設定してください。

これで、localhost:9402でJSON-RPCなAPIを使えるようになります。


# eclairのダウンロード

LNを扱うためのツールですが、有志がeclairのMonacoin版を作ってくれているので、それを使います。

```bash
$ wget https://github.com/monapu/eclair/releases/download/v0.2-alpha4-mona2/eclair-node-javafx_2.11-0.2-SNAPSHOT-mona2-8ee486c-capsule-fat.jar
```

最新版は https://github.com/monapu/eclair/releases から取得できます。javafxと接尾語があるものがGUI版、無いものがCUIとのことです。今回はGUIを使います。

# eclairの設定ファイル

```bash
$ mkdir ~/.eclair
```

```ini:~/.eclair/eclair.conf
eclair {
  bitcoind {
    rpcuser = "myuser"
    rpcpassword = "12345678"
    rpcport = 9402
    zmq = "tcp://127.0.0.1:30000"
  }
  server {
    port = 9735
  }
  api {
    binding-ip = "127.0.0.1"
    port = 8087
  }
  node-alias = "mynode1"
  node-color = "FF0040"
}
```

ユーザー名とパスワードはさきほど設定したものに変えてください。
また、node-aliasは、ネットワーク上での自分の名前として扱われるので、好きにハンドルネームなどをきめてください。

# ポート開放/転送

パソコンのファイアウォールの設定から、9735/tcpを開放し、またルーターの設定で9735番をグローバルから自身のマシンにポート転送するようにしてください。

# eclairを起動

```bash
$ java -jar ./eclair…(省略)capsule-fat.jar &
```

# 触ってみる

まず、monacoin-qtにいくらか（0.1Mona程度）送金しましょう。
次に、eclairの左上の、「Chennels」→「Open Channel ...」より、ペイメントチャネルをひらきたい相手の「Node URI」を入力します。

例えば私の場合は「`037786877800ae5e640cc427b7a3d5dc232994d3a9ecd3480755b10c5ead937089@159.28.150.236:9735
`」になります。
また、http://lnmona.ml/ を運営している方のNode URLは「`03aafadba1c7608a52b8defcb880e52c76d06eb36b6cb740ef94649b2a5277701e@lnmona.ml:9735`」になります。

このNode URIで相手に接続できます。

次に、Capacityに、ペイメントチャネルにデポジットしたいMonaを、Push Amountに最初に送金したいMonaを入力しましょう。自分の場合は両方1milliMona(0.001Mona)にしました。

# Node URI の作り方。

eclairの左下にPubkey（英数字の羅列）があるのでそれをコピーします。
そのうしろに`@`、さらに自分のグローバルIPアドレス、そして`:`の後にポート番号を指定します。

たとえば、さっき載せた私のpubkeyは`037786877800ae5e640cc427b7a3d5dc232994d3a9ecd3480755b10c5ead937089`、IPアドレスは`159.28.150.236`、ポート番号は9735です。

# チャネルの中で送金してみる

実験中。

# 最後に

ライトニングネットワークを使えば、Opening transactionとclosing transactionの手数料だけで、あとは無制限に、自分とチャネルを開いていない人でも無料の送金ができます。
※ただ、中間に居る人は自身を介するときに手数料を設定できます。
たとえば、取引所間に一つライトニングネットワークができれば、一瞬で手数料なしで取引所間を移動できますし、投げ銭をするときも、その人とネットワークのどこかで繋がっていれば手数料は無料になります。
ぜひ使ってみてください！

ちなみに、以下は冒頭に貼った画像です。2018/01/21 午後18時ごろのモナコインのライトニングネットワークの様子を表示しています。

![k.jpg](https://qiita-image-store.s3.amazonaws.com/0/154157/6cd93fc5-2a9f-f7c9-8227-81bfd688172b.jpeg)

### 参考

https://qiita.com/Nxtima1/items/d68f75202fc4f633c9ec
https://github.com/monapu/eclair/blob/master/README.mona.md
https://askmona.org/4955

### 追記

12/25時点での最新のネットワーク（上から少し変化しました）

![k.png](https://qiita-image-store.s3.amazonaws.com/0/154157/ebbaa875-7cde-8fc1-b405-ab004429e358.png)

