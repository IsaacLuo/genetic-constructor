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

import fetch from 'isomorphic-fetch';
import { INTERNAL_HOST } from '../urlConstants';
import { updateUserConfig } from './utils';
import { headersPost } from '../../src/middleware/headers';

//parameterized route handler for setting user config
//expects req.user and req.config to be set
export default function setUserConfigHandler({useRegister = false}) {
  const url = useRegister === true ?
  INTERNAL_HOST + '/auth/register' :
  INTERNAL_HOST + '/auth/update-all';

  return (req, res, next) => {
    const { user: userInput, config: configInput } = req.body;
    let user;

    try {
      user = updateUserConfig(userInput, configInput);
    } catch (err) {
      return res.status(422).send(err);
    }

    //delegate to auth/register, making server -> server call
    //this will check if they have been registered, and onboard them if needed
    //todo - handle them already being registered both 1) with GC and 2) with auth (if they need to be separate)
    //avoid setting the config if they are already registered

    console.log('sending');
    console.log(user);

    fetch(url, headersPost(JSON.stringify(user)))
      .then(resp => resp.json())
      .then(userPayload => {
        console.log('got payload');
        console.log(userPayload);

        if (!!userPayload.message) {
          return Promise.reject(userPayload.message);
        }
        res.json(userPayload);
      })
      .catch(err => {
        console.log('got error');
        console.log(err);
        res.status(500).send(err);
      });
  };
};