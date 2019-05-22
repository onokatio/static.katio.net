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

## snippet

スニペットでは、githubリポジトリではなく特定のURLのファイルのみをダウンロードして読み込むことができます。

```
zplugin snippet https://hoge.fuga/hoge.zsh
```

また、Oh-My-ZshやPretzoの特定のファイルを読み込みたい場合、省略記号として`OMZ::`と`PZT::`を使用できます。

例えば以下のように書いた場合

```
zplugin snippet OMZ::plugins/git/git.plugin.zsh
zplugin snippet PZT::modules/helper/init.zsh
```

以下のように展開されます。

```
zplugin snippet 'https://github.com/robbyrussell/oh-my-zsh/raw/master/plugins/git/git.plugin.zsh'
zplugin snippet 'https://github.com/sorin-ionescu/prezto/blob/master/modules/helper/init.zsh'
```


## ice

プラグインやスニペットを読み込む際に、オプションをつけたい場合があります。
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

この場合、zsh-autosuggestionが読み込まれた直後に`_zsh_autosuggest_start`が実行されます。


### その他

全部に対して例を書くのはめんどくさいのでその他のiceオプションをいかに示します。

|  Modifier | Description |
|-----------|-------------|
| `proto`   |  cloneしてくるプロトコルを指定します。`git`,`ftp`,`ftps`,`ssh`, `rsync`などを指定できます。 デフォルトは`https`です。プラグインにのみ有効でスニペットにはできようされません。  |
| `from`    | どこからプラグインをcloneしてくるのかを指定します。 指定できるのは `from"github"` (デフォルト), `..."github-rel"`, `..."gitlab"`, `..."bitbucket"`, `..."notabug"` (略称: `gh`, `gh-r`, `gl`, `bb`, `nb`). また、Github Enterpriseを使っている場合など、フルURLで指定することもできます。 |
| `as`      | `as"program"` (もしくはエイリアスである `as"command"`), を指定すると、プラグインを`source`するのではなく `$PATH` に追加します。 (`pick`を参照). また`as"completion"`も指定できます。 |
| `id-as`   | プラグインやスニペットにニックネームを追加できます。長いURLを短く管理したいときに使えます。 See [blog post](http://zdharma.org/2018-10-12/Nickname-a-plugin-or-snippet). |
| `ver`     | `from"gh-r"`と一緒に使います。 (`as"program"`を使ってバイナリをダウンロードするときなどです。) – ダウンロードするバージョンを選べます。デフォルトは最新(`ver"latest"`)です。 Works also with regular plugins, checkouts e.g. `ver"abranch"`, i.e. a specific version. |
| `pick`    | `snippet --command` や`as"program"`を使うときに、どのファイルを$PATHに追加するか指定します。たとえば`zplugin ice pick"*.plugin.zsh"`と指定することができます。 プラグインとスニペット両方で有効です。 |
| `bpick`   | Github Releaseからダウンロードする際のファイル名を指定できます。たとえば`zplugin ice from"gh-r" as"program" bpick"*Darwin*"; zplugin load docker/compose`のように指定すると、Darwinが含まれる最新のReleaseのバイナリをダウンロードします。 |
| `depth`   | gitコマンドに--depthとして渡されます。プラグインでのみ有効です。 |
| `cloneopts`   | `git clone`コマンドに渡される `cloneopts`です。デフォルトは `--recursive`になっています。プラグインとスニペット両方で有効です。 |
| `bindmap` | To hold `;`-separated strings like `Key(s)A -> Key(s)B`, e.g. `^R -> ^T; ^A -> ^B`. In general, `bindmap''`changes bindings (done with the `bindkey` builtin) the plugin does. The example would cause the plugin to map Ctrl-T instead of Ctrl-R, and Ctrl-B instead of Ctrl-A. |
| `trackbinds` | Shadow but only `bindkey` calls even with `zplugin light ...`, i.e. even with tracking disabled (fast loading), to allow `bindmap` to remap the key-binds. The same effect has `zplugin light -b ...`, i.e. additional `-b` option to the `light`-subcommand. |
| `if`      | 渡されたシェル文の実行結果がtrueだった場合のみ読み込みを実行します。例: `zplugin ice if'[[ -n "$commands[otool]" ]]'; zplugin load ...`. |
| `blockf`  | プラグインの`fpath`への変更を禁止します。保管系のプラグインを読み込んで、最後に自力でfpathに追加したい場合などに有効です。 |
| `silent`  | プラグインやスニペットの `stderr` & `stdout`への出力を抑制します。また、`wait''`(turbo mode)時に表示される`Loaded ...`なども表示しません。 |
| `lucid`   | `wait''`(turbo mode)時に表示される`Loaded ...`を表示しません。 |
| `mv`      | `clone`や`update`したときに、ファイルをmvします。 たとえば`mv "fzf-* -> fzf"`。 `->`を古いファイル名と新しいファイル名の区切りに使います。 プラグインとスニペット両方で有効です。 |
| `cp`      | `mv`と同じく、ファイルをコピーします。 例: `cp "docker-c* -> dcompose"` ちなみにcpとmvを両方指定した場合、mvが実行されてからcpが実行されます。|
| `atinit`  | プラグインをcloneする前に実行します。 |
| `atclone` | プラグインをcloneしたあとに実行します。 カレントディレクトリはプラグインのディレクトリになります。|
| `atload`  | プラグインがロードされたあとにコマンドを実行します。 カレントディレクトリはプラグインのディレクトリになります。先頭に`'!'`を渡した場合、かつ読み込まれるモードがlightではなくloadの場合、トラッキングが有効になります。|
| `atpull`  | プラグインをupdate(git pull)した場合、その __後__ にコマンドを実行します。 しかし、先頭に`'!'`が渡された場合は、 後ではなく`mv` & `cp`や`git pull`や`svn update`の __前__ に実行されます。また、`atpull'%atclone'`と指定した場合、atcloneの内容を実行します。プラグインとスニペット両方で有効です。|
| `nocd`    | `atinit''`や`atload''`する際に、カレントディレクトリをプラグインの中に移動しません。 |
| `svn`     | スニペットをSVNでダウンロードします。GithubはSVNをサポートしているため、特定のディレクトリのみダウンロードしたい場合に有用です。 例: `zplugin ice svn; zplugin snippet OMZ::plugins/git`|
| `make`    | cloneやupdate、`mv`, `cp`, `atpull`, `atclone` オプションを実行した後に`make`を実行します。たとえば引数を取ることも可能です。例: `make"install PREFIX=/opt"` もし先頭に`!`が渡された場合、`atclone`や`atpull`の前に実行します。|
| `src`     | `as"program"`を使った場合や、普通にロードした場合に、追加でsourcesしたいファイルがある場合はここで指定できます。|
| `wait`    | プラグインや1スニペットをあとで読み込みます。たとえば`wait'1'`を指定した場合、プロンプトが表示されて`1`秒後に読み込みます。`wait'[[ ... ]]'`や`wait'(( ... ))'`と指定した場合、指定したシェル文`...`の実行が完了してから読み込みます。 先頭に`!`を渡した場合ロード後にプロンプトがresetされます。 11個のプラグイン環境で試した場合、zshの起動が39%高速化します。|
| `load`    | 式の返り値がtrueだったときのみプラグインをロードします。 例: `load'[[ $PWD = */github* ]]'`. |
| `unload`  | loadの逆で、式がtrueだとすでに読み込まれているプラグインをアンロードします。 |
| `service` | プラグインやスニペットを、独立したZshellインスタンスでバックグラウンドで動作するサービスとして読み込みます。 See [zservices org](https://github.com/zservices). |
| `compile` | zcompileをします。 例: `compile"(pure\|async).zsh"`|
| `nocompletions` | プラグインの提供する保管をインストール/認識しません。 あとで`zplugin creinstall {plugin-spec}`を実行することで読み込めます。|
| `nocompile` | `pick`されたファイルをコンパイル/makeしようとしません。先頭に`!`が渡された場合、`make''`や`atclone''`したあとにコンパイルします。 Makefileがファイルを生成する場合に有用です。 |
| `multisrc` | 複数のファイルをsourceします。 例: `multisrc'misc.zsh grep.zsh'` またブランケット記法が有効です。 例: `multisrc'{misc,grep}.zsh'` |
