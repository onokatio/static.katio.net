---
title: n0stackを構築する
tags: n0stack
author: onokatio
slide: false
---
OpenStackは少し大規模すぎるので、n0stackをビルドして使ってみようと思います

# n0stackとは？

- ICTSCの運営学生が作ったVMオーケストレーションツール、らしい
- 実装はgoで、内部でqemuでKVMを使用している
- 基本的には、VMやネットワークの定義をyamlとして書き、それを読み込ませる

# コンポーネント

### n0proto

n0stackのProtobuf定義

### n0bff

わからんかった

### n0core

n0stackのサーバー実装

### n0cli

n0stackのコマンドラインツール


どうやら、n0protoでgrpc通信の定義を決めて、n0cliからn0coreを操作するらしい。

# ビルド

```
$ make all
```

これで、`bin/`以下に`n0cli` `n0core` `n0bff`が生成される。

# n0stackの実行

```
$ docker-compose up -d api
$ bin/n0core serve agent --location 0/0/0/0/0 --advertise-address 192.168.1.5 --node-api-endpoint 192.168.1.5:20180
```

ipアドレスは自分のマシンのものに読み替えてください。


# ためしてみる

以下の内容のyamlを作ります。

```
FetchISO:
  type: BlockStorage
  action: FetchBlockStorage
  args:
    name: cloudimage-ubuntu-1804
    annotations:
      n0core/provisioning/block_storage/request_node_name: vm-host1
    request_bytes: 1073741824 # 1GiB
    limit_bytes: 10737418240 # 10GiB
    source_url: https://cloud-images.ubuntu.com/bionic/current/bionic-server-cloudimg-amd64.img

ApplyImage:
  type: Image
  action: ApplyImage
  args:
    name: cloudimage-ubuntu

RegisterBlockStorage:
  type: Image
  action: RegisterBlockStorage
  args:
    image_name: cloudimage-ubuntu
    block_storage_name: cloudimage-ubuntu-1804
    tags:
      - latest
      - "18.04"
  depends_on:
    - ApplyImage

GenerateBlockStorage:
  type: Image
  action: GenerateBlockStorage
  args:
    image_name: cloudimage-ubuntu
    tag: "18.04"
    block_storage_name: test-blockstorage
    annotations:
      n0core/provisioning/block_storage/request_node_name: vm-host1
    request_bytes: 1073741824
    limit_bytes: 10737418240

ApplyNetwork:
  type: Network
  action: ApplyNetwork
  args:
    name: test-network
    ipv4_cidr: 192.168.200.0/24
    annotations:
      n0core/provisioning/virtual_machine/vlan_id: "100"

CreateVirtualMachine:
  type: VirtualMachine
  action: CreateVirtualMachine
  args:
    name: test-vm
    annotations:
      n0core/provisioning/virtual_machine/request_node_name: vm-host1
    request_cpu_milli_core: 10
    limit_cpu_milli_core: 1000
    request_memory_bytes: 536870912
    limit_memory_bytes: 536870912
    block_storage_names:
      - test-blockstorage
    nics:
      - network_name: test-network
        ipv4_address: 192.168.200.1
    uuid: 056d2ccd-0c4c-44dc-a2c8-39a9d394b51f
    # cloud-config related options:
    login_username: n0user
    ssh_authorized_keys:
      - ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBITowPn2Ol1eCvXN5XV+Lb6jfXzgDbXyEdtayadDUJtFrcN2m2mjC1B20VBAoJcZtSYkmjrllS06Q26Te5sTYvE= testkey
  depends_on:
    - GenerateBlockStorage
    - ApplyNetwork
```

vm-host1を、自分のマシンのホストネームに置き換えてください。また、ssh公開鍵も自分のものを登録します。

最後に、`ssh n0user@192.168.200.1 -i ~/.ssh/hoge.pub`でログインできれば成功です。

