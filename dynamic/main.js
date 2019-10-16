const fetch = require("node-fetch")

fetch('https://api.github.com/repos/onokatio-blog/blog/contents/markdown')
	.then( (response) => response.json() )
	.then( (json) => {
		console.log(json)
	})
