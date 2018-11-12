UGLIJS := $(shell bash -c "command -v uglifyjs | head -n 1")

dist: normal minified

clean:
	rm -rf dist

normal:
	mkdir -p dist ; { echo "// Build by" $$(whoami) "@" $$(date) ; script/template.sh src/notify-sl.js ; } > dist/notify-sl.js

minified: normal
	mkdir -p dist ; { echo "// Build by" $$(whoami) "@" $$(date) ; cat dist/notify-sl.js | $(UGLIJS) ; } > dist/notify-sl.min.js
