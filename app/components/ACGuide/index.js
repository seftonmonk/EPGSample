import React, { PureComponent, createRef } from 'react';
import { View, NativeModules } from 'react-native';
import { FormFactor } from '@youi/react-native-youi';

import ACChannels from './subcomponents/ACChannels';
import ACTimeslots from './subcomponents/ACTimeslots';

import PropTypes from 'prop-types';
import { ACDefaultHeight, ACTimeslotDefaultWidth } from '../../styles';

const schedules = require('../../store/schedules.json');

const { Dimensions } = NativeModules;

export default class ACGuide extends PureComponent {
  static propTypes = {
    duration: PropTypes.number,
  };

  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      duration: Math.ceil(this.props.duration ? this.props.duration : Dimensions.window.width / ACTimeslotDefaultWidth),
    }

    this.epgChannels = createRef();
    this.epgTimeslots = createRef();
  }

  componentDidMount = () => {
    // Working under the assumption that duration is measured in seconds.
    const placeholder = {
      title: 'No Programming',
      images: [{}, {}, { width: 0, height: 0, imageUrl: null }],
      consumables: [{ duration: 3600 }],
    };

    // The modal doesn't move vertically.
    //
    // This block rips through the schedule and adds as many rows as necessary to 
    // ensure that the last row can be selected and renders above the modal's
    // location.
    const fillerRows = FormFactor.isTV ? Math.floor(Dimensions.window.height / ACDefaultHeight) : 0;

    for (var i = 0; i < fillerRows; i++) {
      let contents = [];

      // We're using two magic numbers here - not great I know.
      //
      // We work under the assumption that a column is only 60 minutes.
      for (var j = 0; j < this.state.duration; j ++) contents.push({ ...placeholder, empty: true });

      schedules.push({ channel: { name: null, resourceId: null }, contents });
    }

    // Sometimes the data is garbage and we need to fill out what's missing in the
    // row.  This is yuck but it gets the job done.
    for (var k = 0; k < schedules.length; k++)
      for (var l = 0; l < this.state.duration; l++) schedules[k].contents.push(placeholder);

    // Once complete, we store the schedule and ready flag.
    this.setState({
      channels: schedules,
      ready: true,
    });
  }

  // scroll the channel list to match
  handleOnScroll = yOffset => {
    if (!FormFactor.isTV) {
      this.epgChannels.current.scrollTo(yOffset);
    }
  };

  handleOnFocus = (xOffset, yOffset, data) => {
    this.epgChannels.current.scrollTo(yOffset);
    this.epgTimeslots.current.scrollTo(xOffset, yOffset);

    // if (FormFactor.isTV) {
      this.epgTimeslots.current.showModal(data);
    // }
  }

  render = () => {
    const { channels, duration, ready } = this.state;

    // If ready is not set we return nothing - Dine & Dash!
    if (!ready) return null;

    const containerStyle = {
      ...this.props.style,
      flexDirection: 'row',
    };

    return(
      <View style={containerStyle}>
        <View style={{ flex: 1, flexDirection: 'column' ,marginRight:-3, zIndex:10}}>
          <ACChannels ref={this.epgChannels} channels={channels} />
        </View>
        <View style={{ flex: 11 }}>
          <ACTimeslots
            ref={this.epgTimeslots}
            channels={channels}
            duration={duration}
            onFocus={this.handleOnFocus}
            onScroll={this.handleOnScroll} />
        </View>
      </View>
    );
  }
};
