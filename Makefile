UGLIJS := $(shell bash -c "command -v uglify uglifyjs | head -n 1")

dist: normal minified

clean:
	rm -rf dist

normal:
	mkdir -p dist ; { echo "// Build by" $$(whoami) "@" $$(date) ; php lib/notify-sl.js.php ; } > dist/notify-sl.js

minified:
	echo $(UGLIJS)
	mkdir -p dist ; { echo "// Build by" $$(whoami) "@" $$(date) ; php lib/notify-sl.js.php | $(UGLIJS) ; } > dist/notify-sl.min.js
