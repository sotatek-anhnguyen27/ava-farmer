ifndef u
u:=sotatek
endif

ifndef env
env:=dev
endif
OS:=$(shell uname)

deploy-staging:
	cp .env.prod.deploy .env
	npm run build
	echo "Uploading to s3"
	aws s3 sync ./dist s3://staging.buni
		rm -f ./dist/index.html
	echo "Deploy client finished!"
	aws cloudfront create-invalidation \
        --distribution-id E11VUMQXP57YB1 \
        --paths "/" "/js/app.js" "/css/main.css" "/css/theme.css"

deploy:
	ssh $(u)@$(h) "mkdir -p $(dir)"
	rsync -avhzL --delete \
				--no-perms --no-owner --no-group \
				--exclude .git \
				--exclude .idea \
				--exclude .env \
				--exclude node_modules \
				. $(u)@$(h):$(dir)/

deploy-local:
	cp .env.local.deploy .env
	npm run build
	make deploy h=192.168.1.205 dir=/var/www/buni-kovan-interface

deploy-pre-prod:
	cp .env.prod.deploy .env
	npm run build
	make deploy h=192.168.1.205 dir=/home/sotatek/buni-bsc-interface

deploy-prod:
	cp .env.prod.deploy .env
	npm run build
	echo "Uploading to s3"
	aws s3 sync ./dist s3://bunicorn.exchange
		rm -f ./dist/index.html
	echo "Deploy client finished!"
	aws cloudfront create-invalidation \
        --distribution-id EXB6YH7NSAAHK \
        --paths "/" "/js/app.js" "/css/main.css" "/css/theme.css"
