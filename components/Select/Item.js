import React from 'react';
import cx from 'classnames';

import s from './Select.css';

class SelectItem extends React.Component {

  constructor() {
    super();
    this.state = {
      isSelected: false
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.callback(this.props.value);
  }

  render() {
    return (
      <button
        className={cx(s.option)}
        onClick={this.handleClick}
      >
        {this.props.children}
      </button>
    );
  }
}

export default SelectItem;
