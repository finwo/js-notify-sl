
dist: normal minified

clean:
	rm -rf dist

normal:
	mkdir -p dist ; { echo "// Build by" $$(whoami) "@" $$(date) ; php lib/notify-sl.js.php ; } > dist/notify-sl.js

minified:
	mkdir -p dist ; { echo "// Build by" $$(whoami) "@" $$(date) ; php lib/notify-sl.js.php | uglifyjs -c -m ; } > dist/notify-sl.min.js
