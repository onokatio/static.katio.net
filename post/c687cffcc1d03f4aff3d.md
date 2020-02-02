---
title: AzureをAnsibleから弄ってみる
tags: Linux Azure Ansible
author: onokatio
slide: false
---
どうも。
AnsibleでVMの構成管理をしたいことってありますよね。
ただ、公式ドキュメントが散らばっていてわかりにくいので、自分なりにまとめてみました。

## Azure cliツールを導入する

brewとかで入ります。環境により方法が違うので割愛。

## Azure cliから自分のアカウントにログインする

```bash
$ az login
```

すると、デフォルトブラウザでログイン画面が開きます。ログインが終わると、ブラウザでコードの入力を求められるので、az loginした後に表示されているコードを入力します。

## サービスプリシンパルの作成

いわゆるアプリケーション登録らしいです。

```bash
$ az ad sp create-for-rbac --query [appId,password,tenant]

[
    "aaaaa-aaaaa-aaaaaa",
    "bbbbb-bbbbb-bbbbbb",
    "ccccc-ccccc-cccccc"
]
```

実行すると、キーが３つ入ったjsonが帰ってきます。
上から順に、アプリケーションID、アプリケーションパスワード、テナント、らしいです。

TwittterのOAuthでいうアプリケーションキーとアプリケーションシークレットみたいな感じですかね。

また、自分のサブスクリプションIDも必要らしいので、取得します。

```bash
$ az account show --query [id] --output tsv

ddddd-ddddd-ddddd
```

## 認証情報の追加

`~/.azure/credentials`というファイルを作り編集します。
サブスクリプションIDには先程取得したもの、クライアントIDからテナントまでは、先程のjsonの順番のとおりで大丈夫です。

```ini
[default]
subscription_id=ddddd-ddddd-ddddd
client_id=aaaaa-aaaaa-aaaaaa
secret=bbbbb-bbbbb-bbbbbb
tenant=ccccc-ccccc-cccccc
```

# cli（コマンドライン）から試す

## 場所を選ぶ。

```bash
$ az account list-locations | grep -B1 -A6 Japan
```

をすると、データセンターの場所が選べる。日本は西日本か東日本の２つしか無い。
今回は`japaneast`を選ぶ。

## リソースグループを選ぶ

```bash
$ az group list
```

をすると、今どんなリソースグループがあるか確認できる。
以下で新しく作成もできる。

```bash
$ az group create --name test-by-ansible --location japaneast
```

## サーバーのサイズを選ぶ

```bash
$ az vm list-sizes --location japaneast
```

を実行すると、japaneastで使えるVMの種類リストが出てきます。
たとえば`Standard_B1ms`は、1CPU、メモリ2G、SSDが4GBのプランになっています。

## ネットワークを選ぶ

```
$ az network vnet list
```

みたいに実行すると、今Azureにある仮想ネットワークが表示される。
仮想ネットワークは、単純にVM同士をつなげたりするのに使う。
以下のようにして、新しく作ることもできる。

```bash
$ az network vnet create --name test-network --resource-group test-by-ansible
```

## OSを選ぶ

```bash
$ az vm image list
```

を実行すると、UbuntuやらCentOSやら色々出てくる。
今回はUbuntu 16.04 LTSを選んだ。
`offer`, `sku`, `publisher`, `version`を覚えておく。


## VMを作成する

```bash
$ az vm create --name test-vm --resource-group test-by-ansible --image UbuntuLTS --size Standard_B1ms --vnet-name test-network --admin-username onokatio  --ssh-key-value ~/.ssh/azure.pub
```

みたいに実行する。

# 実際にAnsibleのplaybookで動かしてみる

## ライブラリなどのインストール

```
$ sudo pip install ansible
$ sudo pip install ansible[azure]
```

自分はpyenvを常用しているが、どうやらansibleはライブラリを読み込むのはデフォルトのパス（`/usr/lin/python2.7`）らしいので、一旦`pyenv global system`した。本当はvirtualenvとか使ったほうがいいのかもしれない。

## playbookの作成

# 参考

- https://docs.microsoft.com/ja-jp/azure/virtual-machines/linux/ansible-install-configure#create-azure-credentials
- http://otiai10.hatenablog.com/entry/2017/12/17/185605
- https://docs.ansible.com/ansible/latest/guide_azure.html

