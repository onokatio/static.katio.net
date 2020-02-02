---
title: ラズパイでシステムの状況をツイッターにつぶやこう (1)
tags: RaspberryPi Linux Twitter
author: onokatio
slide: false
---
## 作った理由
最近なんでもツイッターにつぶやくのが癖になってるので、じゃあ宅鯖のラズパイの状況つぶやいたらいいんじゃね？ってなった。

## 具体的な動作
Linux（ラズパイ）のCPU使用率、本体温度、プロセス数、メモリ使用量をツイッターでつぶやく

## じゃあ実際のコード
説明するのも無意味ですし、とりあえずぱぱっと作ったシェルスクリプトをどうぞ

```bash:test.sh
cpu=`vmstat|tail -n1|sed 's/[\t ]\+/\n/g'|tail -n5|head -n2|sed -e ':loop; N; $!b loop; ;s/\n/+/g'|bc`
total=`cat /proc/meminfo |/bin/grep "MemTotal"|/bin/grep -o -e '[0-9]'|sed -e ':loop; N; $!b loop; ;s/\n//g'`
free=`free|head -n3|tail -n1|/bin/grep -o -e '[0-9]*$'`
temp=`cat /sys/class/thermal/thermal_zone0/temp|cut -c1-2`
disk=`df -h -t ext4|/bin/grep -o '\([0-9]\)%'|sed -e 's/%//g'`
ps=`ps ax|/bin/grep -v 'VSZ|grep'|wc -l`

```
システム情報の見方を検索しながら、無理やり変数にぶち込んでます。僕は~~**変態**~~ワンライナーなのでsed,grep,head,tailを無双してます。もちろんコピペじゃなくて僕が考えましたよ。

とりあえずここまで来たのでツイート部分は明日。

追記：第二回を投稿しました。
http://qiita.com/onokatio/items/466665fcf6b0f2d12aea

