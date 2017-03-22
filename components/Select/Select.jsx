import React from 'react';
import classNames from 'classnames';
import { VelocityComponent, VelocityTransitionGroup } from 'velocity-react';
import s from './Select.css';
import Item from './Item';

class Select extends React.Component {

  constructor() {
    super();

    this.state = {
      open: false,
      currentOption: 'aa',
      options: [],
      duration: 250
    };

    this.onHandleClick = this.onHandleClick.bind(this);
    this.handleOpenSelect = this.handleOpenSelect.bind(this);
  }

  componentWillMount() {
    this.setState({
      currentOption: this.props.value,
      options: this.props.options
    });
  }

  componentWillReceiveProps(newprops) {
    if (newprops.options.length > this.state.options.length) {
      this.setState({ options: newprops.options });
      this.setState({ currentOption: newprops.value });
    }
  }

  onHandleClick(option) {
    const selectedOption = option;

    this.setState({
      currentOption: selectedOption.label
    });
    this.props.callback(selectedOption);

    const optionIndex = this.state.options.indexOf(selectedOption);
    const newOptions = [
      this.props.options[optionIndex]
    ];

    for (let i = 0; i < this.props.options.length; i += 1) {
      if (i !== optionIndex) {
        newOptions.push(this.props.options[i]);
      }
    }
    this.setState({ options: newOptions });
    this.setState({ open: false });
  }

  handleOpenSelect() {
    let open = true;
    if (this.state.open) {
      open = false;
    }

    this.setState({
      open
    });
  }

  getOptions() {
    return this.state.options.map((option, index) => {
      if (option.label === this.state.currentOption) return false;
      return (
        <Item
          key={index}
          value={option}
          callback={this.onHandleClick}
        >
          {option.label}
        </Item>
      );
    });
  }

  render() {
    const className = classNames(s.container, { [s.container__open]: this.state.open }, this.props.className);

    return (
      <div className={className}>
        <button
          className={classNames(s.option, s.current)}
          onClick={this.handleOpenSelect}
        >
          {this.state.currentOption}
          <VelocityComponent
            animation={{ rotateZ: this.state.open ? 225 : 45, marginTop: this.state.open ? -4 : 0 }}
            duration={this.state.duration / 2}
          >
            <div className={classNames(s.triangle)} />
          </VelocityComponent>
        </button>

        <div className={classNames(s.clearfix)} />

        <VelocityTransitionGroup
          component="div"
          className={classNames(s.group)}
          enter={{ animation: 'slideDown', duration: this.state.duration, style: { height: '' } }}
          leave={{ animation: 'slideUp', duration: this.state.duration }}
        >
          {this.state.open ? this.getOptions() : null}
        </VelocityTransitionGroup>
      </div>
    );
  }
}

export default Select;
