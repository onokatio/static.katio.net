---
title: Linuxで、コマンドだけでyoutubeから動画をダウンロードして任意の時間を切り出してgifアニ化する
tags: Linux YouTube gif ffmpeg youtube-dl
author: onokatio
slide: false
---
メモ。違法ダウンロードを冗長するものではありません。

## Youtubeでダウンロードしたい動画を見つけて、URLをコピる。

```
https://www.youtube.com/watch?v=hogehoge
```
みたいなかんじ。

## yotube-dlコマンドを使い、動画をダウンロードする。

以下のようにしてyoutube-dlをインストールする。

```bash
$ sudo curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl
$ sudo chmod a+rx /usr/local/bin/youtube-dl
```

MacOSならbrewでも入る

```bash
$ brew install youtube-dl
```

pipでもいい

```bash
$ sudo pip install --upgrade youtube_dl
```


ダウンロードできたら、まずは-Fオプションを付けて、ダウンロードできる動画の種類を確認する。

```bash
$ youtube-dl -F https://www.youtube.com/watch?v=hogehoge

[youtube] hoge: Downloading webpage
[youtube] hoge: Downloading video info webpage
[youtube] hoge: Extracting video information
[youtube] hoge: Downloading MPD manifest
[info] Available formats for hoge:
format code  extension  resolution note
139          m4a        audio only DASH audio   49k , m4a_dash container, mp4a.40.5@ 48k (22050Hz)
249          webm       audio only DASH audio   61k , opus @ 50k, 3.00MiB
250          webm       audio only DASH audio   78k , opus @ 70k, 3.81MiB
171          webm       audio only DASH audio  124k , vorbis@128k, 5.91MiB
140          m4a        audio only DASH audio  128k , m4a_dash container, mp4a.40.2@128k (44100Hz)
251          webm       audio only DASH audio  150k , opus @160k, 7.11MiB
160          mp4        256x144    DASH video   72k , avc1.4d400c, 24fps, video only
278          webm       256x144    144p  110k , webm container, vp9, 24fps, video only, 4.38MiB
133          mp4        426x240    DASH video  136k , avc1.4d4015, 24fps, video only
242          webm       426x240    240p  216k , vp9, 24fps, video only, 6.56MiB
134          mp4        640x360    DASH video  314k , avc1.4d401e, 24fps, video only
243          webm       640x360    360p  404k , vp9, 24fps, video only, 11.71MiB
135          mp4        854x480    DASH video  565k , avc1.4d401e, 24fps, video only
244          webm       854x480    480p  690k , vp9, 24fps, video only, 18.09MiB
136          mp4        1280x720   DASH video  928k , avc1.4d401f, 24fps, video only
247          webm       1280x720   720p 1350k , vp9, 24fps, video only, 35.56MiB
17           3gp        176x144    small , mp4v.20.3, mp4a.40.2@ 24k
36           3gp        320x180    small , mp4v.20.3, mp4a.40.2
43           webm       640x360    medium , vp8.0, vorbis@128k
18           mp4        640x360    medium , avc1.42001E, mp4a.40.2@ 96k
22           mp4        1280x720   hd720 , avc1.64001F, mp4a.40.2@192k (best)

```

色々でてくるので、たとえば解像度が640x360で形式がmp4のファイルをダウンロードしたかったら18という数字を覚えておく。

次に、さっきのIDを使って動画をダウンロードする。

```bash
$ youtube-dl -f 18 https://www.youtube.com/watch?v=hogehoge
```

カレントディレクトリに、`動画の名前.mp4`というファイルができる。

## ffmpegを使って、任意の場所を切り出す。

ffmpegがはいっていない場合は、`sudo apt-get install ffmpeg`とか`brew instal ffmpeg`で入れてください。

```bash
$ ffmpeg -ss 切り出し開始時間 -i 入力ファイル名 -t 切り出す秒数 出力ファイル名
```

たとえば、以下のようになると思います。

```bash
$ ffmpeg -ss 143.5 -i hoge.mp4 -t 1.3 hoge2.mp4
```

これで、hoge.mp4の143秒目から145秒だけが抜き出されてhoge2.mp4として保存されます。確認して、気に食わなかったら秒数を変えてまた試してみてください。

## ffmpegを使って、mp4とgifアニメに変換する

```bash
$ ffmpeg -i hoge2.mp4 -an -r 15 -pix_fmt rgb24 -f git hige.gif
```

これでgitアニメができました。


# 参考

https://qiita.com/kitar/items/d293e3962ade087fd850
http://takuya-1st.hatenablog.jp/entry/2015/07/15/002701

