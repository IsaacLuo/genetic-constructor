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
import Arrow from './Arrow';
import Label from './Label';


import '../../styles/Expando.css';

export default class Expando extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    selected: PropTypes.bool,
    content: PropTypes.object.isRequired,
    textWidgets: PropTypes.array,
    labelWidgets: PropTypes.array,
    headerWidgets: PropTypes.array,
    bold: PropTypes.bool,
    onExpand: PropTypes.func,
  };

  static defaultProps = {
    showArrowWhenEmpty: true,
  };

  constructor() {
    super();
    this.state = {
      open: false,
    };
  }

  /**
   * toggle the open state and invoke the optional onExpand property.
   */
  onToggle = () => {
    const open = !this.state.open;
    this.setState({ open });
    if (open && this.props.onExpand) {
      this.props.onExpand();
    }
  };

  render() {
    const showArrow = this.props.content || this.props.showArrowWhenEmpty;
    return (
      <div className="expando" data-expando={this.props.text}>
        <div className="header">
          <Arrow
            direction={this.state.open ? 'down' : 'right'}
            onClick={this.onToggle}
            hidden={!showArrow}
          />

          <Label
            text={this.props.text}
            bold={this.props.bold}
            hover
            onClick={this.onToggle}
            selected={this.props.selected}
            widgets={this.props.labelWidgets}
            textWidgets={this.props.textWidgets}
            styles={{
              marginLeft: '0.5rem',
              marginRight: this.props.headerWidgets && this.props.headerWidgets.length ? '0.5rem' : '0',
              flexGrow: 1,
              userSelect: 'none',
            }}
          />
          <div className="header-extras">
            {this.props.headerWidgets}
          </div>
        </div>
        <div className={this.state.open ? 'content-visible' : 'content-hidden'}>
          {this.props.content}
        </div>
      </div>
    );
  }
}
