---
title: エラー: file owned by 'fbterm-git' and 'ncurses': 'usr/share/terminfo/f/fbterm'と怒られるとき
tags: Linux archLinux
author: onokatio
slide: false
---
どうも。Archlinuxのパッケージマネージャを使っていると、毎回以下のように怒られるようになりました。
なお、パッケージ自体のインストールはきちんとできているようです。

```
:: パッケージの変更を処理しています...
:: トランザクション後のフックを実行...
エラー: file owned by 'fbterm-git' and 'ncurses': 'usr/share/terminfo/f/fbterm'
```

原因は、fbtermとncursesのパッケージが扱っているファイルが衝突していることが原因です。
なので、fbtermをインストールするときにPKGBUILDを編集します。


まず、一度fbtermをアンインストールします。その次に、もう一度インストールします。そのときにPKGBUILDを編集するかどうか聞かれるので、Yを入力しましょう。

```bash
$ yaourt -R fbterm-git
# 省略
$ yaourt -S fbterm-git

==> AUR から fbterm-git の PKGBUILD をダウンロード...

# 省略

fbterm-git 20150509-3  (2017-05-18 01:06)
( サポートがないパッケージ: 潜在的に危険です ! )
==> PKGBUILD を編集しますか ? [Y/n] ("A" で中止)
==> ----------------------------------
==> 
#ここでYを入力&エンター
```

そうすると、デフォルトエディタ(環境変数$EDITORのコマンド)が実行されるます。40行あたりに以下の行があると思うので、削除してください。

```
install -Dm644 terminfo/fbterm "${pkgdir}/usr/share/terminfo/f/fbterm"

```

これで、fbtermがterminfoに余計なファイルをインストールしないようになります。


参考: https://aur.archlinux.org/packages/fbterm-git/

