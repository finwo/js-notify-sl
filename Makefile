dist: normal minified

clean:
	rm -rf dist

normal:
	cp src/notify-sl.js dist/notify-sl.js

minified: normal
	cat dist/notify-sl.js | npx uglifyjs --compress --mangle > dist/notify-sl.min.js
