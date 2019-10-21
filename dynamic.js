const fetch = require("node-fetch")
const fs = require('fs').promises
const xml2js = require('xml2js')
const yamlFront = require('yaml-front-matter')

fs.readdir('./markdown')
	.then( (files) => {
		files = files.filter( (filename) => filename.endsWith('.md'))
			.filter( (filename) => filename !== ('index.md') )
			.filter( (filename) => filename !== ('404.md') )
		readPromises = files.map( (filename) => {
			return fs.readFile('./markdown/' + filename, "utf-8")
				.then( (content) => Promise.resolve([content, filename]) )
		})
		Promise.all(readPromises).then( (contents) => {
			const summaries = contents.map( ([content, filename]) => {
				metadata = yamlFront.safeLoadFront(content)
				content = metadata.__content
				delete metadata.__content

				let title
				if( metadata.title != undefined ){
					title = metadata.title
				}else if( ( result = content.match(/^\n*.+\n=+/) ) !== null){
					title = result[0].replace(/^\n*(.+)\n=+/,'$1')
				}else if( ( result = content.match(/^\n*# .+\n/)) !== null){
					title = result[0].replace(/^\n*# (.+)\n/,'$1')
				}else{
					title = 'Failed to get title'
				}
				content = content.replace(/^.+\n=+/,'') // remove (title \n ===)
					.replace(/^# .+\n/,'')          // remove (# title\n)
					.replace(/\n#+ /g,'\n')         // remove markdown sharp
					.replace(/`/g,'')               // remove markdown back quote
					.replace(/^ +- /g,'')           // remove markdown hyphen
					.replace(/\!?\[.*\]\((.+)\)/g,'$1') // remove markdown link
					.replace(/:[a-zA-Z]+:/g,'')     // remove emoji
					.replace(/\n/g,' ')             // replace newline to space

				return {  filename: filename, title: title, summary: content.slice(0,200), metadata: metadata }
			})
			json = JSON.stringify(summaries)
			fs.writeFile('dynamic/markdownlist', json)

			const summarySitemap = (summaries.map( (item) => {
				return { url: {
						loc: 'https://blog.katio.net/page/' + item.filename.replace(/\.md$/,''), lastmod: '2005-01-01',
						changefreq: 'monthly',
						priority: 1.0
					}
				}
			}))
			const generalSitemap = {
				url: {
					loc: 'https://blog.katio.net/',
					changefreq: 'monthly',
					priority: 1.0
				}
			}
			const sitemap = {
				urlset: summarySitemap.concat(generalSitemap)
			}
			const xmlns = {
				'xmlns': "http://www.sitemaps.org/schemas/sitemap/0.9"
			}
			sitemap.urlset.$ = xmlns
			builder = new xml2js.Builder()
			xml = builder.buildObject(sitemap)
			fs.writeFile('dynamic/sitemap.xml', xml)
		})

	} )
