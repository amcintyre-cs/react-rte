/* @flow */
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import IconButton from './IconButton';
import ButtonGroup from './ButtonGroup';
import autobind from 'class-autobind';
import cx from 'classnames';

// $FlowIssue - Flow doesn't understand CSS Modules
import styles from './InputPopover.css';

type Props = {
  className: ?string;
  onCancel: () => any;
  onSubmit: (value: string) => any;
  placeholder: ?string;
};

export default class InputPopover extends Component<Props> {
  props: Props;

  constructor() {
    super(...arguments);
    autobind(this);
  }

  componentDidMount() {
    document.addEventListener('click', this._onDocumentClick);
    document.addEventListener('keydown', this._onDocumentKeydown);
    this._inputRef.focus();
  }

  componentWillUnmount() {
    document.removeEventListener('click', this._onDocumentClick);
    document.removeEventListener('keydown', this._onDocumentKeydown);
  }

  render(): React.Element {
    let {props} = this;
    let className = cx(props.className, styles.root);
    return (
      <form className={className} onSubmit={this._onSubmit}>
        <div className={styles.inner}>
          <input
            ref={this._setInputRef}
            type="text"
            placeholder={this.props.placeholder}
            className={styles.input}
          />
          <ButtonGroup className={styles.buttonGroup}>
            <IconButton
              label="Cancel"
              iconName="cancel"
              onClick={props.onCancel}
            />
            <IconButton
              label="Submit"
              iconName="accept"
              formSubmit={true}
            />
          </ButtonGroup>
        </div>

        <div ref={this._setChildRefs}>
            {this.props.children}
        </div>

      </form>
    );
  }

  _setInputRef(inputElement: Object) {
    this._inputRef = inputElement;
  }

  _setChildRefs(element: Object) {
    if (element) {
      this._additionalInputs = Array.prototype.slice.apply(element.querySelectorAll('input'));
    }
  }

  _getAdditionalFormData() {
    if (this._additionalInputs) {
      return this._additionalInputs.reduce((prev, cur) => {
          if (cur.checked) {
              prev[cur.name] = cur.value;
          }
          return prev;
      }, {});
    }
    return null;
  }

  _onSubmit(event: Object) {
    event.preventDefault();
    event.stopPropagation();
    this.props.onSubmit(this._inputRef.value, this._getAdditionalFormData());
  }

  _onDocumentClick(event: Object) {
    let rootNode = ReactDOM.findDOMNode(this);
    if (!rootNode.contains(event.target)) {
      // Here we pass the event so the parent can manage focus.
      this.props.onCancel(event);
    }
  }

  _onDocumentKeydown(event: Object) {
    if (event.keyCode === 27) {
      this.props.onCancel();
    }
  }
}
