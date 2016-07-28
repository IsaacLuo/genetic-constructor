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
import rejectingFetch from './rejectingFetch';
import invariant from 'invariant';
import { headersGet, headersPost, headersDelete } from './headers';
import { projectFilePath } from './paths';

const contentTypeTextHeader = { headers: { 'Content-Type': 'text/plain' } };

//returns a fetch object, for you to parse yourself (doesnt automatically convert to json / text)
export const readProjectFile = (projectId, extension, fileName) => {
  return rejectingFetch(projectFilePath(projectId, extension, fileName), headersGet(contentTypeTextHeader));
};

// if contents === null, then the file is deleted
// Set contents to '' to empty the file
export const writeProjectFile = (projectId, extension, fileName, contents) => {
  invariant(projectId, 'projectId is required');
  invariant(extension, 'extension key is required');
  invariant(fileName, 'file name is required');

  const filePath = projectFilePath(projectId, extension, fileName);

  if (contents === null) {
    return rejectingFetch(filePath, headersDelete());
  }

  return rejectingFetch(filePath, headersPost(contents, contentTypeTextHeader));
};
