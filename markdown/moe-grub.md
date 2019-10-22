---
title: パソコンのブートローダーを痛grubにする
date: 2019-07-15 16:33:56 +0900
---

パソコンのブートローダーを痛grubにする
===

ヲタ活してますか。
秋葉原の電気街を歩いていると、アニメやゲームのキャラクターイラストを全面に散りばめた「痛車」に出会うことも、今年では少なくなってまいりました。

ソフトウェアエンジニアの皆様に置かれましては、似たような文化として、Mac Book Proの全面にステッカーを貼られているのではないでしょうか。

ラップトップの筐体にステッカーを貼る行為は、その動機や風習が大変興味深いものとなっていますが、一説によると「自分の趣味を他人に知ってもらいたい」などが挙げられるようです。

さて、Linuxをお使いの方には身近であろうブートローダー。有名なものとしてはgrub2がよく知られています。

このブートローダーに、自分の趣味をアクセントとして折り込み、個性を出したいと思う方は少なくないはずです。

今回は、grubを趣味全面にカスタマイズし、「痛grub」を作ります。

# カスタム内容

- 今回メインテーマとして採用するキャラクターは、「俺の妹がこんなに可愛いわけがない」メインヒロインの高坂桐乃です。 https://www.google.com/search?q=%E9%AB%98%E5%9D%82%E6%A1%90%E4%B9%83
- grubの背景画像を萌え要素の高いキャラクター画像に差し替える
- 文字フォントを、萌え要素の高い手書きフォントに設定する
- キー入力がない限り、メニューを非表示にする
- エントリー選択文字色を萌え萌えな色に変更する

# grubの背景画像を萌え要素の高いキャラクター画像に差し替える

任意の画像を`/boot`以下へ移動します。

次に、`/etc/default/grub`を以下のように編集します。

```diff
diff --git a/default/grub b/default/grub
index 1995667..d94d609 100644
--- a/default/grub
+++ b/default/grub
@@ -43,7 +43,7 @@ GRUB_DISABLE_RECOVERY=true
 #GRUB_COLOR_HIGHLIGHT="light-cyan/blue"
 
 # Uncomment one of them for the gfx desired, a image background or a gfxtheme
-#GRUB_BACKGROUND="/path/to/wallpaper"
+GRUB_BACKGROUND="/boot/grub.jpg"
 #GRUB_THEME="/path/to/gfxtheme"
 
 # Uncomment to get a beep at GRUB start
```

# 文字フォントを、萌え要素の高い手書きフォントに設定する

- https://www.flopdesign.com/font2/mio.html
- https://www.flopdesign.com/font2/haruka.html
- http://www001.upp.so-net.ne.jp/mikachan/

上記のような、萌フォントを取得してきます。

ttfファイルをpf2に変換します。

```
$ grub-mkfont -o ./hoge.pf2 -s 16 ./hoge.ttf
```

-sのあとの数値はフォントサイズです。
これで、pf2形式のフォントが生成されます。

フォントを/boot/grub/fonts/に移動し、`/etc/default/grub`に以下を追加します。

```
GRUB_FONT="/boot/grub/fonts/MioW4.pf2"
```

# キー入力がない限り、メニューを非表示にする

```diff
diff --git a/default/grub b/default/grub
index b5023d2..2d25dfb 100644
--- a/default/grub
+++ b/default/grub
@@ -1,7 +1,7 @@
 # GRUB boot loader configuration
 
 GRUB_DEFAULT=0
-GRUB_TIMEOUT=5
+GRUB_TIMEOUT=0
 GRUB_DISTRIBUTOR="Arch"
 GRUB_CMDLINE_LINUX="cryptdevice=PARTUUID=d8f58add-82a9-a34f-8d18-cb3877396a0e:cryptlvm:header"
 GRUB_CMDLINE_LINUX_DEFAULT="cryptdevice=PARTUUID=d8f58add-82a9-a34f-8d18-cb3877396a0e:cryptlvm:header resume=/dev/mapper/kirino-swap nowatchdog audit=0"
@@ -13,8 +13,8 @@ GRUB_PRELOAD_MODULES="part_gpt part_msdos"
 GRUB_ENABLE_CRYPTODISK=y
 
 # Uncomment to enable Hidden Menu, and optionally hide the timeout count
-#GRUB_HIDDEN_TIMEOUT=5
-#GRUB_HIDDEN_TIMEOUT_QUIET=true
+GRUB_HIDDEN_TIMEOUT=1
+GRUB_HIDDEN_TIMEOUT_QUIET=false
 
 # Uncomment to use basic console
 GRUB_TERMINAL_INPUT=console
```

# エントリー選択文字色を萌え萌えな色に変更する


以下のように、GRUB_FONT変数を設定します。light-magenta/blackとlight-red/magentaの組み合わせが一番萌えました。（個人の感想）

```diff
diff --git a/default/grub b/default/grub
index b5023d2..79b1bb8 100644
--- a/default/grub
+++ b/default/grub
@@ -39,8 +39,8 @@ GRUB_DISABLE_RECOVERY=true
 
 # Uncomment and set to the desired menu colors.  Used by normal and wallpaper
 # modes only.  Entries specified as foreground/background.
-#GRUB_COLOR_NORMAL="light-blue/black"
-#GRUB_COLOR_HIGHLIGHT="light-cyan/blue"
+GRUB_COLOR_NORMAL="light-magenta/black"
+GRUB_COLOR_HIGHLIGHT="light-red/magenta"

```

以上で、萌grubの完成です。
