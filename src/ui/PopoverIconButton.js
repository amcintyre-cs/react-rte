/* @flow */

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import IconButton from './IconButton';
import InputPopover from './InputPopover';

type Props = {
  showPopover: boolean,
  onTogglePopover: Function,
  onSubmit: Function;
};

export default class PopoverIconButton extends Component<Props> {
  props: Props;

  constructor() {
    super(...arguments);
    this._hidePopover = this._hidePopover.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
  }

  render(): React.Element {
    let {props} = this;
    return (
      <IconButton {...props} onClick={this.props.onTogglePopover}>
        {this._renderPopover()}
      </IconButton>
    );
  }

  _renderPopover() {
    if (!this.props.showPopover) {
      return null;
    }

    let {props} = this;
    return (
      <InputPopover
        {...props}
        onSubmit={this._onSubmit}
        onCancel={this._hidePopover}
      >
        {this.props.children}
      </InputPopover>
    );
  }

  _onSubmit() {
    this.props.onSubmit(...arguments);
  }

  _hidePopover() {
    if (this.props.showPopover) {
      this.props.onTogglePopover(...arguments);
    }
  }
}

export function toggleShowInput(key: string, focusEditor: Function, event: ?Object) {
  let isShowing = this.state[key];
  // If this is a hide request, decide if we should focus the editor.
  if (isShowing) {
    let shouldFocusEditor = true;
    if (event && event.type === 'click') {
      // TODO: Use a better way to get the editor root node.
      let editorRoot = ReactDOM.findDOMNode(this).parentNode;
      let {activeElement} = document;
      let wasClickAway = (activeElement == null || activeElement === document.body);
      if (!wasClickAway && !editorRoot.contains(activeElement)) {
        shouldFocusEditor = false;
      }
    }
    if (shouldFocusEditor) {
      focusEditor();
    }
  }
  return this.setState({[key]: !isShowing});
}
