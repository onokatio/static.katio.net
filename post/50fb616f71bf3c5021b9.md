---
title: 日常から使えるUnix系OS業務効率up技
tags: Linux UNIX Mac MacOSX
author: onokatio
slide: false
---
# 日常から使えるUnix系OS業務効率up技

気分転換に、普段からLinuxで作業する上で割と便利なツールだったり小技を共有します。知ってたらごめんね :pray:

一応全部MacでもLinuxでも動くはずです。

# 高速化系 :ramen:

## axel , aria2c 

http://qiita.com/sarumonera/items/2b30999d7d41a4747d74
https://goo.gl/gsFrCT

https://wiki.archlinuxjp.org/index.php/Aria2
http://qiita.com/TokyoMickey/items/cb51805a19dcee416151


こいつらは割と有名（？）かなと思います。やってることはcurlやwgetとほとんど変わらず、サーバにHTTPリクエストを送ってレスポンスを取ってくるだけなのですが、ダウンロードを高速化するためにtcpコネクションを何本も貼って、相手サーバーに負担をかけながら分割ダウンロードしてます。

もちろん物理的な回線速度は超えませんが、逆に回線を独占して素早くダウンロードができます。他の人が繋げるコネクションつかっちゃうの道徳的にどうなのよ？という話もあるので僕は緊急時や時間がない時、あと自分の鯖だったりの時に「インターネットユーザーのみなさんごめんなさい」と心の中で懺悔しながら使ってます。

くれぐれも悪用は避けたほうがいいです。あと鯖によってはコネクション多すぎるとFWとかWAFでアクセス制限かかるかも。

## apt-fast

https://github.com/ilikenwf/apt-fast

これはapt-getやapt、aptitudeのダウンロード部分を上で説明したaria2cを使って、パッケージを爆速ダウンロードできるラッパーみたいなものです。デフォルトだと人に迷惑をかけないくらいのコネクション数に抑えられているので常用してもいいかと思います。インストール時に内部でaptかapt-getかaptitudeのどれを使うか尋ねられるので、問題がなければaptを使うといいです。

## pigz pixz pbzip2

http://qiita.com/itukizora/items/10a9e7fffff857de374b
http://yagays.github.io/blog/2012/06/15/pigz/
https://www.submit.ne.jp/1500

これは、圧縮ファイルの展開や圧縮処理をマルチスレッド化するものです。デフォでlinuxなどに入ってるgzipとかはシングルでしか動作しないので、これ使うと体感時間が数倍早くなってオヌヌメです。
ちなみにtarにオプションをつけることで、tarでいつもどうりに展開・圧縮するときにも使えます。

```
$ tar xf ファイル名 --use-compress-prog=pigz
$ tar Jcf ファイル名 --use-compress-prog=pixz
$ tar jf ファイル名 --use-compress-prog=pibzip2
```
>
> ちなみにtarコマンドの引数は
xがextractで展開、cがcompressで圧縮、vがverboseで冗長な出力、zがgz、Jがxz、jがbzip2
です。あと展開の時にはzJjはいらないです。

また、自分の場合はzshrcに関数登録しちゃってます。

```
function targz(){tar xvf $@ --use-compress-prog=pigz }
function tarxz(){tar xvf $@ --use-compress-prog=pixz }
function tarbzip2(){tar xvf $@ --use-compress-prog=pbzip2 }
```

なんでalias使わないかっていうと、--useなんちゃらがファイル名の後にこないとエラー吐かれるからです。

## git clone -b master --depth 1 hoge.com/hoge.git

これはツールというよりかはオプションの話です。
-b指定をすることで、クローンしてくるブランチを一つに指定できます。
また--depth 1指定をすることで、「シャロークローン」(shallow clone)と呼ばれる、最新のコミットしか取ってこないクローンになります。過去のコミットを見たりresetしたりすることができなくなります。

これらのオプションは、特に「gitの機能を使いたいわけではなくて、ただリポジトリをダウンロードをしたいだけ」なんかに有効です。
それなら最新のmasterのコミット一つだけで事足りますからね。

## make -j 4

Makefileをmakeするときに、-j 数字 をつけることで、ビルドが並列化されます。内部的には、一般ルールで処理するもの(.c -> .o)とかを並列化しているようです。とりあえずマシンのスレッド数ぶんつけておくと幸せになります。

## bundle install -j 4

makeと同じです。こっちはgemのインストールを並列化します。スレッド数ぶん書いておくといいです。
同時にgemをダウンロード&ビルド&インストールしてくれます。

## ccache

https://qiita.com/naohikowatanabe/items/a6cb8745737481b103e3
https://www.ibm.com/developerworks/jp/linux/library/l-ccache/index.html

これは、gccやg++のコンパイルの結果をキャッシュするもの。標準ライブラリだったり、あとはプロジェクトで同じファイルを毎回コンパイルしているときなんかに早くなる。いや、これマジでmakeが早くなる。

## distcc

https://wiki.archlinux.jp/index.php/Distcc
https://www.ibm.com/developerworks/jp/linux/library/l-distcc/index.html

これは、複数のマシンでgccやg++を走らせて、コンパイルを並列化するもの。
ネットワーク経由でソースコードを送信してコンパイルして返してもらうらしい。L3にいてTCPの疎通ができる範囲ならマシンは選ばないみたい、ただし、gccとかのバージョンはピリオド二つ目まで合わせる必要があるらしい。(4.1.1と4.1.2はOK。4.1.1と4.2.1はダメ)

あと、ssh経由でも動く。
なので、もし重いOSSをコンパイルするときだけ、AWSとかで高火力なインスタンスを借りて、そこと自分のマシンで分散するといいかもしれない。最近秒単位の課金ができるようになったことだし。

あとは学校とかにいいるなら学校や学科、研究室のサーバーを複数台無双するのも面白いかもしれない。
gcc本体のビルドが10分で終わったりする（実体験）

## nice renice

これはコマンドだけど、高速化の部類に入るのでここに書く。
niceは、プロセスの優先度を変えてコマンドを実行する（windowsのタスクマネージャーとかの優先度と同じ）で、他のタスクより優先したい場合、逆にあんまり優先させたくない場合に使える。

reniceは、すでに動いているプロセスの優先度を変えることができる。

# CUI便利系 :custard:

## whiptail

http://gihyo.jp/admin/serial/01/ubuntu-recipe/0422

これは、CUIでなんちゃってアスキーアートウィンドウをつくってくれるもの。
BIOSとか、OSのインストールディスクとかでみたことあるかもしれない。
入力ボックスやチェックボックスもつくってくれるので便利。

## zenity

https://sites.google.com/site/linuxnomemo/command-shell/zenity
http://d.hatena.ne.jp/kakurasan/20070716/p1

これはwhiptailと似てますが、こっちはGUIです。Xorgが持ついろいろな種類のダイアログをCUIコマンドから起動できて、返り値を環境変数に保存、なんて使い方ができます。
頑張ればシェル芸で完全なGUIツールを作ることができるかもしれない（簡単とは言ってない）

## 
## w3m

http://qh73xebitbucketorg.readthedocs.io/ja/latest/2.Tools/w3m/main/
http://news.mynavi.jp/articles/2013/07/09/w3m/

有名なテキストブラウザですね。似たものにlynxやelinksがあります。
CUIで動作するwebブラウザです。jsとcssは動作しないにしろ、サーバの中で作業するぶんには全然問題ないです。

また、w3m-imgってのがあって、libsixelを使って対応しているターミナルビュワーならターミナル状で画像を表示させる荒技が使えます。CUIやべぇ。それに対応していなくても枠なしウィンドウをターミナルに重ねて無理やり画像表示できます。まじやべえ。

他にもsixel使ってターミナルで画像表示する系は色々とある。
http://qiita.com/arakiken/items/3e4bc9a6e43af0198e46

使い方としては、

```bash
$ w3m google.com
```

みたいにして使えるけど、ローカルのファイルでも動く。
標準入力から読ませることもできる。

```bash
$ w3m ./index.html
$ cat ./index.html | w3m -
```

ローカルでphpを動かして、出力をCUIだけで見てみる、なんてこともできる。

```
$ php ./main.php | w3m -T text/html
```

また、別のコマンドである`pdftohtml`コマンドを使えば、CUIだけでpdfファイルの中身を確認できる。上のw3m-imgを組み合わせれば画像表示も可能。

```bash
$ pdftohtml -stdout hoge.pdf | w3m -T text/html
```

## mdr

https://goo.gl/mSX2bC

これは、markdownをCUIで表示させるものです。表とかもいい感じに表示してくれます（でも2幅文字はずれる）。ブラウザ開くまでもなくREADME.mdとか見るのに便利。特に表。

## jq

http://qiita.com/takeshinoda@github/items/2dec7a72930ec1f658af

これは、JSONをパースして表示してくれるツールです。phpのvar_dumpみたいな。

```bash

$ echo '{"name": "John Smith", "age": 33}' | jq .
{
  "name": "John Smith",
  "age": 33
}

$ echo '{"name": "John Smith", "age": 33}' | jq .name
"John Smith"
```

こんな感じに、ドットを区切りとして要素にアクセスできたり、また全体を綺麗に表示することができます。 


## fbterm jfbterm

https://wiki.archlinuxjp.org/index.php/Fbterm
http://www.itmedia.co.jp/enterprise/articles/0809/09/news011.html

これは鯖菅の間では有名かも。tty1とかの物理コンソールのCUIで2バイト文字表示したり、フォントサイズ調整したりするすごいやつ。CUIのときにカーネルが画面のデバドラと会話するのに使うfb（フレームバッファ）をフックして、なんちゃってGUIしてるみたい。とりあえず文字化けせずにCUIが使えるのは神。

設定の方法によっては物理コンソールのCUIで画像表示とか背景表紙とかできるらしい。
jfbtermは開発が終わってるのでfbtermの方がおすすめ。

フォントも指定できるので、一時期僕はこれで手書きフォントでサーバー運用してた（とてもみにくい）。

## uim-fep & uim系変換ツール

http://snowfly.air-nifty.com/wiz/2010/05/uim-fepanthy-52.html
https://goo.gl/XCG5B4

これはマイナーかも。上のfbtermと組み合わせないとほとんど利点を感じられないかもだけど、こいつはすごい。
CUIで漢字変換とローマ字入力ができる。もはやIME。
uim-fepだけじゃ変換やローマ字入力ができないので、uim系の変換ツールを入れないといけない。
uim-anthyとかuim-mozcとか色々あるので好みに合わせて使ってください。

## slack-tui

https://github.com/hikalium/slack-tui

これはCUI（TUI）でSlackができるツール。作者の方はSlack重すぎてきれそうで、重いのは多分GUIのせいだからだ！って思って作ったらしい。

## cacaview , libcaca

http://oplern.hatenablog.com/entry/2016/05/19/002754

これは、CUI上でアスキーアート使って画像表示するやつ。原始的だけど本当にどこでも動くのでおすすめ。
ちなみにこいつについてくるlibcacaってのをmplayerとビルドするとCUIでアスキーアートで動画みれたりする…。
サーバーでごちうさがみれるぞ！やった！

## mosh

http://gihyo.jp/admin/serial/01/ubuntu-recipe/0220
https://goo.gl/iyH4j4

googleが開発したudpでsshするやつ。認証部分はssh使う。
コネクション切れても勝手に復活するし強い。

## tmux , GNU screen

https://kanjuku-tomato.blogspot.jp/2014/02/tmux.html
http://qiita.com/nmrmsys/items/03f97f5eabec18a3a18b

https://wiki.archlinuxjp.org/index.php/GNU_Screen
http://note.crohaco.net/2015/gnu-screen-study/

こいつらはもう完全に有名。CUIでタブ表示や、それ以外にもでタッチしたり分割したりできるすごいやつ。
ちなみに、デフォルトシェルに設定するのではなく、シェルの中から起動したりbashrcなどから起動すると$PATH等に不具合が起こるためおすすめしません。とくにndenvとかでハマります。

## nethogs

http://loumo.jp/wp/archive/20150520000001/

グラフィカルに、今どのプロセスがどれくらいネットワーク帯域を食っているか確認できる。

## powertop

https://goo.gl/SyW1EH
https://wiki.archlinuxjp.org/index.php/Powertop


電力消費量を確認できる。今の消費電力とか、どのプロセスが電池食ってるとかわかる。

## tlp

https://goo.gl/QMyiqy
https://wiki.archlinuxjp.org/index.php/TLP

CPU周波数やその他ハードの設定を、バッテリー駆動のときとAC接続のときに分けて調整できる。
ディスクへの書き込みやファン、Intel turbo boost、など項目はたくさんある。
ノートPCのバッテリ少ない方は是非。

## fancontrol

http://www.inoshita.jp/freo/page/d2700_005
https://goo.gl/Pyzga3

パソコンの内部ファンを回す速度を変えらるやつ。
設定ファイルを書くことで、ファンを回し始める最低CPU温度や最高温度などを設定できます。
自分は、多少暑くなっても構わないのである一定を超えるとファンをぶん回すように設定しています。


# 便利系コマンド :wine_glass:

増えてきたので、こちらに移動しました！
http://qiita.com/onokatio/items/d303dcd5edbb22c14c02

# 他、名前だけ :curry:

neovim neobundele fish zplug git-worktree QUIC(SPDY) guaketerm sysrq docky synapse

気分次第で今後追加します。

# まとめ :rice_ball:

Linuxユーザーって割と変態が多いので、なにかしたいことがあったらもしかして？と思ったらいろいろと調べて見るといいと思います。そういうことに限ってだいたいあります。
ぜひ有効活用して見てください。

