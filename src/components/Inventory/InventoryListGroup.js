import React, { Component, Children, PropTypes } from 'react';
import invariant from 'invariant';

import '../../styles/InventoryListGroup.css';

export default class InventoryListGroup extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    disabled: PropTypes.bool,
    manual: PropTypes.bool,
    isExpanded: PropTypes.bool,
    onToggle: PropTypes.func, //you are required for maintaining state...
    isActive: PropTypes.bool, //to do with color, not whether expanded or not
    hideToggle: PropTypes.bool, //disable toggler (hide it)
  };

  static defaultProps = {
    disabled: false,
    hideToggle: false,
    isActive: false,
    isExpanded: false,
  };

  state = {
    expanded: false,
  };

  componentWillMount() {
    invariant(!this.props.manual || (this.props.hasOwnProperty('isExpanded') && this.props.hasOwnProperty('onToggle')), 'If the component is manual, you must pass isExpanded and onToggle to handle state changes');
  }

  handleToggle = () => {
    const { disabled, manual, isExpanded, onToggle } = this.props;

    if (disabled) {
      return;
    }

    const nextState = manual ? !isExpanded : !this.state.expanded;
    if (!manual) {
      this.setState({ expanded: nextState });
    }

    onToggle && onToggle(nextState);
  };

  render() {
    const { hideToggle, title, manual, isExpanded, isActive, children, disabled } = this.props;
    const expanded = manual ? isExpanded : this.state.expanded;

    return (
      <div className={'InventoryListGroup' +
      (expanded ? ' expanded' : '') +
      (disabled ? ' disabled' : '') +
      (isActive ? ' active' : '')}>
        <div className="InventoryListGroup-heading"
             onClick={this.handleToggle}>
          {!hideToggle && <span className="InventoryListGroup-toggle"/>}
          <a className="InventoryListGroup-title">
            <span>{title}</span>
          </a>
        </div>
        {expanded && <div className="InventoryListGroup-contents no-vertical-scroll">
          {Children.only(children)}
        </div>}
      </div>
    );
  }
}
