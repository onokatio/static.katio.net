---
title: Docker Swarmを構築して、docker-compose.ymlを読み込ませてみる
tags: Docker
author: onokatio
slide: false
---
# Docker Composeって？

Docker Composeは、複数のコンテナを立ち上げるときのネットワーク、依存関係、環境変数などを、yamlファイルに記述して、コマンド一つで起動できるツールです。
Docker runするときの引数をgitで管理できるようになります。

例として、公式ドキュメントにあるredisのdocker-compose.ymlが以下になります。

```yaml:docker-compose.yml
version: '3'
services:
  web:
    build: .
    ports:
     - "5000:5000"
    volumes:
     - .:/code
  redis:
    image: "redis:alpine"
```

この例では、ymlが置いてあるのと同じディレクトリにある`Dockerfile`をビルドし、webという名前をつけてコンテナを起動します。
ポートはホストの5000/tcpと接続され、カレントディレクトリにあるファイルはすべてコンテナの/codeと動悸されるようになります。

また、`redis:alpine`イメージを使ってredisのコンテナも起動させています。

# Docker Swarmって？

Docker Swarmは、k8sやrancherなどと同じ、複数のマシン間でDockerコンテナをいい感じに管理してくれるツールです。Openstackは仮想マシンを扱いますが、簡単に言えばそのコンテナ版です。

複数の物理マシン（もちろん仮想マシンでも可）に、Swarmのノードを起動させると、どれか一つのマシンが親となって、他のノードにコンテナの起動を割り振ります。

また、Swarmノードが死んでそこで動いてるコンテナと疎通できなくなった場合、他の生きてるノードで同じコンテナをデプロイする機能なども備えています。

# 今回やりたいこと

- Docker Swarmクラスタを構築する
- docker-compose.ymlをswarmに読み込ませて、docker-compose.yml内のサービスを別々のマシンで動くようにする

# Docker Swarmクラスタの構築

DockerのSwarm Modeで起動させます。

何らかの方法で、sshアクセスやコンソールアクセスできるLinuxマシンを3台ほど用意します。
また、事前に最新バージョンのDockerをインストールしておいてください。

そして、そのうち一つをマネージャノードにします。
残りの２つはワーカーノードにします。
名前の通り、前者が管理ノード、後者が実際にコンテナが起動するノードです。

## マネージャノードの作成

マネージャノードにさせたいマシンで以下を実行します。

```shell
$ docker swarm init --listen-addr=0.0.0.0:2377
```

マシンに複数のIPアドレスがある場合（NICが複数ある場合）に、`--advertise-addr 192.168.1.10:2377`などが必要になります。そのマシンに割り当てられているIPアドレスを指定してください。

## ワーカノードの作成

`docker swarm init`したときに、`docker swarm join --token SWMTKN-hoge 192.168.x.x`のようにコマンドが表示されます。
そのコマンドを、そのままワーカノードにしたいマシンで実行してください。自動でマネージャノードに接続しにいきます。

以上でDocker Swarmの構築は完了です。

この状態で`docker info`を実行すると、以下のように表示されます。

```
Swarm: active                                                                                                                                                                                                        
 NodeID: jltk9n4dj0hujknbpgxibcr5u                                                                                                                                                                                   
 Is Manager: true
 ClusterID: p1dekrd6ip80zuauc9s75fb5f
 Managers: 1
 Nodes: 3
 Orchestration:
  Task History Retention Limit: 5
 Raft:
  Snapshot Interval: 10000
  Number of Old Snapshots to Retain: 0
  Heartbeat Tick: 1
  Election Tick: 10
 Dispatcher:
  Heartbeat Period: 5 seconds
 CA Configuration:
  Expiry Duration: 3 months
  Force Rotate: 0
 Autolock Managers: false
 Root Rotation In Progress: false
 Node Address: 192.168.1.3
 Manager Addresses:
  192.168.1.3:2377
```

# Docker-compose.ymlを読み込ませる

docker swarm modeにdocker composeのファイルを読み込ませるには、docker stackコマンドを使います。

```shell
$ docker stack deploy myapp -c docker-compose.yml
```

docker overrideなどを使って複数docker-compose.ymlを指定したい場合、-cオプションを複数回使えます。


そして、各サービス（コンテナ）が立ち上げっているか確認しましょう。

```shell
$ docker stack services myapp
ID                  NAME                    MODE                REPLICAS            IMAGE                PORTS
…
```

ここでREPLICASが1/1になっていれば成功です。

# 動いてるかどうか試してみる

マネージャノードに割り当てられているIPアドレスに対して、リクエストを送ります
※マネージャノードの中から127.0.0.1向けにアクセスしても反応しないので注意

```
$ curl 192.168.1.3
```

