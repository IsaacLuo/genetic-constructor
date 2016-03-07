[![Docker Repository on Quay](https://quay.io/repository/autodesk_bionano/genomedesigner_genome-designer/status "Docker Repository on Quay")](https://quay.io/repository/autodesk_bionano/genomedesigner_genome-designer)
# egf-collaboration

### installation

`npm install`

`npm run start`

### user authentication
User authentication depends on the Bio/Nano User Platform project, which is currently not open source. As a result user
authentication is NOT enabled by default when running this application locally. Authentication routes and a user object
is provided but is mocked in middleware and routes provided in this project by default.

After setting up the user auth platform locally, authentication can be enabled by setting the `BIO_NANO_AUTH`
environment variable to `1` or by using the `auth-test` npm target.

```
npm run auth
```

Running this command will attempt to access `git.autodesk.com`.

#### manual user authentication setup
If you want to use/test user authentication locally, do the following:

1) clone the Bio/Nano User Platform repo locally.

```
git clone git@git.autodesk.com:bionano/bio-user-platform.git ~/src/bio-user-platform
git checkout genome-designer
```

2) Install Docker (Don't use brew, go [here](https://docs.docker.com/engine/installation/mac/).)
3) Install Bio/Nano User Platform dependencies

```
cd ~/src/bio-user-platform
npn install
```

4) Start the Authentication Service locally. Choose method:
    1) Docker storage and Docker node
    2) Docker storage + local node (easier debugging)

```
# Method i
# cd ~/src/bio-user-platform
eval "$(docker-machine env default)"
docker-compose up
```

```
# Method ii
# in one terminal:
cd ~/src/bio-user-platform
bash /Applications/Docker/Docker\ Quickstart\ Terminal.app/Contents/Resources/Scripts/start.sh
eval "$(docker-machine env default)"
npm run storage
#
#in another terminal:
cd ~/src/bio-user-platform
npm start
```

5) Start the Genome Designer Application

If you've chosen `method ii` above, you start the Genome Designer normally with `npm run auth`

If you've chosen `method i` above, you need to tell the Genome Designer application to look for the Auth Service on
your docker host.

```
API_END_POINT="http://$(docker-machine ip default):8080/api" npm run auth
```

#### user authentication tests

Currently authentication tests in `test/server/auth/REST.spec.js` require access to an Authentication Server.
