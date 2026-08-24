#admin
#Mith0SweeTs@#!

# creating short commands for ease of use
path := .

define Comment
	- Run `make help` to see all the available options.
	- Run `make lint` to run the linter.
	- Run `make lint-check` to check linter conformity.
	- Run `dep-lock` to lock the deps in 'requirements.txt'.
	- Run `dep-sync` to sync environment up to date with the locked deps.
endef

.PHONY: lint
lint: black flake isort # Apply all the linters.

.PHONY: lint-check
lint-check:  ## Check whether the codebase satisfies the linter rules.
	@echo
	@echo "Checking linter rules..."
	@echo "========================"
	@echo
	@black --check $(path)
	@isort --check $(path)
	@flake8 $(path)


.PHONY: black
black: ## Apply black.
	@echo
	@echo "Applying black..."
	@echo "================="
	@echo
	@black --fast $(path)
	@echo


.PHONY: isort
isort: ## Apply isort.
	@echo "Applying isort..."
	@echo "================="
	@echo
	@isort $(path)


.PHONY: flake
flake: ## Apply flake8.
	@echo
	@echo "Applying flake8..."
	@echo "================="
	@echo
	@flake8 $(path)

# .PHONY: test
# test: ## Run the tests against the current version of Python.
# 	pytest


.PHONY: dep-lock
dep-lock: ## Freeze deps in 'requirements.txt' file. requirements written in requirements.in is created in requirements.txt; it requires pip-tools
	@pip-compile requirements.in -o requirements.txt 


.PHONY: dep-sync
dep-sync: ## Sync venv installation with 'requirements.txt' file. it requires pip-tools
	@pip-sync

.PHONY: help
help: ## Show this help message.
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.PHONY: install-requirements
install-requirements: # install from requirements.txt file
	pip install -r requirements.txt

.PHONY: build
build:  # build docker image
	docker-compose build 

.PHONY: up 
up: # pulling and running docker
	docker-compose up

.PHONY: v2-build
v2-build:  # build docker image using docker compose v2
	docker compose build 

.PHONY: v2-up 
v2-up: # pulling and running docker using docker compose v2
	docker compose up

.PHONY: createsuperuser
createsuperuser: # for testing the code 
	docker compose run --rm cipher sh -c "python manage.py createsuperuser"

.PHONY: run-local
run-local: # for running locally and testing 
	python3 manage.py runserver 0.0.0.0:8010