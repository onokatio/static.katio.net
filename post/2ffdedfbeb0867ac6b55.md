---
title: 俺的爆速zshrc/zprofile
tags: Linux Zsh zshrc
author: onokatio
slide: false
---
どうも。
zsh使ってますか？zsh。

zshユーザーにはおなじみの.zshrcですが、自分が最高の反応速度を叩き出すように、起動やコマンド実行に対して高速化するように改良しました。
また、新しく追加するときや、あとから見返したときの可読性などもあげる工夫をしているので、ぜひ参考にしてください。

# ファイル分割

zshrcを、意味のあるファイルに分割します。

まず、以下のようなシェルスクリプト（Makefileでも可）を作成します。

```shell:make.sh
touch ../dists/zshrc
echo > ../dists/zshrc
rm -f ~/.zcompdump  # Clear zcomp cache


command ls ./zshrc.d/*.zsh       | sort | xargs cat >> ../dists/zshrc

if which zsh >/dev/null;then
	# zshが存在すれば、./zshrc.d/hooks/以下のスクリプトをすべて実行し、結果をzshrcに書き出す。
	find ./zshrc.d/hooks -maxdepth 1 -name *.zsh | sort | xargs zsh >> ../dists/zshrc
else
	echo "zsh not found"
fi

zsh -n ../dists/zshrc # 文法チェック
zsh -c "zcompile ../dists/zshrc" # コンパイル
zsh -c "autoload -Uz compinit && compinit" # compinitの実行
```

見てわかるように、./zshrc.d/*.zshを連結して、../dists/zshrcに書き出します。
また、後述するhookも起動し、結果を../dists/zshrcに書き出します。
（本当はrun-partsを使ってもう少しシンプルにしたかったのですが、そうするとシェルスクリプトでないファイルまでrun-partsが実行しようとしてエラーになりました。原因が分かった人がいたらおしえろください。）

compinitについては、~/.zcompdumpさえあれば動作するため、zshrcの中では呼び出さず、make.shの中でのみ削除・更新するようにしています。

この上で、自分はzshrc.dを以下のように分割しています。

```shell
$ ls ./zshrc.d/
00-exec.zsh  10-autoload.zsh  20-zstyle.zsh  30-setopt.zsh  40-alias.zsh  50-prompt.zsh  60-bindkey.zsh  99-end.zsh  hooks/
```

00-exec.zshはtmuxやfbtermの実行、99-end.zshはzprofの起動をしています。
それ以外のファイルはファイル名どおりの記述をしています。

同じように、zprofileもmake.shを生成します。

# zplug / hook

プラグイン管理についてです。
自分は、zplugというプラグインマネージャーを利用していましたが、起動が重いことに悩まされました。
結局、zplugは通常のシェルでは使わないことにしました。
その代わりに、zplug installやzplug updateはmake.shの中でのみ呼び出すようにしています。
また、zplug loadはやめて、zplugが管理するプラグインディレクトリの中のzshファイルを検知し、source文をzshrcの中に書き出すようにしています。

このために作られたのがhookです。mkinitcpioだったりgrub-mkconfigに触発されています。内容はただのシェルスクリプトで、「シェルスクリプトの標準出力がzshrcに吐き出される」ようになっています。
詳しい動作はさきほどのmake.shを確認してください。

これにより、柔軟にzshrcを動的生成できるようにしました。

たとえば、実際のzplugのhookは以下のように作りました。

```zsh:zplug.zsh
cd `dirname $0`

if [[ ! -d ./zplug ]] ;then
	echo zplug not found >&2
	exit
fi

export ZPLUG_HOME="$PWD/zplug"
export ZPLUG_REPOS=$MYLOCAL_DIST/.zsh-plugins
export ZPLUG_BIN=$ZPLUG_REPOS/bin

source $ZPLUG_HOME/init.zsh

zplug "zsh-users/zsh-autosuggestions"
zplug "zsh-users/zsh-completions", lazy:true


zplug check --verbose >&2 || zplug install >&2
zplug update >&2

zplug load --verbose >&2
zplug clear >&2

list=(`zplug list`)

echo "##### zplug #####"

for i in $list ; do
	eval $(zplug info $i | sed -e 's/-//' | sed -e 's/: /=/'|grep "dir" | sed 's/\x1b\[[0-9;]*m//g')
	echo source $(ls $dir/*.zsh | head -n1)
done

echo "##### /zplug #####"
```

zplug.zshがあるディレクトリと同じ場所にzplugをgit submoduleとして読み込ませています。
$MYLOCAL_DISTについては../distが入っています。

最後のevalについては、zplug loadしたあとにzplugが吐き出すyamlをシェルスクリプトだと誤認させて無理やり実行し、値を環境変数として読み出しています。なんちゃってパーサーです。

それ以外に特に難しいところは無いと思います。

ちなみに、zshrcのなかでこのzplug.zshによって生成された部分は以下のようになります。

```zsh:zshrc
# 中略

##### zplug #####
source /home/katio/.conf-to-git/zsh/../dists/.zsh-plugins/zsh-users/zsh-completions/zsh-completions.plugin.zsh
source /home/katio/.conf-to-git/zsh/../dists/.zsh-plugins/zsh-users/zsh-autosuggestions/zsh-autosuggestions.plugin.zsh
##### /zplug #####

# 中略
```

ちなみに、今は使っていませんが、anyenvのhook版のあります。anyenv initがあまりにもおそすぎて気に入らなかったので作りましたが、今はanyenv自体を使っていないです。

```zsh:anyenv.zsh.old
	#eval "$(anyenv init - --no-rehash)"
	#eval "$(anyenv init -)"
	#anyenv() {
	#	typeset command
	#	command="$1"
	#	if [ "$#" -gt 0 ]; then
	#		shift
	#	fi
	#	command anyenv "$command" "$@"
	#}

if [[ -d $ANYENV_ROOT ]] ; then
	echo "export PATH=$ANYENV_ROOT/bin:\$PATH"
	xenvlist=(`command ls $ANYENV_ROOT/envs`)
	for xenv in ${xenvlist[@]};do 
		cat <<- EOS
			export ${xenv}_ROOT='$ANYENV_ROOT/envs/${xenv}'
			export PATH="$ANYENV_ROOT/envs/${xenv}/bin:\$PATH"
			export PATH="$ANYENV_ROOT/envs/${xenv}/shims:\$PATH"
			hash -r 2>/dev/null || true
			${xenv}() {
				local command
				command="\$1"
				if [ "\$#" -gt 0 ]; then
					shift
				fi

				case "\$command" in
				rehash|shell)
					hash -r 2>/dev/null || true;;
				*)
					command ${xenv} "\$command" "\$@";;
					esac
			}
		EOS
	done
else
	echo 'ANYENV_ROOT is not set.'
fi

```
# zprofile

zprofileも同じ要領で作っていきます。
先程のmake.shに以下を追記します。

```zsh:make.zsh
# 中略

touch $MYLOCAL_DIST/zprofile
echo -n > ../dists/zprofile
find ./zprofile.d -maxdepth 1 -name '*.zsh' | sort | xargs cat >> ../dists/zprofile
if which zsh >/dev/null;then
	find ./zprofile.d/hooks -maxdepth 1 -name *.zsh | sort | xargs zsh >> ../dists/zprofile
else
	echo "zsh not found"
fi
zsh -n ../dists/zprofile
zsh -c "zcompile ../dists/zprofile"
```

./zprofile.dは以下のようになっています。

```shell
$ ls ./zprofile.d/
10-env.zsh  30-common.zsh  40-path.zsh  hooks/
```

## PATH

PATHやLD_LIBRARY_PATHなど、prefixがパソコンの中に複数ある場合の処理です。
複数のPCでzprofileを使いまわしているため、以下のように、ディレクトリが存在する場合のみ読み込むようにしました。

```zsh:40-path.zsh
add-bin(){
	if [[ -e "$1" ]];then
		export PATH=$1:$PATH
	fi
}

add-local-path(){
	if [[ -e "$1" ]];then
		export PATH="$1/sbin:$PATH"
		export PATH="$1/bin:$PATH"
		export LD_LIBRARY_PATH="$1/lib:$LD_LIBRARY_PATH"
		export LD_LIBRARY_PATH="$1/lib64:$LD_LIBRARY_PATH"
		export LD_RUN_PATH="$1/lib:$LD_RUN_PATH"
		export LD_RUN_PATH="$1/lib64:$LD_RUN_PATH"
		export PKG_CONFIG_PATH="$1/lib/pkgconfig:$PKG_CONFIG_PATH"
		export PKG_CONFIG_PATH="$1/lib64/pkgconfig:$PKG_CONFIG_PATH"
		export MANPATH="$1/share/man:$MANPATH"
		export INFOPATH="$1/share/info:$INFOPATH"
		export XDG_DATA_DIRS="$1/share:$XDG_DATA_DIRS"
		PY2VERSION="2.7.14"
		PY3VERSION="3.6.3"
		PY2MODULE="$ANYENV_ROOT/envs/pyenv/versions/$PY2VERSION/lib/python2.7/site-packages/custom.pth"
		PY3MODULE="$ANYENV_ROOT/envs/pyenv/versions/$PY3VERSION/lib/python3.6/site-packages/custom.pth"
		if [[ -e "$ANYENV_ROOT/envs/pyenv/versions/$PY2VERSION" ]];then
			if [[ ! -e "$PY2MODULE" ]] || ! grep "$1/lib/python2.7/site-packages" "$PY2MODULE" >/dev/null 2>&1;then
				echo "$1/lib/python2.7/" >> $PY2MODULE
				echo "$1/lib/python2.7/site-packages" >> $PY2MODULE
				echo "$1/lib/python2.7/site-packages/gtk-2.0" >> $PY2MODULE
			fi
		fi
		if [[ -e "$ANYENV_ROOT/envs/pyenv/versions/$PY3VERSION" ]];then
			if [[ ! -e "$PY3MODULE" ]] || ! grep "$1/lib/python3.6/site-packages" "$PY3MODULE" >/dev/null 2>&1;then
				echo "$1/lib/python3.6/" >> $PY3MODULE
				echo "$1/lib/python3.6/site-packages" >> $PY3MODULE
				echo "$1/lib/python3.6/site-packages/gtk-2.0" >> $PY3MODULE
			fi
		fi
	fi
}

add-bin /bin
add-bin /sbin
add-local-path /usr
add-local-path /usr/local
add-local-path /home/local
add-bin /home/local/python/anaconda3/bin
add-local-path /home/local/python/anaconda3
add-bin /usr/lib/ccache/bin
add-bin $HOME/.yarn/bin
add-bin ./node_modules/.bin
```

pyenvや、ネイティブのパッケージマネージャーなど、複数のツールでpythonのライブラリを管理する場合、うまく解決ができないため、動的に.pthファイルを作り出してpyenvのpythonに読み込ませています。
これについては、いつかまた別の記事で詳しく書こうと思います。

今考えると、この環境変数処理は環境依存のため、hookにしてmake.shを実行するときのみif文で判断し、動的にexport文を書き出したほうが数ミリ秒早くなりそうな気がしてきました。今度やります。

# まとめ

hookを使ったzplugを使わなくていいzshrcで、ずいぶん読み込みが早くなりました。
今回紹介したdotfile群は、githubで公開しています。ぜひ参考にしてもえらると嬉しいです。

https://github.com/onokatio/.conf-to-git/tree/master/zsh

