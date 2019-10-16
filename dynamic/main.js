const fetch = require("node-fetch")

fetch('https://api.github.com/repos/onokatio-blog/blog/contents/markdown')
	.then( (response) => response.json() )
	.then( (json) => {
		urlList = json.map( (file) => { return { path: file.path, download_url: file.download_url } } )
		console.log(urlList)
	})
