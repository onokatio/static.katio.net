---
title: 【ja_JP.UTF-8】Linuxのロケールをroot権限なしでインストールする
tags: Linux locale
author: onokatio
slide: false
---
どうも。
Linuxには、Localeという概念があります。これはLinuxディストリビューションの標準ライブラリである`gettext`や`date`など、言語や地域で表示が異なる部分を共通化して切り出したものです。
これにより、OSが扱う文字コードや文字の種類、通貨の単位や年月日の表記の順番を設定することができます。
通常、このロケールは、Linuxに標準的にインストールされています。
しかし、環境によっては「en_US.UTF-8が無い！？」「日本語使いたいけどja_JP.UTF-8入ってないんだけど！」ということがあります。それが自分のマシンではなく、共有マシンの場合、root権限を持っているユーザーは一部だけなため、なおさら解決が難しいです。

そのため、今回は、ロケールをユーザー権限で新たにインストールし、利用できるようにします。

## 前提知識

| パス | 意味 |
|:--|:-:|
| /usr/share/locale | ロケールの設定ファイルなどが収められている。 |
| /usr/lib/locale/ | ロケールの本体。ロケールがディレクトリごとに収められている。 |
| /usr/lib/locale/locale-archive | ロケールの本体。上はディレクトリごとだが、こちらはディレクトリをまとめて書庫の形式にしたもの。こちらほうが総容量が少なくて済む。 |
| /usr/share/i18n/locales | ロケールの書庫や設定ファイルを作り出すためのソースコードが入っている。|
| /etc/locale.gen | locale-genコマンドで自動で生成するロケール一覧 |
| /etc/locale.conf | システムで利用するロケール |

| コマンド | できること |
|:-:|:-:|
| locale | インストールされているロケール一覧を取得した、今どのロケールが利用されているか確認できる。
| locale-gen | localedefのラッパー。`/etc/locale.gen`ファイルに書いてあるロケールを生成する。|
| localedef | ロケールを生成するコンパイラ。 |

## 考えてみる

通常はlocale-genを使い、localeをコンパイル・インストールしているが、今回は`/etc/locale.conf`を編集できず、そもそも/usr/以下への書き込み権限がない。

ということなので、locale-genはlocaledefのラッパースクリプトなので、localedefを直接調べてみましょう。
すると`localedef`のオプションがわかりました。

```
使用法: localedef [OPTION...] NAME
または:  localedef [OPTION...]
            [--add-to-archive|--delete-from-archive] FILE...
または:  localedef [OPTION...] --list-archive [FILE]
ロケール仕様をコンパイルする

 入力ファイル:
  -f, --charmap=FILE         シンボル文字名は FILE
                             内で定義されています
  -i, --inputfile=FILE       FILE 内でソース定義が見つかりました

  -u, --repertoire-map=FILE  FILE にはシンボル名から UCS4
                             値へのマップが含まれます

 出力制御:
  -c, --force
                             警告メッセージがあっても出力を作成する
      --posix                Strictly conform to POSIX
      --prefix=PATH
                             出力ファイルにオプションの接頭辞を付加する
      --quiet                警告と情報メッセージを抑制する
  -v, --verbose              詳細なメッセージを表示する

 書庫制御:
      --add-to-archive
                             パラメータで指定された名前のロケールを書庫に追加する
  -A, --alias-file=FILE      書庫を作成する時に locale.alias
                             ファイルを参照する
      --big-endian           Generate big-endian output
      --delete-from-archive
                             パラメータで指定された名前のロケールを書庫から削除する
      --list-archive         書庫の内容のリストを表示する
      --little-endian        Generate little-endian output
      --no-archive           書庫に新しいデータを追加しない
      --replace              既存の書庫の内容を置換する

  -?, --help                 このヘルプ一覧を表示する
      --usage                短い使用方法を表示する
  -V, --version              プログラムのバージョンを表示する
```

とここでprefixというオプションを発見しました。これを色々と弄った結果、書庫を生成することができました！
で、問題は設定ファイルの方（`/usr/share/locale`）です。それについても、localedefに与えるオプションで解決できました。

```bash
# 設定ファイルの作成
$ localedef -i /usr/share/i18n/locales/ja_JP -c -f UTF-8 -A /usr/share/locale/locale.alias /home/user/mylocale/ja_JP.UTF-8

# 書庫の作成
$ mkdir -p /home/user/locale/usr/lib/locale
$ localedef -i /usr/share/i18n/locales/ja_JP -c -f UTF-8 -A /usr/share/locale/locale.alias --add-to-archive --prefix=/home/user/locale
# prefixで指定したディレクトリ以下のusr/lob/locale/locale-archiveに書庫が生成されます。直接ディレクトリは指定できないようです　。
```

と、ここで問題の解決ができたのですが、これでは毎回手動で生成することになりますし、めんどくさいです。
と、ここで、`locale-gen`を思い出しました。これは、`localedef`をラップして、`/etc/locale.gen`に指定したロケールを自動でコンパイルしてくれるじゃないですか。
ということなので、locale-genをいじって、ローカルインストールも自動化しちゃいましょう！

ということで以下。

```bash:locale-gen.local
#!/bin/bash

set -e

if [[ -z "$MYLOCAL" ]];then
        echo '$MYLOCAL is not set.'
        exit
fi

LOCALEGEN=$MYLOCAL/etc/locale.gen
LOCALES=/usr/share/i18n/locales
USER_LOCALES=/usr/local/share/i18n/locales
LOCALE_ARCHIVE=$MYLOCAL/usr/lib/locale

if [ -n "$POSIXLY_CORRECT" ]; then
  unset POSIXLY_CORRECT
fi

[ -f $LOCALEGEN ] || exit 0;
[ -s $LOCALEGEN ] || exit 0;

KEEP=
if [ "$1" = '--keep-existing' ]; then
        KEEP=1
fi

if [ -z "$KEEP" ]; then
        # Remove all old locale dir and locale-archive before generating new
        # locale data.
        rm -rf $LOCALE_ARCHIVE/locale-archive || true
fi

umask 022

is_entry_ok() {
  if [ -n "$locale" -a -n "$charset" ] ; then
    true
  else
    echo "error: Bad entry '$locale $charset'"
    false
  fi
}

echo "Generating locales (this might take a while)..."
while read locale charset; do \
        case $locale in \#*) continue;; "") continue;; esac; \
        is_entry_ok || continue
        if [ "$KEEP" ] && PERL_BADLANG=0 perl -MPOSIX -e \
            'exit 1 unless setlocale(LC_ALL, $ARGV[0])' "$locale"; then
                continue
        fi
        echo -n "  `echo $locale | sed 's/\([^.\@]*\).*/\1/'`"; \
        echo -n ".$charset"; \
        echo -n `echo $locale | sed 's/\([^\@]*\)\(\@.*\)*/\2/'`; \
        echo -n '...'; \
        if [ -f $USER_LOCALES/$locale ] ; then
            input=$USER_LOCALES/$locale
        elif [ -f $LOCALES/$locale ]; then
            input=$locale
        else
            input=`echo $locale | sed 's/\([^.]*\)[^@]*\(.*\)/\1\2/'`
            if [ -f $USER_LOCALES/$input ]; then
                input=$USER_LOCALES/$input
            fi
        fi
        localedef -i $input -c -f $charset -A /usr/share/locale/locale.alias $LOCALE_ARCHIVE/$locale || :; \
        echo ' done'; \
        localedef -i $input -c -f $charset -A /usr/share/locale/locale.alias --add-to-archive --prefix=$MYLOCAL|| :; \
done < $LOCALEGEN
echo "Generation complete."
```

まず、`/etc/locale.gen`を`$MYLOCAL/etc/locale.conf`にコピーし、編集してください。
次に、`mkdir -p $MYLOCAL/usr/lib/locale`してディレクトリを生成してください。
次に`locale-gen.config`(上のシェルスクリプト)を実行します。
そうすると、`$MYLOCAL/etc/locale.conf`にかいたロケールが全自動で生成され、`$MYLOCAL/usr/lib/locale`以下にロケールの設定ファイル群と書庫がインストールされます。

## ローカルインストールしたロケールの選択

環境変数`$LOCPATH`にディレクトリを指定することで読み込むようになります。
また、ロケール自体は`$LANG`を設定することで指定できます。

ということで以下を`.bashrc`などに追記しましょう。

```bash
export LANG=ja_JP.UTF-8
export LOCPATH=$MYLOCAL/usr/lib/locale
```

また、注意なのですが、こうして`$LOCPATH`を指定すると、標準でシステムにインストールされているロケール群を読みに行かなくなります。よって、ロケールをローカルインストールする場合、必要なロケールをすべてローカルにインストールする必要があります。
なので、root権限を所有している場合、今回の記事の内容は実践しないほうが良いです。

----

これで`en_US.UTF-8`や`ja_JP.UTF-8`がインストールされていない鬼畜な環境でも、特定のロケールでしか動作しないバイナリなどを実行することができますね！！
ぜひ活用してみてください！

