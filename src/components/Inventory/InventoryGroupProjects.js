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
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import InventoryProjectList from './InventoryProjectList';
import InventoryRoleMap from './InventoryRoleMap';
import InventoryTabs from './InventoryTabs';
import { uiShowMenu } from '../../actions/ui';
import {
  projectCreate,
  projectAddConstruct,
  projectSave,
  projectOpen,
  projectDelete,
  projectList,
  projectLoad,
} from '../../actions/projects';
import {
  blockCreate,
} from '../../actions/blocks';
import * as instanceMap from '../../store/instanceMap';
import {
  focusConstruct,
} from '../../actions/focus';

class InventoryGroupProjects extends Component {
  static propTypes = {
    blockCreate: PropTypes.func.isRequired,
    focusConstruct: PropTypes.func.isRequired,
    projectCreate: PropTypes.func.isRequired,
    projectAddConstruct: PropTypes.func.isRequired,
    projectSave: PropTypes.func.isRequired,
    projectDelete: PropTypes.func.isRequired,
    projectList: PropTypes.func.isRequired,
    projectLoad: PropTypes.func.isRequired,
    currentProject: PropTypes.string,
    templates: PropTypes.bool.isRequired,
    uiShowMenu: PropTypes.func.isRequired,
  };

  constructor() {
    super();

    this.inventoryTabs = [
      { key: 'project', name: 'By Project' },
      { key: 'type', name: 'By Kind' },
    ];
  }

  state = {
    groupBy: 'project',
  };

  onTabSelect = (key) => {
    this.setState({ groupBy: key });
  };

  /**
   * create a new project and navigate to it.
   */
  onNewProject = () => {
    // create project and add a default construct
    const project = this.props.projectCreate();
    // add a construct to the new project
    const block = this.props.blockCreate({ projectId: project.id });
    const projectWithConstruct = this.props.projectAddConstruct(project.id, block.id);

    //save this to the instanceMap as cached version, so that when projectSave(), will skip until the user has actually made changes
    //do this outside the actions because we do some mutations after the project + construct are created (i.e., add the construct)
    instanceMap.saveRollup({
      project: projectWithConstruct,
      blocks: {
        [block.id]: block,
      },
    });

    this.props.focusConstruct(block.id);
    this.props.projectOpen(project.id);
  };

  onContextMenu = (evt) => {
    evt.preventDefault();
    this.props.uiShowMenu([
      {
        text: 'Open Project',
        action: () => {},
      },
      {},
      {
        text: 'New Project',
        action: this.onNewProject,
      },
      {
        text: 'New Construct',
        action: () => {},
      },
      {
        text: 'New Template',
        action: () => {},
      },
      {},
      {
        text: 'Download Project',
        action: () => {},
      },
      {
        text: 'Duplicate Project',
        action: () => {},
      },
      {
        text: 'Delete Project',
        action: () => {},
      },
    ], {
      x: evt.pageX,
      y: evt.pageY,
    })
  };

  render() {
    const { currentProject } = this.props;
    const { groupBy } = this.state;

    const currentList = groupBy === 'type'
      ? <InventoryRoleMap />
      : <InventoryProjectList currentProject={currentProject} templates={this.props.templates}/>;

    return (
      <div
        className="InventoryGroup-content InventoryGroupProjects"
        onContextMenu={this.onContextMenu}>
        <InventoryTabs tabs={this.inventoryTabs}
                       activeTabKey={groupBy}
                       onTabSelect={(tab) => this.onTabSelect(tab.key)}/>
        <div className="InventoryGroup-contentInner no-vertical-scroll">
          {currentList}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return {};
}

export default connect(mapStateToProps, {
  uiShowMenu,
  blockCreate,
  focusConstruct,
  projectAddConstruct,
  projectCreate,
  projectSave,
  projectOpen,
  projectDelete,
  projectList,
  projectLoad,
})(InventoryGroupProjects);


