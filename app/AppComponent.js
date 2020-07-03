import React, { PureComponent } from 'react';
import { View, NativeModules } from 'react-native';

import { FormFactor } from '@youi/react-native-youi';

import ACGuide from './components/ACGuide';

if (process.env.NODE_ENV !== 'production') {
  const {whyDidYouUpdate} = require('why-did-you-update');
  whyDidYouUpdate(React);
}

class AppComponent extends PureComponent {
  constructor(props) {
    super(props);

    // 0 = Landscape
    // 1 = Portrait
    // 2 = Auto
    // 3 = LandscapeRight
    // 4 = LandscapeLeft
    // 5 = PortraitUpright
    // 6 = AutoUpright
    const orientation = FormFactor.select({
      Handset: 1,
      default: 6,
    });

    NativeModules.OrientationLock.setRotationMode(orientation);
  }

  render = () => {
    return(
      <View style={{ flex: 1, backgroundColor: '#3b3b3b' }}>
        <ACGuide duration={4}/>
      </View>
    );
  }
};

export default AppComponent;
