ESBUILD := esbuild

SM_OPT := $(if $(SM),--sourcemap,)

WIZ := src
WIZ_ENTRY := $(WIZ)/index.js
WIZ_MIN := public/js/wiz.min.js
WIZ_FILES := $(shell find -L $(WIZ) -name "*.js")
$(WIZ_MIN): $(WIZ_FILES)
	@mkdir -p $(dir $@)
	@$(ESBUILD) $(WIZ_ENTRY) --bundle --minify --format=esm --external:*/test.js --external:*/debug.js $(SM_OPT) --outfile=$@
wiz: $(WIZ_MIN)

TESTS = $(shell find test -name "*.js")
t:
	@for file in $(TESTS); do \
		node $$file; \
		if [ $$? -eq 0 ]; then \
			echo -e "\033[32m✔  PASS\033[0m"; \
		else \
			echo -e "\033[31m✘  FAIL\033[0m"; \
			exit 1; \
		fi; \
	done

.PHONY: test
