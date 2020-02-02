---
title: Archlinuxの最新tlpで、「printf: 書き込みエラー: 無効な引数です」と表示される場合
tags: Linux archLinux tlp
author: onokatio
slide: false
---
https://github.com/linrunner/TLP/issues/271

ここで指摘されているとおり、既知のバグのようです。
gitの方では修正コミットが入っていますが、pacmanから入るtlpだとまだ取り込まれていない様子です。
なので、AURにあるtlp-gitを導入すれば治ります。


```bash
$ yaourt -S tlp-git
```

