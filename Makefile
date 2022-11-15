set_node_version:
	. ${NVM_DIR}/nvm.sh && nvm use

build: set_node_version
	rm -rf exports
	npm run build

deploy: build
	$(if $(local),$(call _deploy,$(local)/node_modules/rules-config))

define _deploy
	rm -rf $1/*
	cp exports/infra.js exports/rules.js exports/package.json $1/
endef

deps: set_node_version
	npm install

tests: set_node_version build
	npm run test

clean:
	rm -rf node_modules
