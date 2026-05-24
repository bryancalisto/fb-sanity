zip_chrome:
	mkdir -p outputs/chrome && cd chrome && zip -r ../outputs/chrome/extension.zip .

deploy_website:
	cd website && firebase deploy