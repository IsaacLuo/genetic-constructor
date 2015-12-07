import express from 'express';
import bodyParser from 'body-parser';
import uuid from 'node-uuid';
import { createDescendant, record, getAncestors, getDescendantsRecursively } from '../history';
import { get as dbGet, getSafe as dbGetSafe, set as dbSet } from '../database';
import { errorDoesNotExist, errorNoIdProvided, errorInvalidSessionKey, errorInvalidModel, errorInvalidRoute } from '../errors';
import { validateBlock, validateProject, assertValidId } from '../validation';
import { validateSessionKey, validateLoginCredentials, sessionMiddleware } from '../authentication';
import { getComponents } from '../getRecursively';

const router = express.Router(); //eslint-disable-line new-cap
const jsonParser = bodyParser.json({
  strict: false, //allow values other than arrays and objects
});

var fs = require("fs");
var mkpath = require('mkpath');

function paramIsTruthy(param) {
  return param !== undefined && param !== 'false';
}

/***************************
 Login and session validator
 ****************************/

//todo - likely want to move this out of the API itself and expose as root route
router.get('/login', (req, res) => {
  const { user, password } = req.params;
  validateLoginCredentials(user, password)
    .then(key => {
      res.json({'session-key': key});
    })
    .catch(err => {
      res.status(403).send(errorInvalidSessionKey);
    });
});

router.use(sessionMiddleware);

/*********************************
 GET
 Fetch an entry and all sub-entries
 *********************************/

router.get('/project/:id', (req, res) => {
  const { id } = req.params;
  const { tree } = req.query;

  if (paramIsTruthy(tree)) {
    Promise
      .all([
        dbGetSafe(id),
        getComponents(id),
      ])
      .then(([inst, comps]) => {
        res.json({
          instance: inst,
          components: comps,
        });
      })
      .catch(err => res.status(500).send(err.message));
  } else {
    dbGetSafe(id)
      .then(result => res.json(result))
      .catch(err => res.status(500).send(err.message));
  }
});

router.get('/block/:id', (req, res) => {
  const { id } = req.params;
  const { tree } = req.query;

  if (paramIsTruthy(tree)) {
    Promise
      .all([
        dbGetSafe(id),
        getComponents(id),
      ])
      .then(([inst, comps]) => {
        res.json({
          instance: inst,
          components: comps,
        });
      })
      .catch(err => res.status(500).send(err.message));
  } else {
    dbGetSafe(id)
      .then(result => res.json(result))
      .catch(err => res.status(500).send(err.message));
  }
});

router.get('/ancestors/:id', (req, res) => {
  const { id } = req.params;

  getAncestors(id)
    .then(result => res.json(result))
    .catch(err => res.status(500).send(err.message));
});

router.get('/descendants/:id', (req, res) => {
  const { id } = req.params;
  const { depth } = req.query;

  getDescendantsRecursively(id, depth)
    .then(result => res.json(result))
    .catch(err => res.status(500).send(err.message));
});

/*********************************
 POST
 Create an entry for the first time.
 Forces a new ID, to guarantee object is new.

 future - extend scaffold with posted body, then check if valid
 future - allow bypassing of validation?
 *********************************/

router.post('/project', jsonParser, (req, res) => {
  const data = req.body;
  const id = uuid.v4();
  Object.assign(data, {
    id,
  });

  if (validateProject(data)) {
    dbSet(id, data)
      .then(result => res.json(result))
      .catch(err => res.status(500).err(err.message));
  } else {
    res.status(400).send(errorInvalidModel);
  }
});

router.post('/block', jsonParser, (req, res) => {
  const data = req.body;
  const id = uuid.v4();
  Object.assign(data, {
    id,
  });

  if (validateBlock(data)) {
    dbSet(id, data)
      .then(result => res.json(result))
      .catch(err => res.status(500).err(err.message));
  } else {
    res.status(400).send(errorInvalidModel);
  }
});

/*********************************
 PUT
 Modify an existing entry.
 Creates the object if it does not exist. ID of URL is assigned to object.
 *********************************/

router.put('/project/:id', jsonParser, (req, res) => {
  const { id } = req.params;
  const data = req.body;
  Object.assign(data, {
    id,
  });

  //Check that the input is a valid Project
  if (validateProject(data)) {
    dbSet(id, data)
      .then(result => res.json(result))
      .catch(err => res.status(500).send(err.message));
  } else {
    res.status(400).send(errorInvalidModel);
  }
});

router.put('/block/:id', jsonParser, (req, res) => {
  const { id } = req.params;
  const data = req.body;
  Object.assign(data, {
    id,
  });

  if (validateBlock(data)) {
    dbSet(id, data)
      .then(result => res.json(result))
      .catch(err => res.status(500).send(err.message));
  } else {
    res.status(400).send(errorInvalidModel);
  }
});

/**
 * Create a child instance
 */
router.post('/clone/:id', (req, res) => {
  const { id } = req.params;

  dbGet(id)
    .then(instance => {
      const clone = createDescendant(instance);
      return dbSet(clone.id, clone)
        .then(() => {
          return record(clone.id, instance.id);
        })
        .then(() => clone);
    })
    .catch(err => {
      res.status(500).send(err.message);
    })
    .then(clone => {
      res.json(clone);
    });
});

/**
* File IO
* Read and write files
**/

router.get('/file/:url', (req, res) => {
  const { url } = req.params;
  fs.readFile('./storage/' + url, (err, data) => {
   if (err) {
      res.status(500).send(err.message);
   } else {
      res.send(data);
   }
  });
});

router.post('/file/:url', (req, res) => {
  var { url } = req.params;

  //assuming contents to be string
  var buffer = "";

  //All files are put in the storage folder (until platform comes along)
  url = './storage/' + url;
  var path = url.substring(0,url.lastIndexOf("/")+1);

  //get data in parts
  req.on('data', data => {
    buffer += data; 
  });

  //received all the data
  req.on('end', function() {

    //make folder if doesn't exists
    mkpath(path, (err) => {

      if (err) {
        res.status(500).send(err.message);
      } else {

        //write data to file
        fs.writeFile(url, buffer, 'utf8', (err) => {

          if (err) {
            res.status(500).send(err.message);
          } else {
            res.send(url);
          }

        }); //writeFile
      }

    });  //mkpath
  }); //req.on

});

//default catch
router.use('*', (req, res) => {
  res.status(404).send(errorInvalidRoute);
});

export default router;
