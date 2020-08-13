---
title: "ansible/helmでのk8s アプリケーション管理"
date: 2019-12-12 00:12:00 +0900
---

ansible/helmでのk8sアプリケーション管理
===

この記事は、[onokatio Advent Calendar 2019](/adventcalendar/2019/onokatio) 11日目の記事です。

インフラ系の方は、自宅にKubernetesクラスタなどを構築されていると思います。自分は、個人的に利用したいOSSなWebアプリケーションをデプロイしたりする場として利用していますが、アプリケーションをいい感じに管理したいと思い今回の管理方法を取っています。

# helmとは

helmは、k8sで単体のアプリケーションをデプロイするツールです。めちゃめちゃ誤解を生みそうな言い方で簡単に言うと、「特定のアプリケーションを動作させるためのyamlを全部applyしてくれる奴」です。  
helmは、インストールコマンドを実行すると、そのアプリケーションの実行に必要なDeployment,Service,Secret等のyamlファイルをダウンロードしてkubectl applyしてくれます。言うなれば、k8s時代のパッケージマネージャです。

# ansibleとは

ansibleは、いわゆる「冪等」や「宣言型」と呼ばれる構成管理ツールです。「このファイルはここにあるべき」「このコマンドはインストールされているべき」といった、動作ではなく状態を定義してあげることでインフラの自動化が行なえます。冪だけに「べき」です。冗談です。

# 今まで辛かったこと

dockerが誕生し、アプリケーションの動作環境をイメージとして固めることができるようになりました。ただ、人類には「コンテナの死活やスケールを管理する」「dockerコンテナ間の依存関係やDockerfileの管理」といった仕事が生まれました。

docker composeが誕生し、コンテナ間の依存関係の解決、コマンドのオプションではなく設定ファイルによるコンテナのデプロイが行えるようになりました。ただ、未だ人類には複数のノードをまたいだスケールや死活監視をする必要がありました。

docker swarmが誕生し、人々はマルチクラスタ構成でdocker composeを利用できるようになりました。スケールも可能になりました。それでもまだ、人類にはロードバランシングの問題や、死活監視、ボリュームの管理をする必要がありました。

Kubernetesが誕生し、人類はコンテナを組み合わせた単体のサービスであるpodの概念、podを組み合わせたdeploymentsの概念、serviceによるロードバランシングやポート、IPの割当、オートスケール、死活監視、ダッシュボードを手に入れました。しかしまだ、人々にはDocker imageを元にdeployments.yamlを手作業で作り、手作業でapplyする必要があったのです…。

そこでhelmが誕生しました。

# 今回やったこと

helmを使い、自分でyamlを持たずにアプリケーションをデプロイします。また、デプロイする際のオプションや名前、namespaceなどを設定するため、ansibleのplaybookを描きました。

# やっていき

## helm
とりあえずk8sにhelmを入れます。


```shell
$ brew install helm # linuxbrew or homebrew
```

で、ローカルにhelmが入ったらk8sクラスタにもインストールします。

```shell
$ helm init
$ helm repo add stable https://kubernetes-charts.storage.googleapis.com/
```

あ、helmコマンドを使うにはkubectlが使える環境でないといけません (= ~/.kube/configが存在する）

(ここらへんは思い出しながら書いてるので間違ってるかも）

## ansibleのplaybookを書く

```yaml=
---
- hosts: localhost
  connection: local
  become: false
  tasks:
    - name: Install codimd
      helm:
        chart:
          name: hackmd
          version: 1.2.1
          source:
            type: repo
            location: https://kubernetes-charts.storage.googleapis.com
        name: codimd
        namespace: codimd
        state: present

```

これは、ansibleのhelmパッケージでhackmdをデプロイするtaskです。

で、実行します。

```shell
$ ansible-playbook playbook.yaml
```

と、インストールできます。ただ、今はhackmdパッケージには色々と問題があり動作確認はできません…。かなしい。

# まとめ

- helmはすごく便利。ローカルに置いたディレクトリを見ることもできるので、グローバルなパッケージも自分で作ったパッケージも等しく扱える
- ansible大好き
- ansible-playbookをchat opsとかするよ良さそう

ちなみに、今回の作業はこのリポジトリにpushしてあります。

https://github.com/onokatio/kdev/tree/master/k8s-deployments
