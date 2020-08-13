---
title: vimにlanguage serverを設定する
date: 2019-07-27 23:23:24 +0900
---
vimにlanguage serverを設定する
===

長い間やろうやろうと思って手を付けられずにいましたが、いくばくか時間ができたので取り掛かります。ついでに保管の設定までやります。

# Language Serverとは

まあ僕がわざわざ説明するまでもないと思うので割愛します。

neovimにLanguage Server対応させるプラグインと、各言語ごとのインストールを行います。
環境はArchlinux + neovimです。

# coc.nvim
## 導入する

今まで補完はdeoplete.vimを使っていましたが、coc.nvimがLSPを使って補完も文法チェックもエラーチェックもしてくれるとのことで、移行します。

dein.vimを使っているので、tomlファイルに追記をします。

```
[[plugins]]
repo = 'neoclide/coc.nvim'
rev = 'release'
```

で、neovimを再起動します。vimrcの中にプラグインを自動インストールするようにしているので今回は再起動するだけで自動でcocがインストールされます。

無事インストールされたかどうか確認するには、:checkhealthを実行します。

```
  1 health#coc#check
  2 ========================================================================
  3   - OK: Environment check passed
  4   - OK: Javascript bundle found
  5   - OK: Service started
```

こんな感じで全部OKなら大丈夫です。

## 設定

cocは、初期設定で「今開いているファイルの中にある文字」と「ファイルのパス」が自動で補完されます。

それでは、lspを使った補完をしましょう。

>cocは、内部的にnpmプラグインを使って機能を拡張できます。
>
>本来設定ファイルにlanguage serverを書かなければいけないのですが、いくつかの言語ではnpmプラグインによって既にすべて用意されています。言語によってはそちらを使います。

cocは、設定ファイルを`~/.config/nvim/coc-settings.json`に置き、そこから読み込みます。

またこのファイルを直接いじらずに、`:CoCConfig`コマンドでも編集できます。

### C/C++/Objective-C

まず、C言語系のLanguage Serverを設定します。

cclsとclangdで悩んだ結果、特に理由はなくcclsに決めました。あとあと変えるかもしれません。

まずcclsのバイナリをインストールします。

```
$ sudo powerpill -S ccls
```

で、coc設定ファイルに以下を追加します。

```json=
{
  "languageserver": {
    "ccls": {
      "command": "ccls",
      "filetypes": ["c", "cpp", "objc", "objcpp"],
      "rootPatterns": [".ccls", "compile_commands.json", ".vim/", ".git/", ".hg/"],
      "initializationOptions": {
         "cache": {
           "directory": "/tmp/ccls"
         }
       }
    }
  }
}
```

他の言語も、同じ要領で追加していきます。

### go

```
$ yay -S gopls
```

jsonに以下を追加

```json=
    "golang": {
      "command": "gopls",
      "rootPatterns": ["go.mod", ".vim/", ".git/", ".hg/"],
      "filetypes": ["go"]
    }
```

### rust

```
$ sudo powerpill -S rustup
```

rustは設定ファイルに書かずともプラグインが提供されているので使います。

```
:CocInstall coc-rls
```

### PHP

```
npm i intelephense -g
```

なんかOS付属のパッケージマネージャじゃなくてnpmから入れるのが少しめんどくさい

```
        "intelephense": {
            "command": "intelephense",
            "args": ["--stdio"],
            "filetypes": ["php"],
            "initializationOptions": {
                "storagePath": "/tmp/intelephense"
            }
        }
```


### その他

そろそろ飽きてきたので、箇条書きしていく

- dockerfile
- bash
- vim/erb/markdown
- python
- ruby

## 使い方

ここらへんを見た

- https://qiita.com/gw31415/items/5dfcf8d3676c2c5576ef
- http://wakame.hatenablog.jp/entry/2019/03/31/124941

## 補完ソース

補完ポップアップが出ているときに、右にカッコでソースが出る。

|ソース|説明|
|:-:|:-:|
|[A]|現在のバッファに含まれる単語|
|[B]|現在のバッファに含まれるが画面外の単語|
|[F]|ファイル名補完|
|[LS]|各言語のLanguage Serverからの補完|
|[TN]|tabnineからの補完|
