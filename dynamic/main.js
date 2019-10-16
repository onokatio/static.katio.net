const fetch = require("node-fetch")
const fs = require('fs').promises

fs.readdir('../markdown')
	.then( (files) => {
		files = files.filter( (filename) => filename.endsWith('.md') )
		files = files.filter( (filename) => filename !== ('index.md') )
		console.log(files)
		contents = files.map( (filename) => {
			fs.readFile('../markdown/' + filename, "utf-8").then( (content) => {
				content = content.replace(/^.+\n=+/,'') // remove (title \n ===)
					.replace(/^# .+\n/,'')          // remove (# title)
					.replace(/\n#+ /g,'\n')         // remove markdown sharp
					.replace(/`/g,'')               // remove markdown back quote
					.replace(/^ +- /g,'')           // remove markdown hyphen
					.replace(/\n/g,'')              // remove newline
				console.log('summary = ' + content.slice(0,50))
			})
		})
	} )
