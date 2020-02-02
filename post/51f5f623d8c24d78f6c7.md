---
title: brewでマイナーバージョンを指定してFormulaを入れる方法
tags: homebrew brew Mac
author: onokatio
slide: false
---
brewでマイナーバージョンを指定してFormulaを入れる方法
mysqlをマイナーバージョンを固定してインストールさせたかった時にハマったのでメモ。
別にmysql以外にも使える

# やりたかったこと

brew install mysql@5.6.37とかやりたかった

# 問題

- そもそもbrewにバージョンの概念はあんまりない。
- mysqlのあとにアットマークがついたものがあるのは、あくまで別パッケージとして配布されてるだけ

# 調べてわかったこと

- homebrewのパッケージの中身はrubyのスクリプト
- スクリプトの中でバイナリをakamaiとかから落としてコピーとかしてる
- homebrewの実態は、めちゃくちゃ大きいgitでrubyのスクリプト管理してるだけ(https://github.com/homebrew/homebrew-core/)
- パッケージの中身のスクリプトが更新され、新しいバージョンのパッケージがスクリプトの中から落とされるようになることでアップデートできる
- homebrewがgit cloneしてきたパッケージ全体は`/usr/local/Homebrew/Library/Taps/homebrew/homebrew-core`以下にある。嘘だと思ったら上に書いてあるgithubリポジトリと見比べてみて。
- パッケージのrbファイルは`homrbrew/homebrew-core/Formula`にある(例: https://github.com/Homebrew/homebrew-core/blob/master/Formula/curl.rb)

じゃあ、gitの古いコミットから、入れたいマイナーバージョンの時のrubyスクリプトを見つけて、手元で実行するだけでいいんじゃ？

→それであってた

# やったこと

### githubで検索をかけて、mysql.rbのコミットを全部みた  

だめだった。タイムアウトが起こって（たぶん負荷が大きすぎた）、githubに「ちょっと荷が重いからお前自力でやれ！」って怒られた。

### とりあえず自分の手元(`/usr/.../homebrew-core/Formula`)で、`git log mysql@5.6.rb`してみた  

なんとlogが一個しか（最新版しか）表示されない。それもそのはず、homebrewでは高速化のために最新コミットしかダウンロードしてきてないらしい。

### `git fetch --unshallow` した

このコマンドで、リポジトリの全コミットを落としてこれると聞いたのでやってみた。
10分くらいかかった。

### もう一度`git log mysql@5.6.rb`してみた

ずら〜と出てきた。その中に自分が入れたいマイナーバージョンの最終コミットっぽいのがあったので、それのコミットIDをメモった。
> 例: 8a363290b68c1c6aa8fb22f90443f10b1fb70ecc

### githubの方で確認した

コミット番号からソースコードを確認するために、適当なコミットを開いて、URLのコミットIDを書き換えて、ページに飛んだ。
> 例: https://github.com/Homebrew/homebrew-core/blob/8a363290b68c1c6aa8fb22f90443f10b1fb70ecc/Formula/mysql@5.6.rb

### インストールしてみる

- 直接実行は難しそうだし、そもそもbrewの監視外になってしまう。
- 自分の手元でcheckoutする手もあるらしいけど、そもそもgit fetchにめちゃくちゃ時間かかるからみんなでやりたくない
- brew install にURL渡すとよしなに入れてくれるらしい←これに決定

とりあえずデータをそのまま見られるrawのURLをgithubから取ってくる。
> 例: https://raw.githubusercontent.com/Homebrew/homebrew-core/8a363290b68c1c6aa8fb22f90443f10b1fb70ecc/Formula/mysql%405.6.rb

そして、そのままbrew installに渡してみる。ここで注意なんだけど、chromeとかのアドレスバーからコピペすると、chromeが丁寧に@を%40にURLエンコードしてくれる。これだとうまく動かないので手動で@に直す。

```bash
$ brew install https://raw.githubusercontent.com/Homebrew/homebrew-core/8a363290b68c1c6aa8fb22f90443f10b1fb70ecc/Formula/mysql@5.6.rb
```

インストールできた。めでたしめでたし。

