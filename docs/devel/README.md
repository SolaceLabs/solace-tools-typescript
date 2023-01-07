# Docs

Generate documentation.

## MacOS
### Install Python Version(s)

````bash
# upgrade to latest pip3
python3 -m pip install --upgrade pip

brew install pyenv

pip3 install virtualenv

pyenv install 3.8.10
# bin: ~/.pyenv/versions/3.8.10/bin/python3

````

### Create Python Virtual Env

````bash
mkdir ./venvs
cd venvs
# create virtual env
virtualenv -p ~/.pyenv/versions/3.8.10/bin/python3 venv3.8.10
````

### Activate Python Virtual Env

````bash
# activate virtual env
source venv3.8.10/bin/activate
# check
(venv3.8.10) ...$ python3 -V
````

### Upgrade pip
````bash
(venv3.8.10) ...$ python3 -m pip install --upgrade pip
# check
pip -V
````
### Install Devel Requirements in Python Virtual Env
````bash
(venv3.8.10) ...$ cd devel
(venv3.8.10) ...$ pip install -r docs.requirements.txt
````

### Deactivate Python Virtual Env
````bash
(venv3.8.10) ...$ deactivate
...$
````

### Generate Docs
````bash
# check make version
make --version
  GNU Make 3.81 # <- min version
````

#### Create the html:
````bash
cd docs
make html
open build/html/index.html
````

#### Check the links:
````bash
cd docs
make linkcheck
````

#### Run all:
````bash
cd docs
./make.sh
````

---
The End.
