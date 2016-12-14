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
import {
  getPalette,
  getPaletteName,
  palettes,
} from '../../utils/color/index';

import '../../styles/ColorAndPalettePicker.css';

//todo - this has a lot of logic shared with Symbol Picker, but some differences in data structure etc. Should probably merge them though.

export default class ColorPicker extends Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    current: PropTypes.number,
    onSelectColor: PropTypes.func.isRequired,
    onSelectPalette: PropTypes.func.isRequired,
    palette: PropTypes.string,
  };

  static defaultProps = {
    current: 0,
  };

  /**
   * color selected by clicking
   * @param colorIndex
   */
  onSelectColor = (colorIndex) => {
    this.props.onSelectColor(colorIndex);
  };

  /**
   * user selected a different palette
   * @param paletteName
   */
  onSelectPalette = (paletteName) => {
    this.props.onSelectPalette(paletteName);
  };

  render() {
    const currentPalette = getPalette(this.props.palette);
    const currentPaletteName = getPaletteName(this.props.palette);
    return (
      <div className="color-tabs">
        <div className="ribbon">
          {palettes.map(paletteName => {
            const classes = `tab${paletteName === currentPaletteName ? ' active' : ''}`;
            return <div className={classes} onClick={this.onSelectPalette.bind(this, paletteName)}>{paletteName}</div>
          })}
        </div>
        <div className="color-picker-content">
          <div className="color-picker">
            {currentPalette.map((color, index) => {
              const classes = `color${index === this.props.current ? ' active' : ''}`;
              return <div
                key={index}
                className={classes}
                title={color.name}
                onClick={this.onSelectColor.bind(this, index)}
                style={{ backgroundColor: color.hex }}>
              </div>
            })}
          </div>
        </div>
      </div>
    )
  }
}
