/*
 Copyright 2016 Autodesk,Inc.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import express from 'express';
import {
  errorDoesNotExist,
} from './../utils/errors';
import * as sequences from './persistence/sequence';
import * as sequenceUtils from '../../src/utils/sequenceMd5';

const router = express.Router(); //eslint-disable-line new-cap

//todo - throttling... dont let them fetch too many at once

//expect that a well-formed md5 is sent. however, not yet checking. So you really could just call it whatever you wanted...
// future - url + `?format=${format}`;
router.route('/:md5')
  .get((req, res, next) => {
    const { md5 } = req.params;

    if (!sequenceUtils.validPseudoMd5(md5)) {
      return res.status(422).send('invalid md5');
    }

    sequences.sequenceGet(md5)
      .then(sequence => {
        //not entirely sure what this means... the file is empty?
        if (!sequence) {
          return res.status(204).send('');
        }
        res.status(200)
          .set('Content-Type', 'text/plain')
          .send(sequence);
      })
      .catch(err => {
        if (err === errorDoesNotExist) {
          return res.status(400).send(errorDoesNotExist);
        }
        return next(err);
      });
  })
  //todo - support passing as string, not just object
  .post((req, res, next) => {
    const { md5 } = req.params;
    const { sequence } = req.body;

    if (!sequenceUtils.validRealMd5(md5)) {
      return res.status(422).send('invalid md5');
    }

    sequences.sequenceWrite(md5, sequence)
      .then(() => res.status(200).send())
      .catch(err => next(err));
  })
  .delete((req, res) => {
    res.status(403).send('Not allowed to delete sequence');
  });

export default router;
