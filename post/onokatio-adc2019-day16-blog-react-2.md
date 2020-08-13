---
title: "Reactを勉強してブログに導入した その2"
date: 2019-12-17 00:13:00 +0900
---

Reactを勉強してブログに導入したその2
===

この記事は、[onokatio Advent Calendar 2019](/adventcalendar/2019/onokatio) 16日目の記事です。

昨日に引き続き、ブログのReact移行を行います。

https://blog.katio.net/page/onokatio-adc2019-day15-blog-react-1

# トップページの記事一覧描画をReactへ移行する

この公式チュートリアルをチラ見しながら作っていきます。

https://ja.reactjs.org/tutorial/tutorial.html

まず、今までcreateElementで作成していた、トップページの記事リストを移行しましょう。対応するhtmlをjsxとして書いたファイルを作成します。  
自分の場合は、`./src/component/`というディレクトリ(reactの世界に置いて要素はコンポーネントと呼ばれるらしいので)を掘り、その中に`ArticleItem.jsx`という名前をつけたファイルを作成しました。

```jsx=
diff --git a/src/components/ArticleItem.jsx b/src/components/ArticleItem.jsx
new file mode 100644
index 0000000..e81e478
--- /dev/null
+++ b/src/components/ArticleItem.jsx
@@ -0,0 +1,18 @@
+"use strict";
+
+import React from "react"
+import ReactDOM from "react-dom"
+
+export default class ArticleItem extends React.Component {
+       render() {
+               return (
+                       <div className="ArticleItem card">
+                               <div className="card-body">
+                                       <h5 className="card-title">{this.props.title}</h5>
+                                       <p className="card-text">{this.props.summary}</p>
+                                       <a className="card-link" href={this.props.link}>Read more(from react)</a>
+                               </div>
+                       </div>
+               )
+       }
+}
```

Reactの作法としては、React.Componentクラスを継承したクラスを作成し、render()メソッドでjsxを返せば、それがコンポーネントになるとのことです。  
クラスではなく関数としても書けるみたいなので今度試してみますが今回はクラスで。

コンポーネントでは、props(初期化時に決定し、不変のオブジェクト)とstate(変更できる内部状態)の2つを参照できます。どう考えても記事一覧の文字は不変なので、propsとして渡すようにしました。

次に、記事一覧を描画する自作コントローラー関数を編集します。

```jsx=
diff --git a/src/RenderIndex.js b/src/RenderIndex.js
index 523024d..e26ed73 100644
--- a/src/RenderIndex.js
+++ b/src/RenderIndex.js
@@ -1,5 +1,10 @@
 "use strict";

+import React from "react"
+import ReactDOM from "react-dom"
+
+import ArticleItem from "./components/ArticleItem.jsx"
+
 export const RenderIndex = () => {
        return fetch('https://static.katio.net/dynamic/markdownlist')
                .then( (response) => response.json() )
@@ -25,10 +30,12 @@ export const RenderIndex = () => {
                        document.getElementById("markdown").appendChild(articleList)


-                       json.filter( contentAndFilename => contentAndFilename.filename !== '404.md' )
-                               .forEach( ({filename,title,summary}) => {
-                                       document.getElementById("articleList").appendChild(createCard(filename,title,summary))
+                       const element = json.filter( contentAndFilename => contentAndFilename.filename !== '404.md' )
+                               .map( ({filename,title,summary}) => {
+                                       const link = "/page/" + filename.replace(/\.md$/,'')
+                                       return <ArticleItem title={title} summary={summary} link={link}/>
                                })
+                       ReactDOM.render(element, document.getElementById("articleList"))

                        document.querySelector("meta[name='description']").setAttribute('content', '記事一覧')
                        document.querySelector("meta[property='og:description']").setAttribute('content', '記事一覧')
@@ -37,30 +44,3 @@ export const RenderIndex = () => {

                })
 }
-
-const createCard = (filename,title,summary) => {
-       const articleTitle = document.createElement("h5")
-       articleTitle.className = "card-title"
-       articleTitle.textContent = title
-
-       const articleSummary = document.createElement("p")
-       articleSummary.className = "card-text"
-       articleSummary.textContent = summary + '...'
-
-       const articleLink = document.createElement("a")
-       articleLink.className = "card-link"
-       articleLink.href = "/page/" + filename.replace(/\.md$/,'')
-       articleLink.textContent = "Read more"
-
-       const articleBody = document.createElement("div")
-       articleBody.className = "card-body"
-       articleBody.appendChild(articleTitle)
-       articleBody.appendChild(articleSummary)
-       articleBody.appendChild(articleLink)
-
-       const card = document.createElement("div")
-       card.className = "card"
-       card.appendChild(articleBody)
-
-       return card
-}
```

少し長いですが、差分だけ見れば僅かな変更です。大まかには、createCard関数を消して先程作ったArticleItemコンポーネントで置き換えています。  
forEachでappendChild()していたところを、.mapでコンポーネントを返すようにし、最後に出てきた配列をReactDOM()へ渡して描画しています。

# まとめ

ReactDOMを使い、試しに一部分だけ差し替えを行いました。htmlタグ記法を、jsファイル内部に書くのは斬新ですがとても描きやすいと感じました。

現在は、View系とControler系がごちゃごちゃになっているので、最終的にはすべての要素をコンポーネントへ置き換え、一番外で一度ReactDOM.render()を呼び出すだけの構造にするのが目標となっています。

ということで、このシリーズはもう少し進みそうです…。
