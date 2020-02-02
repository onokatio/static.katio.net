---
title: NginxでIndex of（ファイル一覧）を表示させる
tags: Linux nginx
author: onokatio
slide: false
---
indexファイルがなかった時に、そのディレクトリ内のファイル一覧を自動表示するNginxの機能を使ってみます。容量単位表示・更新時間のロケール変更も対応。自分用メモ。

server{}でもlocation{}でもいいので、nginx.confに以下を追記する。

```
autoindex on;
autoindex_exact_size off;
autoindex_localtime on;
```

 一行目から順に、autoindex有効化、容量を単位付きで表示、時間のロケールをローカルに変更（デフォルトでUTC）にしている。以上。

