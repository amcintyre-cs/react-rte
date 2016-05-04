/* @flow */
import {hasCommandModifier} from 'draft-js/lib/KeyBindingUtil';

import React, {Component} from 'react';
import {EditorState, Entity, RichUtils} from 'draft-js';
import {ENTITY_TYPE} from 'draft-js-tools';
import {
  INLINE_STYLE_BUTTONS,
  BLOCK_TYPE_DROPDOWN,
  BLOCK_TYPE_BUTTONS,
} from './EditorToolbarConfig';
import StyleButton from './StyleButton';
import PopoverIconButton from '../ui/PopoverIconButton';
import ButtonGroup from '../ui/ButtonGroup';
import Dropdown from '../ui/Dropdown';
import IconButton from '../ui/IconButton';
import getEntityAtCursor from './getEntityAtCursor';
import clearEntityForRange from './clearEntityForRange';
import autobind from 'class-autobind';
import {toggleShowInput} from '../ui/PopoverIconButton';

// $FlowIssue - Flow doesn't understand CSS Modules
import styles from './EditorToolbar.css';
import iconStyles from '../ui/IconButton.css';

import type {EventEmitter} from 'events';
import type {ToolbarButton} from './EditorToolbarConfig';

type ChangeHandler = (state: EditorState) => any;

type Props = {
  editorState: EditorState;
  keyEmitter: EventEmitter;
  onChange: ChangeHandler;
  focusEditor: Function;
  inlineStyleButtons: Array<string>;
  additionalInlineStyleButtons: Array<ToolbarOption>;
  blockTypeButtons: Array<string>;
  additionalBlockTypeButtons: Array<ToolbarOption>;
  blockTypeDropdownOptions: Array<string>;
  additionalBlockTypeDropdownOptions: Array<ToolbarOption>;
  showLinkButtons: boolean;
  showUndoRedo: boolean;
};

export default class EditorToolbar extends Component<Props> {
  props: Props;

  static defaultProps = {
      inlineStyleButtons: INLINE_STYLE_BUTTONS,
      additionalInlineStyleButtons: [],
      blockTypeButtons: BLOCK_TYPE_BUTTONS,
      additionalBlockTypeButtons: [],
      blockTypeDropdownOptions: BLOCK_TYPE_DROPDOWN,
      additionalBlockTypeDropdownOptions: [],
      showLinkButtons: true,
      showUndoRedo: true
  };

  constructor() {
    super(...arguments);
    autobind(this);
    this.state = {
      showLinkInput: false
    };
    this._toggleShowLinkInput = toggleShowInput.bind(this, 'showLinkInput', this.props.focusEditor);
  }

  componentWillMount() {
    // Technically, we should also attach/detach event listeners when the
    // `keyEmitter` prop changes.
    this.props.keyEmitter.on('keypress', this._onKeypress);
  }

  componentWillUnmount() {
    this.props.keyEmitter.removeListener('keypress', this._onKeypress);
  }

  render(): React.Element {
    return (
      <div className={styles.root}>
        {this._renderInlineStyleButtons()}
        {this._renderBlockTypeButtons()}
        {this._renderLinkButtons()}
        {this._renderBlockTypeDropdown()}
        {this._renderUndoRedo()}
        {this.props.children}
      </div>
    );
  }

  _renderBlockTypeDropdown(): React.Element {
    let {blockTypeDropdownOptions, additionalBlockTypeDropdownOptions} = this.props;
    let blockType = this._getCurrentBlockType();
    let allowedOpts = BLOCK_TYPE_DROPDOWN.filter(b => blockTypeDropdownOptions.includes(b.id));
    allowedOpts.push(...additionalBlockTypeDropdownOptions);

    if (allowedOpts.length === 0) {
        return null;
    }

    let choices = new Map(
      allowedOpts.map((type) => [type.style, type.label])
    );
    if (!choices.has(blockType)) {
      blockType = Array.from(choices.keys())[0];
    }

    return (
      <ButtonGroup>
        <Dropdown
          choices={choices}
          selectedKey={blockType}
          onChange={this._selectBlockType}
        />
      </ButtonGroup>
    );
  }

  _renderBlockTypeButtons(): React.Element {
    let {blockTypeButtons, additionalBlockTypeButtons} = this.props;
    let allowedOpts = BLOCK_TYPE_BUTTONS.filter(b => blockTypeButtons.includes(b.id));
    allowedOpts.push(...additionalBlockTypeButtons);
    let blockType = this._getCurrentBlockType();
    let buttons = allowedOpts.map((type, index) => (
      <StyleButton
        key={String(index)}
        isActive={type.style === blockType}
        label={type.label}
        onToggle={this._toggleBlockType}
        style={type.style}
      />
    ));
    return (
      <ButtonGroup>{buttons}</ButtonGroup>
    );
  }

  _renderInlineStyleButtons(): React.Element {
    let {inlineStyleButtons, additionalInlineStyleButtons, editorState} = this.props;
    let allowedOpts = INLINE_STYLE_BUTTONS.filter(b => inlineStyleButtons.includes(b.id));
    allowedOpts.push(...additionalInlineStyleButtons);
    let currentStyle = editorState.getCurrentInlineStyle();
    let buttons = allowedOpts.map((type, index) => (
      <StyleButton
        key={String(index)}
        isActive={currentStyle.has(type.style)}
        label={type.label}
        onToggle={this._toggleInlineStyle}
        style={type.style}
      />
    ));
    return (
      <ButtonGroup>{buttons}</ButtonGroup>
    );
  }

  _renderLinkButtons(): React.Element {
    let {showLinkButtons, editorState} = this.props;

    if (!showLinkButtons) {
        return null;
    }

    let selection = editorState.getSelection();
    let entity = this._getEntityAtCursor();
    let hasSelection = !selection.isCollapsed();
    let isCursorOnLink = (entity != null && entity.type === ENTITY_TYPE.LINK);
    let shouldShowLinkButton = hasSelection || isCursorOnLink;
    return (
      <ButtonGroup>
        <PopoverIconButton
          label="Link"
          iconName="link"
          isDisabled={!shouldShowLinkButton}
          showPopover={this.state.showLinkInput}
          onTogglePopover={this._toggleShowLinkInput}
          onSubmit={this._setLink}
          placeholder="https://www.example.org"
        >
            <div>
                <input id="__rte-new-window" name="target" type="checkbox" value="_blank"/>
                <label htmlFor="__rte-new-window" className={iconStyles['icon-new-window']}></label>
            </div>
        </PopoverIconButton>
        <IconButton
          label="Remove Link"
          iconName="remove-link"
          isDisabled={!isCursorOnLink}
          onClick={this._removeLink}
          focusOnClick={false}
        />
      </ButtonGroup>
    );
  }

  _renderUndoRedo(): React.Element {
    let {showUndoRedo, editorState} = this.props;

    if (!showUndoRedo) {
        return null;
    }

    let canUndo = editorState.getUndoStack().size !== 0;
    let canRedo = editorState.getRedoStack().size !== 0;
    return (
      <ButtonGroup>
        <IconButton
          label="Undo"
          iconName="undo"
          isDisabled={!canUndo}
          onClick={this._undo}
          focusOnClick={false}
        />
        <IconButton
          label="Redo"
          iconName="redo"
          isDisabled={!canRedo}
          onClick={this._redo}
          focusOnClick={false}
        />
      </ButtonGroup>
    );
  }

  _onKeypress(event: Object, eventFlags: Object) {
    // Catch cmd+k for use with link insertion.
    if (hasCommandModifier(event) && event.keyCode === 75) {
      // TODO: Ensure there is some text selected.
      this.setState({showLinkInput: true});
      eventFlags.wasHandled = true;
    }
  }

  _setLink(url: string, additionalData: ?Object) {
    let {editorState} = this.props;
    let selection = editorState.getSelection();
    let entityKey = Entity.create(ENTITY_TYPE.LINK, 'MUTABLE', Object.assign({url}, additionalData));
    this.setState({showLinkInput: false});
    this.props.onChange(
      RichUtils.toggleLink(editorState, selection, entityKey)
    );
    this._focusEditor();
  }

  _removeLink() {
    let {editorState} = this.props;
    let entity = getEntityAtCursor(editorState);
    if (entity != null) {
      let {blockKey, startOffset, endOffset} = entity;
      this.props.onChange(
        clearEntityForRange(editorState, blockKey, startOffset, endOffset)
      );
    }
  }

  _getEntityAtCursor(): ?Entity {
    let {editorState} = this.props;
    let entity = getEntityAtCursor(editorState);
    return (entity == null) ? null : Entity.get(entity.entityKey);
  }

  _getCurrentBlockType(): string {
    let {editorState} = this.props;
    let selection = editorState.getSelection();
    return editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
  }

  _selectBlockType() {
    this._toggleBlockType(...arguments);
    this._focusEditor();
  }

  _toggleBlockType(blockType: string) {
    this.props.onChange(
      RichUtils.toggleBlockType(
        this.props.editorState,
        blockType
      )
    );
  }

  _toggleInlineStyle(inlineStyle: string) {
    this.props.onChange(
      RichUtils.toggleInlineStyle(
        this.props.editorState,
        inlineStyle
      )
    );
  }

  _undo() {
    let {editorState} = this.props;
    this.props.onChange(
      EditorState.undo(editorState)
    );
  }

  _redo() {
    let {editorState} = this.props;
    this.props.onChange(
      EditorState.redo(editorState)
    );
  }

  _focusEditor() {
    // Hacky: Wait to focus the editor so we don't lose selection.
    setTimeout(() => {
      this.props.focusEditor();
    }, 50);
  }
}
