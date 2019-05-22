# Zpluginを使ってみる

自分はzshのプラグイン管理にはzplugを使っていましたが、zpluginという高速なプラグインマネージャーがあるらしいので使ってみます。
日本語でオプションなど解説した文書がなさそうなので備忘録も兼ねてここに書いておきます。

またプラグインを「ロード」と「読み込み」と表記がぶれていますが、同じことです。

# インストール

zpluginを適当なところへインストールします。

```
$ git clone https://github.com/zdharma/zplugin
```

zshrcの中から読み込みます。

```.zshrc
source /path/to/zplugin/zplugin.zsh
```

# 使い方

## light

`zplugin light <plugin name of Github>`でプラグインを読み込みます。ローカルにない場合はcloneしてきてくれます。
普通のプラグインマネージャーと特に変わりはありません。

```
zplugin light zsh-users/zsh-autosuggestions
```

## ice

プラグインを読み込む際に、オプションをつけたい場合があります。
その場合、`zplugin light`コマンドにオプションを増やさず、`zplugin light`コマンドの直前で`zplugin ice`コマンドを実行します。

`zplugin ice`で指定されたオプションは直後に実行される`zplugin light`に適用されます。

以下から、iceで指定できるオプションを説明してきます。

### wait
waitは、直後に数値をつけて使います。
これは、非同期でコマンドを読み込むオプションです。（遅延実行とも言う）

lightコマンドが実行された時点ではプラグインを読み込まずに、ユーザーがプロンプトに入力できる状態（.zshrcがすべて読み込まれたあと）になってからバッググラウンドでプラグインを読み込みます。

例えば以下のようにzshrcに追記したとします。

```
zplugin ice wait'0'
zplugin light zsh-users/zsh-autosuggestions
```

この場合、.zshrcを読み込んでいる時点ではzsh-autosuggestionはロードされず、プロンプトが表示されてからzsh-autosuggestionがロードされます。
そのため、起動直後の0.2〜0.3秒ほど立たないと保管は聞かないがターミナルは早く起動するようになります。

ちなみに、waitのあとの0は遅延読み込みの秒数です。0にした場合プロンプトが表示されてから0秒後、つまりすぐに遅延読み込みが実行されます。

waitオプションは、非同期読み込みのため超早いです。ターミナル起動直後に必要ないプラグインをあとからゆっくり読み込めます。
そのためturbo modeという別名もついています。

### atinit

atinitは、プラグインを読み込む前にコマンドを実行できます。

例えば、以下のようなzshrcを書いたとします。

```
zplugin ice wait"0" atinit"zpcompinit; zpcdreplay"
zplugin light zdharma/fast-syntax-highlighting
```

この場合、fast-syntax-highlightingが実行される直前にzcompinit; zpcdreplayを実行しています。

ちなみに、zcompinitはzpluginが提供してるシェル関数で、中では'autoload compinit; compinit'を実行してるだけです。
zpcdreplayも同じくシェル関数で、プラグインが実行しようとしているcompdefを解析して実行しています。

### atload

atloadは、プラグインを読み込んだあとにコマンドを実行できます。

例えば以下のようなzshrcを書いたとします。

```
zplugin ice wait"0" atload"_zsh_autosuggest_start"
zplugin light zsh-users/zsh-autosuggestions
```

この場合、zsh-autosuggestionが読み込まれた直後に_zsh_autosuggest_start`が実行されます。
