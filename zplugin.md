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
| `bpick`   | Github Releaseからダウンロードする際のファイル名を指定できます。たとえば`zplugin ice from"gh-r" as"program" bpick"*Darwin*"; zplg load docker/compose`のように指定すると、Darwinが含まれる最新のReleaseのバイナリをダウンロードします。 |
| `depth`   | gitコマンドに--depthとして渡されます。プラグインでのみ有効です。 |
| `cloneopts`   | `git clone`コマンドに渡される `cloneopts`です。デフォルトは `--recursive`になっています。プラグインとスニペット両方で有効です。 |
| `bindmap` | To hold `;`-separated strings like `Key(s)A -> Key(s)B`, e.g. `^R -> ^T; ^A -> ^B`. In general, `bindmap''`changes bindings (done with the `bindkey` builtin) the plugin does. The example would cause the plugin to map Ctrl-T instead of Ctrl-R, and Ctrl-B instead of Ctrl-A. |
| `trackbinds` | Shadow but only `bindkey` calls even with `zplugin light ...`, i.e. even with tracking disabled (fast loading), to allow `bindmap` to remap the key-binds. The same effect has `zplugin light -b ...`, i.e. additional `-b` option to the `light`-subcommand. |
| `if`      | Load plugin or snippet only when given condition is fulfilled, for example: `zplugin ice if'[[ -n "$commands[otool]" ]]'; zplugin load ...`. |
| `blockf`  | Disallow plugin to modify `fpath`. Useful when a plugin wants to provide completions in traditional way. Zplugin can manage completions and plugin can be blocked from exposing them. |
| `silent`  | Mute plugin's or snippet's `stderr` & `stdout`. Also skip `Loaded ...` message under prompt for `wait`, etc. loaded plugins, and completion-installation messages. |
| `lucid`   | Skip `Loaded ...` message under prompt for `wait`, etc. loaded plugins (a subset of `silent`). |
| `mv`      | Move file after cloning or after update (then, only if new commits were downloaded). Example: `mv "fzf-* -> fzf"`. It uses `->` as separator for old and new file names. Works also with snippets. |
| `cp`      | Copy file after cloning or after update (then, only if new commits were downloaded). Example: `cp "docker-c* -> dcompose"`. Ran after `mv`. Works also with snippets. |
| `atinit`  | Run command after directory setup (cloning, checking it, etc.) of plugin/snippet but before loading. |
| `atclone` | Run command after cloning, within plugin's directory, e.g. `zplugin ice atclone"echo Cloned"`. Ran also after downloading snippet. |
| `atload`  | Run command after loading, within plugin's directory. Can be also used with snippets. Passed code can be preceded with `!`, it will then be tracked (if using `load`, not `light`). |
| `atpull`  | Run command after updating (**only if new commits are waiting for download**), within plugin's directory. If starts with "!" then command will be ran before `mv` & `cp` ices and before `git pull` or `svn update`. Otherwise it is ran after them. Can be `atpull'%atclone'`, to repeat `atclone` Ice-mod. To be used with plugins and snippets. |
| `nocd`    | Don't switch the current directory into the plugin's directory when evaluating the above ice-mods `atinit''`,`atload''`, etc. |
| `svn`     | Use Subversion for downloading snippet. Github supports `SVN` protocol, this allows to clone subdirectories as snippets, e.g. `zplugin ice svn; zplugin snippet OMZ::plugins/git`. Other ice `pick` can be used to select file to source (default are: `*.plugin.zsh`, `init.zsh`, `*.zsh-theme`). |
| `make`    | Run `make` command after cloning/updating and executing `mv`, `cp`, `atpull`, `atclone` Ice mods. Can obtain argument, e.g. `make"install PREFIX=/opt"`. If the value starts with `!` then `make` is ran before `atclone`/`atpull`, e.g. `make'!'`. |
| `src`     | Specify additional file to source after sourcing main file or after setting up command (via `as"program"`). |
| `wait`    | Postpone loading a plugin or snippet. For `wait'1'`, loading is done `1` second after prompt. For `wait'[[ ... ]]'`, `wait'(( ... ))'`, loading is done when given condition is meet. For `wait'!...'`, prompt is reset after load. Zsh can start 39% faster thanks to postponed loading (result obtained in test with `11` plugins). |
| `load`    | A condition to check which should cause plugin to load. It will load once, the condition can be still true, but will not trigger second load (unless plugin is unloaded earlier, see `unload` below). E.g.: `load'[[ $PWD = */github* ]]'`. |
| `unload`  | A condition to check causing plugin to unload. It will unload once, then only if loaded again. E.g.: `unload'[[ $PWD != */github* ]]'`. |
| `service` | Make following plugin or snippet a *service*, which will be ran in background, and only in single Zshell instance. See [zservices org](https://github.com/zservices). |
| `compile` | Pattern (+ possible `{...}` expansion, like `{a/*,b*}`) to select additional files to compile, e.g. `compile"(pure\|async).zsh"` for `sindresorhus/pure`. |
| `nocompletions` | Don't detect, install and manage completions for this plugin. Completions can be installed later with `zplugin creinstall {plugin-spec}`. |
| `nocompile` | Don't try to compile `pick`-pointed files. If passed the exclamation mark (i.e. `nocompile'!'`), then do compile, but after `make''` and `atclone''` (useful if Makefile installs some scripts, to point `pick''` at location of installation). |
| `multisrc` | Allows to specify multiple files for sourcing, enumerated with spaces as the separator (e.g. `multisrc'misc.zsh grep.zsh'`) and also using brace-expansion syntax (e.g. `multisrc'{misc,grep}.zsh'`). |
