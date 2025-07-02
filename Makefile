build:
	rm -rf exports
	npm run build

deploy: build
	$(if $(local),$(call _deploy,$(local)/node_modules/rules-config))

deploy-to-avni-client-only:
	@if [ -d "../avni-client/packages/openchs-android/node_modules/rules-config" ]; then \
		echo "Deploying to ../avni-client/packages/openchs-android/node_modules/rules-config"; \
		rm -rf ../avni-client/packages/openchs-android/node_modules/rules-config/*; \
		cp exports/infra.js exports/rules.js exports/package.json ../avni-client/packages/openchs-android/node_modules/rules-config/; \
	elif [ -d "../avni-client/node_modules/rules-config" ]; then \
		echo "Deploying to ../avni-client/node_modules/rules-config"; \
		rm -rf ../avni-client/node_modules/rules-config/*; \
		cp exports/infra.js exports/rules.js exports/package.json ../avni-client/node_modules/rules-config/; \
	else \
		echo "Error: Could not find avni-client node_modules path"; \
		exit 1; \
	fi

deploy-to-avni-client: build deploy-to-avni-client-only

deploy-to-avni-webapp-only:
	@if [ -d "../avni-webapp/node_modules/rules-config" ]; then \
		echo "Deploying to ../avni-webapp/node_modules/rules-config"; \
		rm -rf ../avni-webapp/node_modules/rules-config/*; \
		cp exports/infra.js exports/rules.js exports/package.json ../avni-webapp/node_modules/rules-config/; \
	else \
		echo "Error: Could not find avni-webapp node_modules path"; \
		exit 1; \
	fi

deploy-to-avni-webapp: build deploy-to-avni-webapp-only

deploy-to-project: build deploy-to-project-only

deploy-to-project-only:
ifndef project
	@echo "Provide the project variable"
	exit 1
endif
	@if [ -d "../$(project)/node_modules/rules-config" ]; then \
		echo "Deploying to ../$(project)/node_modules/rules-config"; \
		rm -rf ../$(project)/node_modules/rules-config/*; \
		cp exports/infra.js exports/rules.js exports/package.json ../$(project)/node_modules/rules-config/; \
	else \
		echo "Error: Could not find $(project) node_modules path"; \
		exit 1; \
	fi

deploy-to-rules-server-only:
	@if [ -d "../rules-server/node_modules/rules-config" ]; then \
		echo "Deploying to ../rules-server/node_modules/rules-config"; \
		rm -rf ../rules-server/node_modules/rules-config/*; \
		cp exports/infra.js exports/rules.js exports/package.json ../rules-server/node_modules/rules-config/; \
	else \
		echo "Error: Could not find rules-server node_modules path"; \
		exit 1; \
	fi

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
