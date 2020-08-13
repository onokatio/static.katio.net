---
title: "Source Han Monoフォントをnerd font化して使ってみる"
date: 2019-12-08 02:17:00 +0900
---

Source Han Monoフォントをnerd font化して使ってみる
===

この記事は、[onokatio Advent Calendar 2019](https://blog.katio.net/adventcalendar/2019/onokatio) 7日目の記事です。  

皆さん、ターミナルやエディタのフォントは何を使っていますでしょうか。Mac OSであればMonaco、UbuntuであればUbuntu Monoなどが有名どころかなと思います。

自分は、Noto Sans CJK Mono -> Ubuntu Mono -> Source Han Code JPという遍歴をたどり、ちょうど今Source Han Monoへと乗り換えようとしています。

# Source Han Monoとは

僕は回し者じゃないです（これ重要）

Source Han Monoは、元はSource Han Code JPという日本語むけ等幅フォントを、Pan-CJK（中国韓国日本台湾香港）向けに機能追加したものです。  
Source Han Code JPは、Source Han Sans JP等幅という日本語フォントと、Source Code Proと呼ばれる等幅英字フォントの合体らしく‥。こんがらがってくるのでココらへんで家系図をたどるのは止めましょう。

つまりは、AdobeやGoogleが開発に参加した、様々な国の言語が入っているターミナル/コーディング用フォントです。

そのままでも十分きれいなのですが、今回はこれにnerd fontを追加します。

# Nerd Fontとは

Nerd Fontという名前のフォントが実際にあるわけではなく、中身は複数のフォントの集合体です。

https://github.com/ryanoasis/nerd-fonts

Nerd Fontは、ターミナルやエディタで、記号や絵文字、マークを表示するために使う様々なフォントを、既存のフォントにパッチとして当てることができます。

Nerd Fontに含まれているフォントには、以下があります。


![](https://raw.githubusercontent.com/ryanoasis/nerd-fonts/master/images/sankey-glyphs-combined-diagram.svg?sanitize=true)

vimのPowerlineプラグインに使われているPowerline Fontや、awesome Fontは有名だと思います。

ということで、改めて説明すると、今回の目的は **Source Han Monoフォント環境でも、vimやtmuxのアイコンがちゃんと動くようにしたい！！！** です。

# やっていき

やっていきます。手順は大雑把に3つで、

- Source Han Monoフォントをダウンロードする
- Nerd Font PatcherをダウンロードしてSource Han Monoへ適用する
- 出来上がったフォントをインストールする

となります。

## Source Han Monoをダウンロードする

Source Han Monoはgithub releaseからダウンロードできます。

https://github.com/adobe-fonts/source-han-mono/releases

最新版の.ttc形式のファイルを任意のディレクトリにダウンロードしてきてください。
ちなみに、.ttcというのは複数の.ttfファイルを連結した形式です。Source Han Monoでは、薄さが違う複数のフォントが提供されています。

まず、ttcをttfへ分解します。ty-edelweissさんという方が、便利なツールを作ってくださっているのでそれを使いましょう。

https://github.com/ty-edelweiss/source-han-code-jp-powerline/blob/master/bin/ttc2ttf

これを保存し、chmod +xとでもしておきます。

>ちなみに、この方はSource Han Code JP(Source Han Monoの先駆け)へpowerlineをパッチする記事を書かれています。
>
>https://qiita.com/ty-edelweiss/items/6a330319e11736807783

保存したら、`./ttc2ttf ./SourceHanMono.ttc`を実行しましょう。

※2019年現在、試してみたところ、python2のpipが動かなくなったため、このコマンドが動かなくなっていました。その場合代わりにこちらを使用します。 https://gist.github.com/lilydjwg/8877450

※更に追記上のコードもうまく動かなかったので、otfを直接ダウンロードします。 https://github.com/adobe-fonts/source-han-mono/blob/master/Regular/OTC/SourceHanMono-Regular.otf

## Nerd Font Patcherを使って、フォントへパッチを当てる

ryanoasis/nerd-fontsをクローンします。

```shell
git clone https://github.com/ryanoasis/nerd-fonts --depth 1
```

で、パッチします。

```shell
./font-patcher ~/Downloads/SourceHanMono-Regular.otf
```

ここでSegmentation Faultが発生しました…。悲しい。
ということでこの記事は一旦ここまでです。ついでに発生したバグをIssueにまとめました。もし解決できる方がいればぜひともプルリクエストお願い致します。

https://github.com/fontforge/fontforge/issues/4047
