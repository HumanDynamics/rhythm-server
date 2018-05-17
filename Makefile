#
# Makefile to build and test the rhythm-server
#   duplicates (and should be kept in sync with) some of the scripts in package.json
#

GIT_TAG_VERSION = $(shell git describe)

COMPILER = ./node_modules/.bin/tsc
LINT = ./node_modules/.bin/eslint
MOCHA = ./node_modules/.bin/mocha

LINT_LOG = logs/lint.log
TEST_LOG = logs/test.log

# Add --quiet to only report on errors, not warnings
LINT_OPTIONS =
LINT_FORMAT = stylish

.DELETE_ON_ERROR :
.PHONY : help all build doc lint test load-test wtftest clean clean-build start-dev

help :
	@echo ""                                                                          ; \
	echo "Useful targets in this rhythm-server Makefile:"                             ; \
	echo "- all       : run lint, build, test"                                        ; \
	echo "- build     :"                                                              ; \
	echo "- lint      : run lint over the sources & tests; display results to stdout" ; \
	echo "- lint-log  : run lint concise diffable output to $(LINT_LOG)"              ; \
	echo "- test      : run the mocha (unit) tests"                                   ; \
	echo "- load-test : run the mocha (load) tests"                                   ; \
	echo "- wtftest   : run the mocha (unit) tests w/ wtfnode to help debug the test run hanging at the end" ; \
	echo "- start-dev : start a dev container for the rhythm-server"                  ; \
	echo "- vim-lint  : run lint in format consumable by vim quickfix"                ; \
	echo ""

all : lint build test

build :
	@echo build would run the compiler: $(COMPILER)

doc :
	@echo doc would run the compiler: $(COMPILER)

lint-log: LINT_OPTIONS = --output-file $(LINT_LOG)
lint-log: LINT_FORMAT = unix
vim-lint: LINT_FORMAT = unix
lint vim-lint lint-log:
	$(LINT) $(LINT_OPTIONS) --format $(LINT_FORMAT) src test

test :
	$(MOCHA) --reporter spec -r dotenv/config --recursive --sort --invert --grep 'Load tests' test | tee $(TEST_LOG)

load-test :
	$(MOCHA) --reporter spec -r dotenv/config test/load.test.js

wtftest : ./node_modules/.bin/wtfnode
# This is helpful for determining why the tests seem to be hanging after they've "finished"
# it requires the wtfnode package to be installed.
	./node_modules/.bin/wtfnode ./node_modules/.bin/_mocha --reporter spec -r dotenv/config --recursive --sort --invert --grep 'Load tests' test

clean : clean-build

clean-build :
	-rm -f dist/*

start-dev :
	-docker-compose run rhythm-server bash
	-docker-compose rm --force
	-docker-compose stop

./node_modules/.bin/wtfnode :
	npm install wtfnode --no-save
