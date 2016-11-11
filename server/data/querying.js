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
/**
 * Utilities for querying the user information, wrapping file system queries etc.
 * @module querying
 */
import { merge, filter, values } from 'lodash';
import { getUserProjects } from './persistence/projects';

// key for no role rule
const untypedKey = 'none';

//returns blockmap
//todo - move to persistence module
export const getAllBlocks = (userId) => {
  return getUserProjects(userId, true)
    .then(rolls => rolls.map(roll => roll.blocks))
    .then(projectBlockMaps => merge({}, ...projectBlockMaps));
};

//todo - use DB query directly
export const getAllBlocksWithName = (userId, name) => {
};

//todo - use DB query directly
export const getAllPartsWithRole = (userId, role) => {
};

//todo - use DB query directly
export const getAllBlockRoles = (userId) => {

};

//todo - deprecate this module once we have the querying module in persistence
