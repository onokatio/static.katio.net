---
title: Dockerのデータ永続化関連について
tags: Docker volume
author: onokatio
slide: false
---
どうも、かちおです。Dockerのデータ永続化について色々とややこしかったのでまとめました。

# データ永続化とは

Dockerは、Dockerイメージと呼ばれるアプリケーションのバイナリがはいったデータを元にコンテナと呼ばれる小型の隔離マシンを立ち上げます。そしてそのコンテナのライフサイクルが簡単に作成・破棄できるように考えられているのですが、サーバーを立ち上げている途中で変化したデータは残しておきたいため、コンテナの特定のデータだけを「永続化」することができます。

# 方法

1. ボリューム(ホストと同期)
2. ボリューム(隔離した保存領域)
3. 他のコンテナをマウント

# 1.ボリューム(ホストと同期)

これは、ホストマシンの特定のディレクトリと、コンテナの中の特定のディレクトリとリアルタイムで同期するものです。コンテナが破棄されてもホストのディレクトリの内容は残るので、また新しく立てたコンテナと同期することができます。また、ディレクトリではなく単一のファイルを指定することもできます。
また、セキュリティのためリードオンリー(コンテナ側からは変更不可)を指定することもできます。

## 使い方

```bash
$ docker run -v /host/path:/container/path image-name
# ホストの/host/pathとコンテナ内の/container/pathを同期してimage-nameを起動

$ docker run -v /host/path:/container/path:ro image-name
# ホストの/host/pathとコンテナ内の/container/pathをリードオンリーで同期してimage-nameを起動。コンテナ側からはファイルの変更ができない。
```

>例:
>
```bash
$ docker run -v ./public:/usr/share/nginx/html:ro nginx
```
この場合、dockerコマンドを打ち込んだディレクトリ内のpublic/とコンテナ内の/usr/share/nginx/html/が同期されます。ホスト側でファイルに変更を加えると同時にコンテナ内にも反映されます。コンテナ側の変更は無視されます。

# 2. ボリューム(隔離した保存領域)

さきほどのものは、あくまでホストの内容を同期orコピーしたい場合のものでした。そうではなく、ただコンテナの特定のディレクトリを残しておきたいときに使うのがこれです。
手順としては、保存領域のの作成→コンテナに領域を追加しつつ起動となります。

## 保存領域の作成

```bash
$ docker volume create volume-name
# volume-nameという名前で保存領域を作成します。
```

> 例
>
```bash
$ docker volume create database-data
```
この場合、database-dataという名前で隔離領域が作られます。

## コンテナに保存領域を追加しつつ起動

```bash
$ docker run -v volume-data:/container/path image
# コンテナ内の/container/pathディレクトリがvolume-dataと同期される用になります。

$ docker run -v volume-data:/container/path:ro image
# コンテナ内の/container/pathディレクトリがリードオンリーでvolume-dataに保管される用になります。
```

>例
>
```bash
$ docker run -v database-data:/var/lib/mysql mysql
```
この場合、mysqlのコンテナの中の/var//lib/mysqlがdatabase-dataという保存領域と同期されます。コンテナを破棄しても、ふたたび生成するときに同じ用に起動すればmysqlのデータが復活します。


以上が隔離した保存領域です。はっきり言えば、1のホストと同期する場合の、同期するパス指定しなくていいイメージです。というか内部的にはそうなっています。ホストの任意のディレクトリと同期しなくていい場合は1よりもこちらのほうが簡単で便利というわけですね。

追記: __今更ですが、ボリュームを作成しなくても使えるみたいです。__

# 3.他のコンテナをマウント(データボリュームコンテナ)

以上は、特定のコンテナの任意のパスを永続化するものでした。ですが、同じボリュームを共有するコンテナを起動するたびに毎回指定するのは面倒です。ということで、データボリュームコンテナというのを作ることができます。
1つ、適当なコンテナを起動し、そこのボリュームを他のコンテナからオプション1つで同じようにマウントできます。

```bash
$ docker -v /path/to/directory:/path/to/directory --name data-volume image /bin/true
# これで、data-volumeという名前で、ホストとコンテナ内を同期するコンテナを起動できます。

$ docker --volumes-from data-volume image
# これで、data-volumeがマウントしているボリュームを同じようにマウントします。つまり`v /path/to/directory:/path/to/directory`を指定したことになります。
```

これが使えると、一個データボリュームコンテナを作ってそこに任意のボリュームをどんどんマウントしていけば、data-fromオプションをつけるだけで全く同じマウントをしたコンテナを作ることができます。

# ちなみに : sshfというのが

```bash
$ docker volume create --driver vieux/sshfs -o sshcmd=user@host.com:/path/to/directory -o password=password sshvolume
```

とかやると、ssh接続できる別のマシンの任意のディレクトリをつかってボリュームを作成できます。

