import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import CashierWebView from '../components/CashierWebview/Webview';
import {withNavigationFocus} from 'react-navigation';

// export default function CashierScreen() {
class CashierScreen extends Component {
  constructor() {
    super();

    this.shouldReload = false;
  }
  componentDidUpdate(prevProps) {
    if (prevProps.isFocused !== this.props.isFocused) {
      // Use the `this.props.isFocused` boolean
      // Call any action
      console.log('In update set true');
      this.shouldReload = !this.props.isFocused;
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <CashierWebView
          shouldReload={this.shouldReload}
          source={{ uri: `https://hosted-fields-test.netlify.com` }}
        />
      </View>
    );
  }
}

CashierScreen.navigationOptions = {
  title: 'Cashier',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default withNavigationFocus(CashierScreen);
