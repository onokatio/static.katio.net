---
title: "自作ブログにスライド表示機能をつけた"
date: 2019-12-09 23:53:00 +0900
---

自作ブログにスライド表示機能をつけた
===

この記事は、[onokatio Advent Calendar 2019](/adventcalendar/2019/onokatio) 8日目の記事です。  

以前、このブログは自力でスクラッチから作成していると話しました。今回、ブログにマークダウンで書いた文章をスライドとして表示させる機能を追加したので、ゆるく解説します。

ちなみに今回の当該コミットはこれです。

https://github.com/onokatio/blog.katio.net/commit/bede63bd382b597f2a47ef978e6f5c79db90fe7e

# 使用したライブラリ

- reveal.js

# 実装

`/slide/test`へアクセスが来ると、`https://static.katio.net/slide/test.md`からマークダウンを引っ張ってきて、Reveal.jsへそれを食わせてスライドを生成します。

## ルーターへの登録

まず、さくっと`/slide/`をルーターに登録します。

```js=
const UpdatePageFromUrl = () => {
 			return RenderIndex()
 		}else if( location.pathname.startsWith('/adventcalendar/2019/onokatio') ){
 			return RenderAdventCalendar()
+		} else if ( location.pathname.startsWith('/slide/') ) {
+			return RenderSlide(filename)
 		} else if ( location.pathname.startsWith('/page/') ) {
 			const filename = 'post/' + location.pathname.slice(6) + '.md'
 			if ( isValidFileName(filename) ) filename = 'post/404.md';
```

## RenderSlideを作る

```js=
const RenderSlide = filename => {
		return fetch('https://static.katio.net/' + filename)
			.then( (response) => {
				return response.text()
			})
			.then ( (text) => {
				const revealdiv = document.createElement("div")
				revealdiv.className = "reveal"

				const slide = document.createElement("div")
				slide.className = "slides"

				const section = document.createElement("section")
				section.setAttribute("data-markdown","")
				section.innerText = text

				slide.appendChild(section)
				revealdiv.appendChild(slide)

				const markdown = document.getElementById("markdown")
				markdown.innerText = ''
				document.getElementsByClassName("container")[0].insertBefore(revealdiv, markdown)

				Reveal.initialize({
					dependencies: [
						{ src: 'https://cdnjs.cloudflare.com/ajax/libs/reveal.js/3.8.0/plugin/markdown/marked.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
						{ src: 'https://cdnjs.cloudflare.com/ajax/libs/reveal.js/3.8.0/plugin/markdown/markdown.min.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
					]
				})
			})
}
```

ちょっと長くて読みにくいですが、Reveal.jsに必要なDOMを構築しているだけです。  
fetchしてきたマークダウンをinnerTextへ代入しています。

また、プラグインとしてマークダウン対応するようにも設定します。
## htmlでjsをロードする

```html=
diff --git a/index.html b/index.html
index 2dd857a..05cdbb9 100644
--- a/index.html
+++ b/index.html
@@ -25,6 +25,9 @@
     <link rel="stylesheet" href="https://cdn.honokak.osaka/honoka/4.3.1/css/bootstrap.min.css">
     <!--link rel="stylesheet" href="/github-markdown.css"-->
     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/3.0.1/github-markdown.min.css" integrity="sha384-4egj0UshiufDcIR8Pq4ulYCx/jvrTih6oEvE7+gfNChsPHNn+OhNN35wMK58G3bf" crossorigin="anonymous">
+    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/3.8.0/css/reset.min.css" integrity="sha256-5/N9vOsEFEeDStOZCuE/rpwRcijUVFx6RY5vjx1usCc=" crossorigin="anonymous" />
+    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/3.8.0/css/reveal.min.css" integrity="sha256-OxiHrn+gXudPDHxTvXiQzeFjZU/FllSSPmOOYAZ1O/g=" crossorigin="anonymous" />
+    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/3.8.0/css/theme/black.min.css" id="theme" integrity="sha256-FMkhwnY485HRoNNbvFB6F2PHHAfpGSbJQwgGXSCPozM=" crossorigin="anonymous" />
     <link rel="stylesheet" href='/reset.css'>
     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.10/styles/solarized-dark.min.css" integrity="sha384-p6WZvQLdHPn3qN+qHxW8HTPV11ZECxUCxol/Rg+glNgBrkyTUwNiPIrXE2EESD3z" crossorigin="anonymous">
     <link rel="stylesheet" href='/main.css'>
@@ -35,6 +38,7 @@
     <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/emoji-toolkit@5.0.5/extras/css/joypixels.min.css" integrity="sha384-4ok+tBQQdy5hcPT56tzcE11yQ2BkN0Py1uDE8ZOiXYstHOpUB61pJafm+NidByp4" crossorigin="anonymous">
     <script src="https://unpkg.com/js-yaml@3.10.0/dist/js-yaml.js" integrity="sha384-cY0ULDNUwCmKVeDufJIkNSqK9IQ1ZIoU4TwvxM6GNnZTKK9Nw8VV2LV713fM65y+" crossorigin="anonymous"></script>
     <script src="https://dworthen.github.io/js-yaml-front-matter/js/yamlFront.js" integrity="sha384-hWTBZNUClJ/7lOikHmMpXDMZakW+0EwfMwMfk2IQDhy6Bw2QnO9KJMIWUP7/Jxy7" crossorigin="anonymous"></script>
+    <script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/3.8.0/js/reveal.js" integrity="sha256-jtcENl8rkEXiIgaE02PeFrFJfni/dKi61+2m9QJhnJs=" crossorigin="anonymous"></script>
 
     <meta content='width=device-width, initial-scale=1, shrink-to-fit=no' name='viewport'>
 
@@ -67,6 +71,7 @@
 
 	<script src="/RenderIndex.js"> </script>
 	<script src="/RenderMarkdown.js"> </script>
+	<script src="/RenderSlide.js"> </script>
 	<script src="/RenderAdventCalendar.js"> </script>
 	<script src="/index.js"> </script>
   </body>
```

## CSSの追加

Reveal.jsは、本来インラインではなくビューポート全体を使う前提のライブラリです。それを、サイズを決めて表示させるためにwidthをheightを弄ります。

```css=
.reveal {
	width: 70vmin;
	height: 70vmin;
}

body {
	background: #fff;
	background-color: #fff;
}

.reveal {
	background-color: #000;
}
```

vminはvmとvhのどちらか小さい方らしいです。自分は今回`vw`と`vh`を`min-height`と`min-width`で使おうと調べていて、初めて知りました。

# 完成

あとは、マークダウンをリポジトリに置くだけでスライドが描画されます。
ライブラリを使ったので、これだけで実装できました。

![](https://static.katio.net/image/blog-slide1.png)
![](https://static.katio.net/image/blog-slide2.png)

今の所、テスト用以外何もスライドを作っていません。これから追加していきたいと思います。
目標としては、hackmd互換のスライドです。

# 気になったところなど

Reveal.jsについては、うまくマークダウンがパースされず、実際画像でも箇条書きが崩れています。dataアトリビュートらへんをちゃんと弄れてないので要検証です。

また、生jsで書くのが辛くなってきました。DOMをcreateElementするのが辛いので、そろそろjsx/Reactを導入するときかなという所感です。
