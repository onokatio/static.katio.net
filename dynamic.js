const fetch = require("node-fetch")
const fs = require('fs').promises
const xml2js = require('xml2js')
const yamlFront = require('yaml-front-matter')
const moment = require('moment')

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
					.replace(/\!?\[.*\]\((.+)\)/g,'$1') // remove markdown link
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

			const summarySitemap = (summaries.map( (item) => {
				const lastmod = item.metadata.date == undefined ? '2019-01-01' : moment(item.metadata.date, "YYYY-MM-DD HH:mm:ss z").format('YYYY-MM-DD')
				return { url: {
						loc: 'https://blog.katio.net/page/' + item.filename.replace(/\.md$/,''),
						lastmod: lastmod,
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
			//sitemap.urlset.$ = xmlns
			builder = new xml2js.Builder()
			xml = builder.buildObject(sitemap)
			fs.writeFile('dynamic/sitemap.xml', xml)
		})

	} )
