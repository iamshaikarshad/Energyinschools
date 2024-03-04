### How to start the project
##### Database
1. `sudo -u postgres psql`
1. `sudo -u postgres psql -c 'create database "samsung-school-on-azure";'`
1. `sudo -u postgres psql -c "create user admin with encrypted password '1111';"`
1. `sudo -u postgres psql -c 'grant all privileges on database "samsung-school-on-azure" to admin;'`

##### Front-end Linux
1. `export DOMAIN=http://localhost:8000`
1. `nvm use v8.9.4`
1. `scripts/prebuild.sh`
1. `npm run start` (optional - for local development only) 

##### Front-end Windows
1. open a terminal and go to frontend directory.
2. update the node module version `nvm use v8.9.4`
3. install node modules `npm install`
4. run the server for development`npm run start` (optional - for local development only) 

##### Back-end Linux
1. open another terminal
1. `sudo apt install python3.8-dev`
1. `sudo apt install python3.8-venv`
1. `python3.8 -m venv antenv`
1. `scripts/postbuild.sh`
1. `source antenv/bin/activate`
1.  Load fixtures:
    ```bash
    ./manage.py loaddata \
        apps/accounts/fixtures/groups.json \
        apps/addresses/fixtures/addresses.json \
        apps/locations/fixtures/demo-school.json \
        apps/energy_providers/fixtures/providers.json \
        apps/*/fixtures/*
    ```
1. `./manage.py initgroups`
1. `./manage.py makefakesensors device_id=1`
1. `./manage.py genhistory`
1. `./manage.py createlearningdays`
1. `./manage.py runserver`

##### Back-end Windows
1.  download python 3.8 `https://www.python.org/downloads/release/python-388/`
2.  open another terminal.
3.  create a virtual env `python -m venv env`
4.  activate the virtual env `env/Scripts/activate.bat`
5.  insatall poetry in virtual env `pip install poetry`
6.  create requirement.txt `poetry export --without-hashes --output requirements.txt`
7.  Update the version for cryptography in requirenment.txt
8.  read requirement.txt `pip install -r requirements.txt`
9.  clone microbridge repo from git `pip install git+https://github.com/yarsanich/microbit-bridge#egg=microbit-bridge`
10. go to env/Lib/site-packages/sqlalchemy/util/compact.py and change `time.clock` to `time.process_time`
11. run the development server `python manage.py runserver`


##### Task queue
1. `sudo apt install redis-server`
1. `celery -A samsung_school worker -l info --concurrency 4`
1. `celery -A samsung_school beat`

##### Fetch energy data via MQTT
1. `./manage.py lisenmqttenergymeters`

### ipdb support
You can use ipdb for debugging
Docs at https://ipython.readthedocs.io/en/stable/

`import ipdb;ipdb.set_trace()` for ipdb

### Tested database
If you have any problem with the database you can just drop it:

`sudo -u postgres psql -c  'drop database "test_samsung-school"'`
