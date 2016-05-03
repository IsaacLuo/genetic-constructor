import * as ActionTypes from '../constants/ActionTypes';
import { saveProject, loadProject, snapshot, listProjects } from '../middleware/api';
import * as projectSelectors from '../selectors/projects';
import * as undoActions from '../store/undo/actions';

import Block from '../models/Block';
import Project from '../models/Project';

import { setItem } from '../middleware/localStorageCache';

//project rollup cache
//used in saving and loading
//track the last versions saved so we aren't saving over and over
const rollMap = new Map();
const isRollSame = (oldRoll, newRoll) => {
  if (!oldRoll || !newRoll) return false;
  //check projects same
  if (oldRoll.project !== newRoll.project) return false; //todo - may want avoid to comparing versions
  //check all blocks same
  return oldRoll.blocks.every(oldBlock => {
    const analog = newRoll.blocks.find(newBlock => newBlock.id === oldBlock.id);
    return analog && analog === oldBlock;
  });
};

//Promise
export const projectList = () => {
  return (dispatch, getState) => {
    return listProjects()
      .then(projectManifests => {
        const projects = projectManifests.map(manifest => new Project(manifest));

        dispatch({
          type: ActionTypes.PROJECT_LIST,
          projects,
        });

        return projects;
      });
  };
};

//create a new project
export const projectCreate = (initialModel) => {
  return (dispatch, getState) => {
    const project = new Project(initialModel);
    dispatch({
      type: ActionTypes.PROJECT_CREATE,
      project,
    });
    return project;
  };
};

//Promise
//this is a background save (e.g. autosave)
export const projectSave = (inputProjectId) => {
  return (dispatch, getState) => {
    //if dont pass project id, get the currently viewed one
    const projectId = !!inputProjectId ? inputProjectId : getState().focus.projectId;

    const project = getState().projects[projectId];
    const roll = dispatch(projectSelectors.projectCreateRollup(projectId));
    setItem('mostRecentProject', projectId);

    //check if project is new, and save if it is
    const oldRoll = rollMap.get(projectId);
    if (isRollSame(oldRoll, roll)) {
      return Promise.resolve(project);
    }
    rollMap.set(projectId, roll);

    return saveProject(projectId, roll)
      .then(json => {
        dispatch({
          type: ActionTypes.PROJECT_SAVE,
          project,
        });
        return json;
      });
  };
};

//Promise
//explicit save e.g. an important point
export const projectSnapshot = (projectId, message) => {
  return (dispatch, getState) => {
    const roll = dispatch(projectSelectors.projectCreateRollup(projectId));
    return snapshot(projectId, roll, message)
      .then(sha => {
        dispatch({
          type: ActionTypes.PROJECT_SNAPSHOT,
          sha,
        });
        return sha;
      });
  };
};

//Promise
export const projectLoad = (projectId) => {
  return (dispatch, getState) => {
    return loadProject(projectId)
      .then(rollup => {
        const { project, blocks } = rollup;
        const projectModel = new Project(project);

        dispatch(undoActions.transact());

        blocks.forEach((blockObject) => {
          const block = new Block(blockObject);
          dispatch({
            type: ActionTypes.BLOCK_LOAD,
            block,
          });
        });

        dispatch({
          type: ActionTypes.PROJECT_LOAD,
          project: projectModel,
        });

        dispatch(undoActions.commit());

        rollMap.set(projectId, rollup);

        return project;
      });
  };
};

//this is a backup for performing arbitrary mutations
export const projectMerge = (projectId, toMerge) => {
  return (dispatch, getState) => {
    const oldProject = getState().projects[projectId];
    const project = oldProject.merge(toMerge);
    dispatch({
      type: ActionTypes.PROJECT_MERGE,
      undoable: true,
      project,
    });
    return project;
  };
};

export const projectRename = (projectId, newName) => {
  return (dispatch, getState) => {
    const oldProject = getState().projects[projectId];
    const project = oldProject.mutate('metadata.name', newName);
    dispatch({
      type: ActionTypes.PROJECT_RENAME,
      undoable: true,
      project,
    });
    return project;
  };
};

//Adds a construct to a project. Does not create the construct. Use blocks.js
export const projectAddConstruct = (projectId, componentId) => {
  return (dispatch, getState) => {
    const oldProject = getState().projects[projectId];
    const project = oldProject.addComponents(componentId);
    dispatch({
      type: ActionTypes.PROJECT_ADD_CONSTRUCT,
      undoable: true,
      project,
    });
    return project;
  };
};
