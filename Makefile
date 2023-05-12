build:
	rm -rf exports
	npm run build

deploy: build
	$(if $(local),$(call _deploy,$(local)/node_modules/rules-config))

deploy-to-avni-client-only:
	$(call _deploy,../avni-client/packages/openchs-android/node_modules/rules-config)

deploy-to-avni-client: build deploy-to-avni-client-only

deploy-to-avni-webapp-only:
	$(call _deploy,../avni-webapp/node_modules/rules-config)

deploy-to-avni-webapp: build deploy-to-avni-webapp-only

deploy-to-rules-server-only:
	$(call _deploy,../rules-server/node_modules/rules-config)

deploy-to-rules-server: build deploy-to-rules-server-only

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

deps:
	npm install

tests:
	npm run test

clean:
	rm -rf node_modules
