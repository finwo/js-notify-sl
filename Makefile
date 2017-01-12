uglifyjs:
	{ echo "// Build by" $$(whoami) "@" $$(date) ; uglifyjs -c -m -- dist/notify-sl.js ; } > dist/notify-sl.min.js
