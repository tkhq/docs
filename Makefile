ifeq ($(shell uname -s), Darwin)
BUILD_COMMAND = buildx build --load
else
BUILD_COMMAND = build
endif

.PHONY: image
image:
	docker $(BUILD_COMMAND) -t tkhq/docs --target production .

.PHONY: dev-image
dev-image: Dockerfile
	docker $(BUILD_COMMAND) -t tkhq/docs:dev --target development .

.PHONY: run-dev
run-dev: dev-image
	docker run -p 3000:3000 -v $(PWD):/home/node/app/ tkhq/docs:dev
