UGLIJS := $(shell bash -c "command -v uglifyjs | head -n 1")

dist: normal minified

clean:
	rm -rf dist

normal:
	cp src/notify-sl.js dist/notify-sl.js

minified: normal
	cat dist/notify-sl.js | $(UGLIJS) --compress --mangle > dist/notify-sl.min.js
