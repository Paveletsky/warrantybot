#!/bin/bash

apt install curl 
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash

source ~/.bashrc

cd ..
nvm install node
nvm install --lts