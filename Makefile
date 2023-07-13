.PHONY: image
image:
	docker build -t tkhq/docs --target production .

.PHONY: dev-image
dev-image: Dockerfile
	docker build -t tkhq/docs:dev --target development .

.PHONY: run-dev
run-dev: dev-image
	docker run -p 3000:3000 -v $(PWD):/home/node/app/ tkhq/docs:dev
