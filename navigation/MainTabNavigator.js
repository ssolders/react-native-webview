import React from 'react';
import {Platform} from 'react-native';
import {createStackNavigator, createBottomTabNavigator} from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import Cashier from '../screens/Cashier';
import HostedFields from '../screens/HostedFields';

const config = Platform.select({
  web: {headerMode: 'screen'},
  default: {},
});

const HomeStack = createStackNavigator(
  {
    Home: HomeScreen,
  },
  config,
);

HomeStack.navigationOptions = {
  tabBarLabel: 'Apple Pay',
  tabBarIcon: ({focused}) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};

HomeStack.path = '';

const CashierStack = createStackNavigator(
  {
    Cashier,
  },
  config,
);

CashierStack.navigationOptions = {
  tabBarLabel: 'Cashier',
  tabBarIcon: ({focused}) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-link' : 'md-link'}
    />
  ),
};

CashierStack.path = '';

const HostedFieldsStack = createStackNavigator(
  {
    HostedFields,
  },
  config,
);

HostedFieldsStack.navigationOptions = {
  tabBarLabel: 'Hosted fields',
  tabBarIcon: ({focused}) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'}
    />
  ),
};

HostedFieldsStack.path = '';

const tabNavigator = createBottomTabNavigator({
  HomeStack,
  CashierStack,
  HostedFieldsStack,
});

tabNavigator.path = '';

export default tabNavigator;
