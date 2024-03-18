ifeq ($(shell uname -s), Darwin)
BUILD_COMMAND = buildx build --load
else
BUILD_COMMAND = build
endif

# Lists all make commands in a Makefile
.PHONY: list
list:
	@LC_ALL=C $(MAKE) -pRrq -f $(firstword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/(^|\n)# Files(\n|$$)/,/(^|\n)# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$'

.PHONY: image
image:
	docker $(BUILD_COMMAND) -t tkhq/docs --target production .

.PHONY: dev-image
dev-image: Dockerfile
	docker $(BUILD_COMMAND) -t tkhq/docs:dev --target development .

.PHONY: run-dev
run-dev: dev-image
	docker run -p 3000:3000 -v $(PWD):/home/node/app/ tkhq/docs:dev

.PHONY: stop-dev
stop-dev: 
	docker stop $(shell docker ps -a -q  --filter ancestor=tkhq/docs:dev)
