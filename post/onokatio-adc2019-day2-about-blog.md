---
title: "ぼくのかんがえたさいきょうのぶろぐふれーむわーくをつくってみた"
date: 2019-12-03 00:22:00 +0900
---

ぼくのかんがえたさいきょうのぶろぐふれーむわーくをつくってみた
===

こんばんわ。ぼくのなまえはおのかちおです。しゅみでぷろぐらみんぐをしています。

茶番はここらへんで。この記事は [onokatio Advent Calendar 2019](https://blog.katio.net/adventcalendar/2019/onokatio) 2日目の記事です。

今回は、このアドベントカレンダーやブログ記事などを提供している、自作ブログフレームワークもどきについて、自慢と技術的なバックエンドの解説をしていこうかなと思います。

# 歴史的経緯

2018年当初、自分のプロフィールサイトは簡素なものでした。bootstrapを使い、簡単な自己紹介とスキルセットを書いたものです。

その当時、自分は技術記事をQiitaへ投稿していました。  
ただ、Qiitaでは技術に関係ない記事を書けない、かつページビューが伸びたところで収益につながらない、という悩みがありました。  
もちろん、はてなブログなどにブログを解説し、そこへ公開すれば良いのですが、自己の勉強も兼ねてブログサイトを一から作成するという決断に至りました。

作成するにあたって決定した、今でも変わらない方針があります。それは

- 作っていて楽しいこと（意味: 楽しくないことはやらない）
- 自分の詰め込める技術極限まで詰め込むこと（意味: ひと目ブログの技術スタックを見ただけで、自分のスキルセットを理解してもらいたい）
- 車輪をたくさん再開発する（意味: 1回便利なツールを使わずに趣味開発をすると、そのツールやライブラリ、フレームワークが生まれた意義、困難を理解できる、はず）

その結果発想したのが「自力でブログのフレームワークを自力で作る」という選択肢です。

その後、プロフィールサイトを魔改造してブログを運営する狂気じみたチャレンジが始まりました。

# バージョン0.1 技術スタックの決定と最小実装

https://github.com/onokatio/blog.katio.net/commit/be11b822f5b35d6ef8bcffe16142126b3ffff114?diff=unified

これが、プロフィールサイトをブログへ変更した最初のコミットです。またこのコミットのバージョンを0.1と呼んでいます。  
もちろん、0.1はあとからつけたバージョンであり、当時はこれがHEADでした。

技術スタックとしては、「マークダウンを書いてgithubにプッシュして、それがブログに反映されたら面白いよね」の発想から、github pages + marked.jsを採用しました。

以下にコードを示します。

```js
    <script>
		const converter = new showdown.Converter()
		converter.setOption('simplifiedAutoLink','true')
		converter.setOption('strikethrough','true')
		converter.setOption('tables','true')
		converter.setOption('tablesHeaderId','true')
		converter.setOption('tasklists','true')
		converter.setOption('simpleLineBreaks','true')
		converter.setOption('emoji','true')
		converter.setOption('metadata','true')
		const UpdateMarkdown = markdownUrl => {
			document.getElementById("markdown").textContent = 'loading ...'
			const fetchMarkdown = async () => {
				const markdown = await fetch(markdownUrl)
				const json = await markdown.text()
				const html = converter.makeHtml(json)
				document.getElementById("markdown").textContent = ''
				document.getElementById("markdown").insertAdjacentHTML('afterbegin',html)
				document.getElementById('gobacklink').style.display = 'inline'
			}
			fetchMarkdown()
		}
		const hashChangeEvent = () => {
			if (location.hash === ('#/') || location.hash === ('')) {
				UpdateMarkdown('https://raw.githubusercontent.com/onokatio/blog/master/index.md')
			} else if (location.hash.startsWith('#/page/')) {
				UpdateMarkdown('https://raw.githubusercontent.com/onokatio/blog/master/' + location.hash.slice(7) + '.md')
			}
		}
		window.onhashchange = hashChangeEvent
		hashChangeEvent()
	</script>
```

短いですが、これで今までのブログの根幹が出来上がっています。  
やっていることは簡単で、`https://blog.katio.net/#/page/hoge`にアクセスが来ると、別リポジトリにおいてある`https://raw.githubusercontent.com/onokatio/blog/master/hoge.md`をfetchし、マークダウンとしてコンパイル・描画しています。

hugo等は使わずに自力で実装したい、ただアクセスが来る前に事前にファイルを静的に展開しておくのは面白くない、という考えから、毎回ハッシュを見て動的にページの内容を描画しています。

当時ハッシュを使っていた理由は、github pagesではrewriteが使えず、index.htmlがルート以下のすべてのリクエストを受け取るようにするにはどうすればいいか考えた末の、苦肉の策です。

ここからは、些細な修正を繰り返し、比較的安定し動作するようになったバージョンを1.0と名付けました。

# バージョン2.0 'ブログとして欲しい機能'を実装する

2.0では、大きく以下の変更点があります。

## highlight.jsによる、マークダウンのコードブロックへのハイライト

これは題そのままです。highlight.jsを導入しました。

実装は簡単で、marked.js側でハイライトの提供を有効にするだけです。

```js
		marked.setOptions({
			renderer: renderer,
			langPrefix: 'hljs ',
			highlight: (code) => hljs.highlightAuto(code).value,
		})
 ```

## smooth jumpの実装

smooth jumpを実装しました。この命名はオリジナルです。  
要は、サイト内リンクをクリックすると、ページは再読込をせずに一部のDOMだけが変更され一瞬でページが宣する機能です。

主に以下のように実装されています。

```js
		const smoothJump = (event) => {
			event.preventDefault()
			event.stopPropagation()
			history.pushState(null, null, event.target.pathname)
			UpdateDomFromUrl()
			return false;
		}
```

```js
			markdownPromise.then( () => {
				const container = document.getElementById('markdown')
				container.innerHTML = joypixels.shortnameToUnicode(container.innerHTML)
				Array.prototype.forEach.call(container.getElementsByTagName('a'), (element) => {
					if( element.pathname.startsWith('/page/') || element.pathname === '/'){
						element.addEventListener('click', smoothJump )
					}
				})
			})
```

サイト内リンク全てに対して、クリックされたときのイベントをキャンセルし`UpdateDomFromUrl`を実行しています。この関数は、URLを元にマークダウンをfetch、rendering、insertする関数です。このため、このサイト内のリンクはすべてリロードが発生せず、マークダウン部分のみ更新が置きます。

## netlifyの導入

github pagesではなく、netlifyを導入しました。これが大きな転機でした。

### netlify rewriteを使った、ハッシュ方式から通常のURL方式への移行

netlifyでは、redirectとrewriteが可能です。例えばドキュメントルートに以下のように`_redirects`という名前のファイルを作成します。

```toml
/* / 200
```

これだけで、`/*`へのアクセスが全て内部的に`/`(/index.html)へのアクセスとして扱われます。リダイレクトではないので、ブラウザではURLは変わりません。  
これにより、ハッシュを使わないURL設計が可能になりました。  
2019年12月現在、ブログ記事のアドレスは`https://blog.katio.net/page/hoge`になっています。

そのため、コードには以下のような変更が発生しました。

```js
			pathname = location.pathname
			if ( pathname.startsWith('/page/') ) {
				filename = 'markdown/' + location.pathname.slice(6) + '.md'
				if ( ! filename.match( /^[a-zA-Z0-9-0_\.\-\/]+$/ ) ) filename = 'markdown/404.md'
			} else if ( pathname === '/') {
				filename = 'markdown/index.md'
			} else {
				filename = 'markdown/404.md'
			}
```

ずいぶんと無茶をしていますが、要するに正規表現でパスから現在読み出すべきマークダウンのファイル名を取得しています。

### netlify prerenderingを使った、OGPへの対応

Googleはbotがjsを一定時間実行し、DOMから検索キーワードを抽出してくれるのですが、Twitterやfacebookのbotはjsを実行してくれません。つまり、jsに頼らずにアクセス時点でOGPタグが記事ごとに用意されている必要がありました。

netlifyには、一部のbotアクセス時にjsを事前レンダリングしたhtmlを返してくれる機能があります。これを使い、jsではあとからogp metaタグを追加するだけでよくなりました。

```js
document.querySelector("meta[name='description']").setAttribute('content', summary)
document.querySelector("meta[property='og:description']").setAttribute('content', summary)
document.querySelector("meta[property='og:title']").setAttribute('content', title + " - おのかちお's blog")
```

### yaml metadataを使った、記事一覧と概要の自動生成

今まで、記事一覧に関しては、新しい記事が増えるたびに手動でトップページ用のマークダウンファイルにリンクを追加していました。これが面倒だったため、トップページ（記事一覧）を自動生成したいと考えました。

このサイトでは、ブログではないマークダウンを置く専用のリポジトリがあり、そこにマークダウンを保管しています。

https://github.com/onokatio/static.katio.net/tree/master/post

このリポジトリにCIを追加し、以下のようなnode.jsファイルが動作するようにしました。

```js
fs.readdir('./post')
	.then( (files) => {
		files = files.filter( (filename) => filename.endsWith('.md'))
			.filter( (filename) => filename !== ('index.md') )
			.filter( (filename) => filename !== ('404.md') )
		readPromises = files.map( (filename) => {
			return fs.readFile('./post/' + filename, "utf-8")
				.then( (content) => Promise.resolve([content, filename]) )
		})
		Promise.all(readPromises).then( (contents) => {
			const summaries = contents.map( ([content, filename]) => {
				metadata = yamlFront.safeLoadFront(content)
				content = metadata.__content
				delete metadata.__content

				const hackmd_title_regex = /^\n*(.+)\n=+/
				const markdown_title_regex = /^\n*# (.+)\n/

				let title
				if( metadata.title != undefined ){
					title = metadata.title
				}else if( ( result = content.match(hackmd_title_regex) ) !== null){
					title = result[0].replace(hackmd_title_regex,'$1')
				}else if( ( result = content.match(markdown_title_regex)) !== null){
					title = result[0].replace(markdown_title_regex,'$1')
				}else{
					title = 'Failed to get title'
				}
				content = content.replace(hackmd_title_regex,'') // remove (title \n ===)
					.replace(markdown_title_regex,'')          // remove (# title\n)
					.replace(/\n#+ /g,'\n')         // remove markdown sharp
					.replace(/`/g,'')               // remove markdown back quote
					.replace(/^ +- /g,'')           // remove markdown hyphen
					.replace(/\!?\[(.*)\]\((.+)\)/g,'$1') // remove markdown link
					.replace(/:[a-zA-Z]+:/g,'')     // remove emoji
					.replace(/\n/g,' ')             // replace newline to space
					.replace(/^ +/,'')              // delete prefix space

				return {  filename: filename, title: title, summary: content.slice(0,200), metadata: metadata }
			})
			summaries.sort( (item1,item2) => {
				/*
				 * a < b : 1
				 * a = b : 0
				 * a > b : -1
				 */
				if (item1.metadata.date == undefined) return 1
				if (item2.metadata.date == undefined) return -1

				data1 = moment(item1.metadata.date, "YYYY-MM-DD HH:mm:ss z")
				data2 = moment(item2.metadata.date, "YYYY-MM-DD HH:mm:ss z")

				if(data1.isBefore(data2)) return 1
				else if(data1.isAfter(data2)) return -1
				else if(data1.isSame(data2)) return 0
				else throw new Error("date compare error.")
			})
			json = JSON.stringify(summaries)
			fs.writeFile('dynamic/markdownlist', json)
```

少し長いですが、内容は簡単で、指定ディレクトリの中のファイルを順に読み出し、マークダウンの定義である`# `から始まる行をその記事のタイトルとして抜き出しています。  
また、マークダウンの記号を取り除いた本文から先頭200文字を抜き出しています。

以上２つを、jsonファイルに収めて、以下のURLから取得て着るようにしました。試しに開いてみてください。

https://static.katio.net/dynamic/markdownlist

あたかもAPIのようですが、内容は静的ファイルです。リポジトリ変更時に動的に生成される静的ファイルなので、`static dynamic api`という命名をしています。

また、ソースコードを見るとわかりますが、その後マークダウンのyaml metadataに対応しました。  
これはどういうものかというと、例えば以下のamazon-dash-button記事のマークダウンを見てみましょう。

https://raw.githubusercontent.com/onokatio/static.katio.net/master/post/amazon-dash-button.md

先頭に、`---`でくくられたyamlが定義されています。これは、マークダウンの拡張仕様の一部で、そこにyamlで文章のメタ的なデータ（作成日時やタグ、タイトルなど）を置いておくことができます。

ここに、タイトルを書くことで、正規表現でいじってタイトルを抽出する処理をなるべく行わないようにしました。

また、今後のために`static dynamic api`ではこのmetatagもjsonとして取ってこれるようになっています。
また、新しくマークダウンを作る際、yamlには公開日時を埋め込むようにしを作成しています。
なので、トップページにタグ機能や日付表示機能などを今後追加しようと思っても、おそらくそこまで手間はかからないでしょう。

トップページの話に戻りましょう。現在、トップページでは`static dynamic api`を叩いて記事一覧を生成しています。

```js
			if ( pathname === '/'){
				markdownPromise = fetch('https://static.katio.net/dynamic/markdownlist')
					.then( (response) => response.json() )
					.then( (json) => {
						document.getElementById("editgithub").setAttribute("href", "https://github.com/onokatio-blog/blog")
						document.getElementById("editgithub").textContent = 'Pull Request this site on github'
						document.getElementById("markdown").textContent = ''
						const header = document.createElement('h1')
						header.textContent = "おのかちお's blog"
						const articleList = document.createElement('div')
						articleList.className = 'd-flex flex-wrap'
						articleList.id = 'articleList'
						document.getElementById("markdown").appendChild(header)
						document.getElementById("markdown").appendChild(articleList)
						json = json.filter( (contentAndFilename) => contentAndFilename.filename !== '404.md' )
						json.forEach( ({filename,title,summary}) => {
							const card = createCard(filename,title,summary)
							document.getElementById("articleList").appendChild(card)
						})
```

```js
		const createCard = (filename,title,summary) => {
			const articleTitle = document.createElement("h5")
			articleTitle.className = "card-title"
			articleTitle.textContent = title
			const articleSummary = document.createElement("p")
			articleSummary.className = "card-text"
			articleSummary.textContent = summary + '...'
			const articleLink = document.createElement("a")
			articleLink.className = "card-link"
			articleLink.href = "/page/" + filename.replace(/\.md$/,'')
			articleLink.textContent = "Read more"
			const articleBody = document.createElement("div")
			articleBody.className = "card-body"
			articleBody.appendChild(articleTitle)
			articleBody.appendChild(articleSummary)
			articleBody.appendChild(articleLink)
			const card = document.createElement("div")
			card.className = "card"
			card.appendChild(articleBody)
			return card
		}
```

# バージョン3.0 現在の作業に関して

3.0は大体テーマが決まっており、メインが「service workerへの対応」と「アドベントカレンダー機能の実装」です。後者はまた別の記事で詳しく話しましょう。

service workerの対応は、ほとんど意味がないけどやってみたいことリストの一番上にありました。
現在は実装中で、クロスドメインを除きほぼうまく動作しています。安定したらそのバージョンを公開するつもりです。

またその他にも、肥大化したindex.htmlをindex.jsへと分割する作業や、セキュリティ性を向上させるべく、CSRP、HSTS、CORS Headerの追加等を行っています。

また、あまり機能の意味がなかったため現在はコメントアウトしていますが、マークダウンのfetchの進捗状況を画面に表示する実装も行っています。まあ数キロバイトなのでほとんど意味がありませんが…。

# バージョン ??? 今後の展望に関して

まだまだやりたいことがいっぱいあります。最近は「車輪を再開発しおわったら、その車輪を捨てて既存ツールに置き換える」という方針を取るように決定しました。

実際、現在もWebフレームワークでいうところのルーターやコントローラーを独自実装しており、取り替えられるところからReact.jsを採用したいと考えています。

え、最初と言ってることが違うって？
楽しければ良いんですよ趣味開発なんて。

また、現在すべてのライブラリなどをscriptタグで読み込んでいるため、npm/webpackに対応すること、mdx(markdown + react jsxライブラリ)の採用、マークダウンのコンパイルのweb worker化、一部の処理のwasm化を想定しています。

これからも、このブログの運営・開発は続けていくので、ぜひ今後の成長を見守りください。

以上、少し遅刻してしまいましたが、2日目の記事にさせていただきます。個々まで呼んで頂けたのであれば、お付き合い、ありがとうございました。
