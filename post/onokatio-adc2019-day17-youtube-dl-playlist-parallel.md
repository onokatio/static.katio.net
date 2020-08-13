---
title: "Youtube-dlでプレイリストの並列ダウンロードを行う"
date: 2019-12-18 01:52:00 +0900
---

Youtube-dlでプレイリストの並列ダウンロードを行う
===

この記事は、[onokatio Advent Calendar 2019](/adventcalendar/2019/onokatio) 17日目の記事です。本来であればReact第3弾を書こうと思っていたのですが、少し時間がなく今回は走り書き程度の記事になっています。

Youtubeでプレイリストを並列ダウンロードしたい場合、以下のIssueに乗っている方法が使えます。

https://github.com/ytdl-org/youtube-dl/issues/350

ただ、より簡単に実装できたので軽くメモしておきます。

# 実装

シェルスクリプトは以下です。

```shell
#!/bin/bash

pids=()

function stop_all_thread(){
        kill -9 ${pids[@]}
        echo 'stopped all thread.'
}


youtube-dl -j --flat-playlist $1 | jq -r .url > url.txt

shift

while read line
do
        youtube-dl $@ "https://www.youtube.com/watch?v=${line}" &
        pids[$!]=$!
done < url.txt

trap "stop_all_thread" 2

wait
```

# 解説

解説するまでもなさそうですが、あとから読んでわかりやすいように少し書き留めておきます。

まず、第一引数にYoutubeのプレイリストURLが指定されると、youtube-dlの`-j --flat-playlist`オプションで、動画情報を一切取得せず高速にプレイリストに含まれる動画URLのみを出力します。

それを、while文で一行ごとにyoutube-dlへ渡し、バッググラウンド実行しています。

最後に、バッググラウンド実行したすべてのプロセスを`wait`で待つわけですが、その前にtrap関数を入れています。

このおかげで、Ctrl+cが入力された場合、バッググラウンドプロセスが残らないように`stop_all_thread`関数によってすべてkillされます。