---
title: sudoしたあともfunctionを引き継がせる
tags: Linux Bash Zsh sudo
author: onokatio
slide: false
---
どうも。かちおです。
自分は、よくfanctionを使って「`vi(){vim $@}`」みたいなことをしています。
> ちなみに、aliasを使わないのは、aliasだと保管の際に不具合が起きるからです。

そして、aliasの場合は`sudo`でも引き継がれますが、functionの場合は引き継がれません。
つまり、`alias vi='vim '`をすると、`sudo vi hoge`をした際には、`sudo vim hoge`になりますが、`vi(){vim $@}`した場合には、`sudo vi hoge`は`sudo vi hoge`として実行されてしまいます。
これではsudoしたときに関数が引き継げません。

ということで以下のfunctionとaliasを.bashrcなどに追加します。

```bash
sdo() sudo zsh -c "$functions[$1]" "$@"
alias sudo="sdo"
```

まず、sudoのかわりにsdoというfunction（コマンド）を作成し、$functionという、シェルに登録された関数がすべて保管されている便利な変数を実行します。そして本来のコマンドを実行します。
次に、aliasでsudoを売ったときにsdoが実行されるようにします。

本体は、sudoというfunctionを作成したかったのですが、そうやらそれは怒られてしまうようなので、このような形になりました。


参考: https://unix.stackexchange.com/questions/317687/command-not-found-when-sudoing-function-from-zshrc

