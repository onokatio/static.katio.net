---
title: "LinuxBrewとOSのパッケージマネージャのpipが競合する場合の解決策"
date: 2019-11-14 22:49:00 +0900
---

# LinuxBrewとOSのパッケージマネージャのpipが競合する場合の解決策

OSのパッケージマネージャ(pacman, apt-get等)とLinuxBrew、またpyenvなどを同時に使用している場合に、pipコマンドのインストール先ディレクトリがそれぞれことなるという問題が発生します。

具体的な話をしましょう。  
OSのパッケージマネージャでインストールされるpythonのライブラリは、基本的には。

- `/usr/lib/python3.7/sites-packages`

などに追加され、LinuxBrewのpythonを使っている場合、pyenvでインストールしたpythonを使っている場合などはそれぞれ以下のディレクトリにライブラリがインストールされます。

- `/home/linuxbrew/.linuxbrew/lib/python3.7/site-packages/`
- `/home/katio/.anyenv/envs/pyenv/versions/3.7.0/lib/python3.7/site-packages`

ただ、pythonのバイナリは`../lib/python3.7/site-packages/`を見に行く習性があります。  
そのため、上記の状況でpythonコマンドを実行した場合、どのpythonバイナリを実行するかによってライブラリのディレクトリが変わります（=使用できるライブラリが異なります）。

そのため、  
「LinuxBrewのPATHを/usr/binより先に通していると、OSのパッケージマネージャでインストールしたpython製のツールが動かない」  
やその逆の  
「LinuxBrewのコマンドが動かない」が起こります。

これを解決しよう、というのが今回やりたいことです。

# 解決策

pythonには、`../lib/python3.7/sites-packages/`内に`*.pth`と呼ばれるファイルがあると、そのファイルの各行に書いてあるパスを自動的にライブラリのモジュールとして認識します。
そのため、今回取る解決策はこうです。

1. LinuxBrewのpythonコマンドを`$PATH`で最優先にする
2. LinuxBrewの`lib/python3.7/sites-packages`配下に、`custom.pth`という名前のファイルを作成し、その中に`/usr/lib/python3.7/sites-packages`を追記する

※今回、pyenvはglobalとしてsystemを使っています。そのため、pyenvでpipコマンドを実行してもLinuxBrewのpythonが使われる状況になるため、あえてpyenvには何も設定しません。

# 実装

`~/.zshrc`か~`/.zprofile`に以下の感じにシェルスクリプトを書きます。以上。

```zsh=
# usage: add-python-path <dst> <src>
add-python-path(){

        custom_pth="$1/custom.pth"

        if [[ -d "$1" ]];then

                [[ ! -e "${custom_pth}" ]] && touch $custom_pth

                if ! grep "$2" "$custom_pth" >/dev/null 2>&1 ; then
                        echo "$2/"               >> ${custom_pth}
                        echo "$2/site-packages/" >> ${custom_pth}
                fi
        fi
}

# set system PYTHONPATH to linuxbrew's PYTHONPATH
add-python-path "/home/linuxbrew/.linuxbrew/lib/python2.7/site-packages" "/usr/lib/python2.7"
add-python-path "/home/linuxbrew/.linuxbrew/lib/python3.7/site-packages" "/usr/lib/python3.7"
```

中は簡単で、custom.pthの有無を確認して追記する関数を作り、そこに2.7と3.7のパスを引数として与えて実行しているだけです。

以上！！
