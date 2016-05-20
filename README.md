# medcodeassist-frontend
## The frontend of the assistant for medical coding based on analysis of free text medical documentation

## Installing guide
This section explains how to prepare your OS to run the project medcodeassist-frontend of EONUM.
<br>
Development environment has to be linux.

### Linux (Ubuntu)
<b> Tested on Ubuntu 14.04 LTS </b>

#### Install Ruby 2.2.1, Rails 4.2, RVM, Git, ...

* Download mpapis public key: ``` gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 ```
<br>
If the server times out, try ``` gpg --keyserver hkp://pgp.mit.edu --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 ```
* Install Curl: ``` sudo apt-get install curl ```
* Install ruby version manager (RVM) with rails: ```\curl -sSL https://get.rvm.io | bash -s stable --rails```
* Run ``` source /usr/local/rvm/scripts/rvm ```
* Install git: ``` sudo apt-get install git ```

#### Clone the git repository medcodeassist-frontend
* Change to the directory where you want to clone the project.
* Clone the repo: ``` git clone https://github.com/eonum/medcodeassist-frontend.git ```

#### Install the gems
* Make sure to run the terminal as a login-shell (Edit->Profiles->Edit->Title and Command->run command as a login shell)
* Open a new bash
* Change to your cloned directory: ```cd medcodeassist-frontend ```
* Create a project-specific gemset: ``` rvm use ruby-2.2.1@medcodeassist-frontend --ruby-version --create ```
* Install the bundle: ``` bundle install ```
* In order to execute javascript in ruby, install execjs runtime ``` gem install execjs ``` (see <a href="https://github.com/rails/execjs">link</a> for more information)

#### MongoDB
- Set up mongodb as described at <a href="https://docs.mongodb.org/manual/administration/install-on-linux/#recommended">this link</a>.
- Run the database as follows: ``` mongod --dbpath [...]/medcodeassist-frontend/db --rest ```
- This will start the mongodb server at localhost:27017
- <q>--dbpath [...]/medcodeassist-frontend/db</q> defines your data directory
- <q>--rest</q> will provide an http interface at localhost:28017 and is optional

#### Run the rails server ####
* To run the server at port 3000, type: ``` rails server -p 3000 ```
* Open your favorite browser and go to: ``` localhost:3000 ```

## Connecting to the API
* Make sure you have a running and accessible API (that can be cloned from <a href="https://github.com/eonum/medcodeassist">here</a>)
* Suppose your API runs at http://apiurl.ch
* Configure the `@@api_url` in application_controller.rb to look like `@@api_url = 'http://apiurl.ch/api/v1/'`
