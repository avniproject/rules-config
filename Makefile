build:
	rm -rf exports
	npm run build

deploy: build
	$(if $(local),$(call _deploy,$(local)/node_modules/rules-config))

define _deploy
	rm -rf $1/*
	cp exports/infra.js exports/rules.js exports/package.json $1/
endef

deps:
	npm install

tests:
	npm run test
