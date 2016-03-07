import invariant from 'invariant';
import * as ActionTypes from '../constants/ActionTypes';
import BlockDefinition from '../schemas/Block';
import Block from '../models/Block';
import { saveBlock, loadBlock } from '../middleware/api';
import * as selectors from '../selectors/blocks';

//Promise
export const blockSave = (blockId, projectId) => {
  invariant(projectId, 'project ID required to save block'); //todo - assume from router?
  return (dispatch, getState) => {
    const block = getState().blocks[blockId];
    return saveBlock(block, projectId)
      .then(block => {
        dispatch({
          type: ActionTypes.BLOCK_SAVE,
          block,
        });
        return block;
      });
  };
};

//Promise
export const blockLoad = (blockId) => {
  return (dispatch, getState) => {
    return loadBlock(blockId)
      .then(block => {
        dispatch({
          type: ActionTypes.BLOCK_LOAD,
          block,
        });
        return block;
      });
  };
};

export const blockCreate = (initialModel) => {
  return (dispatch, getState) => {
    const block = new Block(initialModel);
    dispatch({
      type: ActionTypes.BLOCK_CREATE,
      block,
    });
    return block;
  };
};

/**
 * @description
 * Clones a block (and its children by default)
 *
 * @param blockInput {ID|Object} JSON of block directly, or ID. Accept both since inventory items may not be in the store, so we need to pass the block directly. Prefer to use ID.
 * @param projectVersion {String(SHA)} version of the project
 * @param shallowOnly {Boolean} Does a deep clone by default, adds all child blocks to store
 * @returns {Object} clone block (root node if has children)
 */
export const blockClone = (blockInput, projectVersion, shallowOnly = false) => {
  return (dispatch, getState) => {
    invariant(projectVersion, 'project version is required to clone blocks, so their ancestry is correclty pinned. There is a selector to retrieve the project version.');

    let oldBlock;
    if (typeof blockInput === 'string') {
      oldBlock = getState().blocks[blockInput];
    } else if (BlockDefinition.validate(blockInput)) {
      oldBlock = new Block(blockInput);
    } else {
      throw new Error('invalid input to blockClone', blockInput);
    }

    if (!!shallowOnly || !oldBlock.components.length) {
      const block = oldBlock.clone(projectVersion);
      dispatch({
        type: ActionTypes.BLOCK_CLONE,
        block,
      });
      return block;
    }

    const allChildren = dispatch(selectors.blockGetChildrenRecursive(oldBlock.id));
    const allToClone = [oldBlock, ...allChildren];
    const unmappedClones = allToClone.map(block => block.clone(projectVersion));

    //update IDs in components
    const cloneIdMap = allToClone.reduce((acc, next, index) => {
      acc[next.id] = unmappedClones[index].id;
      return acc;
    }, {});
    const clones = unmappedClones.map(clone => {
      const newComponents = clone.components.map(componentId => cloneIdMap[componentId]);
      return clone.mutate('components', newComponents);
    });

    //add clones to the store
    //todo - transaction
    clones.forEach(block => {
      dispatch({
        type: ActionTypes.BLOCK_CLONE,
        block,
      });
    });

    //return the clone of root passed in
    const rootId = cloneIdMap[oldBlock.id];
    const root = clones.find(clone => clone.id === rootId);
    return root;
  };
};

//this is a backup for performing arbitrary mutations. You shouldn't use this.
export const blockMerge = (blockId, toMerge) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.merge(toMerge);
    dispatch({
      type: ActionTypes.BLOCK_MERGE,
      block,
    });
    return block;
  };
};

//todo - remove from all constructs
export const blockDelete = (blockId) => {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.BLOCK_DELETE,
      blockId,
    });
    return blockId;
  };
};

/***************************************
 * Metadata things
 ***************************************/

export const blockRename = (blockId, name) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.mutate('metadata.name', name);
    dispatch({
      type: ActionTypes.BLOCK_RENAME,
      block,
    });
    return block;
  };
};

export const blockSetColor = (blockId, color) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.mutate('metadata.color', color);
    dispatch({
      type: ActionTypes.BLOCK_SET_COLOR,
      block,
    });
    return block;
  };
};

export const blockSetSbol = (blockId, sbol) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.setSbol(sbol);
    dispatch({
      type: ActionTypes.BLOCK_SET_SBOL,
      block,
    });
    return block;
  };
};

/***************************************
 * Components
 ***************************************/

export const blockAddComponent = (blockId, componentId, index) => {
  return (dispatch, getState) => {
    //todo - should remove from all other constructs

    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.addComponent(componentId, index);
    dispatch({
      type: ActionTypes.BLOCK_COMPONENT_ADD,
      block,
    });
    return block;
  };
};

export const blockRemoveComponent = (blockId, ...componentIds) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = componentIds.reduce((acc, currentId) => {
      return acc.removeComponent(currentId);
    }, oldBlock);

    dispatch({
      type: ActionTypes.BLOCK_COMPONENT_REMOVE,
      block,
    });
    return block;
  };
};

export const blockMoveComponent = (blockId, componentId, newIndex) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.moveComponent(componentId, newIndex);
    dispatch({
      type: ActionTypes.BLOCK_COMPONENT_MOVE,
      block,
    });
    return block;
  };
};

/***************************************
 * Sequence / annotations
 ***************************************/

export const blockAnnotate = (blockId, annotation) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.annotate(annotation);
    dispatch({
      type: ActionTypes.BLOCK_ANNOTATE,
      block,
    });
    return block;
  };
};

export const blockRemoveAnnotation = (blockId, annotationId) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.removeAnnotation(annotationId);
    dispatch({
      type: ActionTypes.BLOCK_REMOVE_ANNOTATION,
      block,
    });
    return block;
  };
};

//Non-mutating
//Promise
//ignore format for now
export const blockGetSequence = (blockId, format) => {
  return (dispatch, getState) => {
    const block = getState().blocks[blockId];
    return block.getSequence(format);
  };
};

//Promise
//future - validate
export const blockSetSequence = (blockId, sequence, useStrict) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];

    return oldBlock.setSequence(sequence, useStrict)
      .then(block => {
        dispatch({
          type: ActionTypes.BLOCK_SET_SEQUENCE,
          block,
        });
        return block;
      });
  };
};
