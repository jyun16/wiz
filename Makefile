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
