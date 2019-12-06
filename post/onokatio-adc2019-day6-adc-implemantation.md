---
title: "自作ブログにアドベントカレンダーを追加した話"
date: 2019-12-07 00:02:00 +0900
---

自作ブログにアドベントカレンダーを追加した話
===


この記事は、[onokatio Advent Calendar 2019](https://blog.katio.net/adventcalendar/2019/onokatio) 6日目の記事です。  

今回の、アドベントカレンダー企画を始めようと思った際、Qiitaや他のアドベントカレンダーサイトを使っても良かったのですが、気分的に自分のブログに実装したいな、と思い、自力実装しました。

今回は、ゆるく内容を書いていきます。

# アドベントカレンダーにほしかった機能

- 日付と、タイトル、記事へのリンクが25日分表示される
- 記事自体はどこに書いても良い、実際にはこのブログに書き、そこへリンクを飛ばすアドベントカレンダー表示画面さえアレばいい
- 管理が楽

# 思いついた実装

- githubに、日付をkey、タイトルとURLをvalueとしたjsonファイルを置く
- ブログで、`/adventcalandar`的なルートを踏むと、jsonを読み込んで描画する関数（コントロール）を実装する

# 実際の実装

まず、適当に新しいルートを生やす。

```js=
        (() => {
                if( pathname === '/' ){
                        return RenderIndex()
                }else if( pathname.startsWith('/adventcalendar/2019/onokatio') ){
                        return RenderAdventCalendar()
                }else{
                        let filename;
                        if ( pathname.startsWith('/page/') ) {
                                filename = 'post/' + location.pathname.slice(6) + '.md'
                                if ( isValidFileName(filename) ) filename = 'post/404.md';
                        } else {
                                filename = 'post/404.md'
                        }
                        return RenderMarkdown(filename)
                }
        })().then( () => {

```

で、`RenderAdventCalendar()`を作る。

```js=
const RenderAdventCalendar = () => {
        return fetch('https://static.katio.net/adventCalendar/2019/onokatio.json')
                .then( (response) => response.json() )
                .then( (json) => {

                        document.getElementById("editgithub").setAttribute("href", "https://github.com/onokatio/static.katio.net/")
                        document.getElementById("editgithub").textContent = 'Pull Request this calendar on github'
                        document.getElementById("markdown").textContent = ''

                        const header = document.createElement('h1')
                        header.textContent = json.name

                        const articleList = document.createElement('div')
                        articleList.className = 'd-flex flex-wrap'
                        articleList.id = 'articleList'

                        document.getElementById("markdown").appendChild(header)
                        document.getElementById("markdown").appendChild(articleList)

                        for(let i=1; i <= 31; i++){
                                const post = json.posts[i]
                                if( post === undefined ){
                                        articleList.appendChild(createCalandarEntry(null,i + "日目",'記事が登録されていません。'))
                                }else{
                                        articleList.appendChild(createCalandarEntry(post.url,i + "日目",post.title))
                                }
                        }

                        document.querySelector("meta[name='description']").setAttribute('content', json.name)
                        document.querySelector("meta[property='og:description']").setAttribute('content', json.name)
                        document.title = json.name + " - おのかちお's blog"
                        document.querySelector("meta[property='og:title']").setAttribute('content', json.name + " - おのかちお's blog")

                })
}
```

中は単純で、jsonをfetchして、要素をforeachして要素をDOMに追加しています。また、投稿している日が飛び飛びのアドベントカレンダーに対応するため、日にちをkeyとする配列（オブジェクト）の要素がundefinedであったら「記事がありません」表記をしています。

また、jsonを`static.katio.net/adventCalendar/2019/onokatio.json`に配置します。

```json=
{
	"name": "onokatio Advent Calendar 2019",
	"posts": {
		"1": {"title": "自己紹介 & このアドベントカレンダーについて", "url": "https://blog.katio.net/page/onokatio-adc2019-day1-aboutme"},
		"2": {"title": "ぼくのかんがえたさいきょうのぶろぐふれーむわーくをつくってみた", "url": "https://blog.katio.net/page/onokatio-adc2019-day2-about-blog"},
		"3": {"title": "普段の情報収集に使っているツールについて", "url": "https://blog.katio.net/page/onokatio-adc2019-day3-about-news-gathering"},
		"4": {"title": "AN2Linux でAndroidスマートフォンの通知をLinuxデスクトップから受け取る", "url": "https://blog.katio.net/page/onokatio-adc2019-day4-an2linux"},
		"5": {"title": "GPGを本格的に運用する", "url": "https://blog.katio.net/page/onokatio-adc2019-day5-gpg-setup"}
	}
}

```

最後に、要素作成関数を書きます。

```js=
const createCalandarEntry = (url,title,summary) => {

        const articleBody = document.createElement("div")
        articleBody.className = "card-body"

        const articleTitle = document.createElement("h5")
        articleTitle.className = "card-title"
        articleTitle.textContent = title
        articleBody.appendChild(articleTitle)

        const articleSummary = document.createElement("p")
        articleSummary.className = "card-text"
        articleSummary.textContent = summary
        articleBody.appendChild(articleSummary)

        if( url !== null){
                const articleLink = document.createElement("a")
                articleLink.className = "card-link"
                articleLink.href = url
                articleLink.textContent = "Read more"
                articleBody.appendChild(articleLink)
        }


        const card = document.createElement("div")
        card.className = "card"
        card.appendChild(articleBody)

        return card
}
```

これはほとんど記事一覧の描画関数からコピーしてきました。

以上で、実装は終わりです。結構簡単でした。

# まとめ

見る人によっては既に悟ってそうですが、実はjsonのURLはわざと`年代/名前.json`にしています。これは、現在は「onokatio Advent Calendar 2019」に決め打ちのこの機能を、今後は複数のアドベントカレンダーに対応したいからです。

今回、実装が楽だったのは、MVCアーキテクチャに似せて、ルーター部分、コントローラー&描画関数を抜き出して作っていたことが大きいかなと思います。

簡単でしたが、これで実装の紹介を終わりにします。
