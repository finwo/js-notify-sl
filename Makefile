.PHONY: default
default: dist/notify-sl.min.js dist/notify-sl.js

dist/notify-sl.min.js: src/notify-sl.js
	npx esbuild --minify src/notify-sl.js --outfile=dist/notify-sl.min.js

dist/notify-sl.js: src/notify-sl.js
	npx esbuild          src/notify-sl.js --outfile=dist/notify-sl.js

.PHONY: clean
clean:
	rm -rf dist
