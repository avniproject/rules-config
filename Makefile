# <makefile>
# Objects: metadata, package, env (code platform), rules
# Actions: clean, build, deploy, test
help:
	@IFS=$$'\n' ; \
	help_lines=(`fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//'`); \
	for help_line in $${help_lines[@]}; do \
	    IFS=$$'#' ; \
	    help_split=($$help_line) ; \
	    help_command=`echo $${help_split[0]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
	    help_info=`echo $${help_split[2]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
	    printf "%-30s %s\n" $$help_command $$help_info ; \
	done
# </makefile>


#port=443
#server=https://staging.openchs.org
port:= $(if $(port),$(port),8021)
server:= $(if $(server),$(server),http://localhost)

# <env> (Code Environment)
test_env: ## Run unit tests
	npm test
# </env>

token:=
poolId:=
clientId:=
username:=
password:=

auth:
	$(if $(poolId),$(eval token:=$(shell node scripts/token.js $(poolId) $(clientId) $(username) $(password))))

upload = \
	curl -X POST $(server):$(port)/$(1) -d $(2)  \
		-H "Content-Type: application/json"  \
		-H "ORGANISATION-NAME: OpenCHS"  \
		-H "AUTH-TOKEN: $(token)"

# <rules>

test:
	npm test