import React, {PropTypes} from 'react';
import cx from 'classnames';
import s from './Widget.css';

class Header extends React.Component {

  static propTypes = {
    select: PropTypes.node,
    children: PropTypes.node,
  };

  render() {
    const titleParts = this.props.title.split('%s');
    const title = (
      <h2 className={cx(
        s.title,
        {[s.floatTitle]: this.props.floatTitle}
      )}>
        {titleParts[0]}
        {this.props.select}
        {titleParts[1]}
      </h2>);

    return (
      <section id={this.props.id} className={cx(s.root, {[s.root__full_width]: this.props.fullWidth})}>
        <div className={s.upperTitle}>
          <span />
          <h2>
            {this.props.upperTitle}
          </h2>
          <p>{this.props.upperDescription}</p>
          <div>
            {title}
          </div>
        </div>
        {this.props.children}
      </section>
    );
  }

}

export default Header;
