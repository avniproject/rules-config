set_node_version:
	. ${NVM_DIR}/nvm.sh && nvm use

build: set_node_version
	rm -rf exports
	npm run build

deploy: build
	$(if $(local),$(call _deploy,$(local)/node_modules/rules-config))

deploy-as-source:
	$(if $(local),$(call _deploy_as_source,$(local)/node_modules/rules-config))

define _deploy
	rm -rf $1/*
	cp exports/infra.js exports/rules.js exports/package.json $1/
endef

define _deploy_as_source
	rm -rf $1/*
	cp ./infra.js ./rules.js ./package.json $1/
	cp -r src $1/
endef

check-model-version:
	npm search openchs-models

deps: set_node_version
	npm install

tests: set_node_version build
	npm run test

clean:
	rm -rf node_modules
