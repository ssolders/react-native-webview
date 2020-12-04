import React, { Component, Fragment } from 'react';
import {SafeAreaView, StyleSheet, ScrollView, View, Text, StatusBar, Button, Alert} from 'react-native';
import {Header, Colors} from 'react-native/Libraries/NewAppScreen';
const PaymentRequest = require('react-native-payments').PaymentRequest;

class HomeScreen extends Component {
  constructor() {
    super();
    
    this.state = {
      txData: {
        transactionIdentifier: '',
        paymentData: {}
      }
    }

    // this.applePayConfig = {
    //   METHOD_DATA: [{
    //   supportedMethods: ['apple-pay'],
    //   data: {
    //     merchantIdentifier: 'merchant.com.paymentiqtest',
    //     supportedNetworks: ['visa', 'mastercard', 'amex'],
    //     countryCode: 'SE',
    //     currencyCode: 'SEK'
    //   }
    //   }],
    //   DETAILS: {
    //     id: 'basic-example',
    //     displayItems: [
    //       {
    //         label: 'Deposit',
    //         amount: { currency: 'SEK', value: '200.00' }
    //       }
    //     ],
    //     shippingOptions: [{
    //       id: 'economy',
    //       label: 'Economy Shipping',
    //       amount: { currency: 'SEK', value: '0.00' },
    //       detail: 'Arrives in 3-5 days' // `detail` is specific to React Native Payments
    //     }],
    //     total: {
    //       label: 'Devcode',
    //       amount: { currency: 'SEK', value: '200.00' }
    //     }
    //   },
    //   OPTIONS: {
    //     requestPayerName: true,
    //     requestPayerPhone: true,
    //     requestPayerEmail: true,
    //     requestShipping: true
    //   }
    // }
  }

  componentDidMount () {
    // const { METHOD_DATA, DETAILS, OPTIONS } = this.applePayConfig
    // this.paymentRequest = new PaymentRequest(METHOD_DATA, DETAILS, OPTIONS)

    // this.paymentRequest.addEventListener('shippingaddresschange', e => {
    //   const updatedDetails = getUpdatedDetailsForShippingAddress(paymentRequest.shippingAddress);
    
    //   e.updateWith(updatedDetails);
    // })
    
    // this.paymentRequest.addEventListener('shippingoptionchange', e => {
    //   const updatedDetails = getUpdatedDetailsForShippingOption(paymentRequest.shippingOption);
    
    //   e.updateWith(updatedDetails);
    // })
  }


  check () {
    console.log(this.paymentRequest)
    const { paymentRequest } = this
    if (paymentRequest) {
      paymentRequest.canMakePayments().then((canMakePayment) => {
        if (canMakePayment) {
          Alert.alert(
            'Apple Pay',
            'Apple Pay is available in this device'
          );
        } else {
          Alert.alert(
            'Apple Pay',
            'Apple Pay is not available on this device'
          );
        }
      }).catch(err => {
        console.error(err)
      })
    } else {
      Alert.alert(`this.paymentRequest is not defined`);
    }
  }

  pay () {
    const { paymentRequest } = this
      paymentRequest.canMakePayments().then((canMakePayment) => {
      if (canMakePayment) {
        paymentRequest.show().then(paymentResponse => {
          const { transactionIdentifier, paymentData } = paymentResponse.details
          this.setState({
            txData: {
              transactionIdentifier: transactionIdentifier || 'no identifier',
              paymentData: paymentData || 'no data'
            }
          })
          paymentResponse.complete('success')
        }).catch(error => {
          console.error(error)
        }) 
      } else {
        console.log('Cant Make Payment')
      }
    })
  }

  render () {
    return (
      <Fragment>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            <Header />
            {global.HermesInternal == null ? null : (
              <View style={styles.engine}>
                <Text style={styles.footer}>Engine: Hermes</Text>
              </View>
            )}
            <View style={styles.body}>
              <View style={styles.sectionContainer}>
                <View>
                  <Text style={styles.sectionTitle}>Cart</Text>
                  <Text>{this.state.txData.transactionIdentifier}</Text>
                  <Text>{JSON.stringify(this.state.txData.paymentData, null, 4)}</Text>
                  <Text style={styles.sectionDescription}>
                    Simulating your cart items in an app
                </Text>
                </View>
              </View>
              <View style={styles.itemContainer}>
                <View style={styles.itemDetail}>
                  <Text style={styles.itemTitle}>Deposit 200 SEK</Text>
                </View>
                <View style={styles.itemPrice}>
                  <Text>200.00 SEK</Text>
                </View>
              </View>
              <View style={styles.totalContainer}>
                <View style={styles.itemDetail}>
                  <Text style={styles.itemTitle}>Total</Text>
                </View>
                <View style={styles.itemPrice}>
                  <Text>200.00 SEK</Text>
                </View>
              </View>
              <Button style={styles.payButton}
                title="Pay with Apple Pay"
                onPress={() => this.pay()} />
            </View>

            <Button style={styles.payButton}
                title="Check Apple Pay"
                onPress={() => this.check()} />
          </ScrollView>
        </SafeAreaView>
      </Fragment>
    )
  }
}

const styles = StyleSheet.create({
  scrollView: { backgroundColor: Colors.lighter},
  engine: { position: 'absolute', right: 0},
  body: {backgroundColor: Colors.white, borderBottomColor: "#cccccc", borderBottomWidth: 1, paddingBottom: 10},  
  sectionContainer: { marginTop: 32, paddingHorizontal: 24 },  
  itemContainer: {marginTop: 12,paddingHorizontal: 24,display: "flex",flexDirection: 'row'},
  totalContainer: {marginTop: 12,paddingHorizontal: 24,display: "flex",flexDirection: 'row',borderTopColor: "#cccccc",borderTopWidth: 1,paddingTop: 10,marginBottom: 20},
  itemDetail: {flex: 2},
  itemTitle: {fontWeight: '500',fontSize: 18},
  itemDescription: {fontSize: 12},
  itemPrice: {flex: 1},
  sectionTitle: {fontSize: 24,fontWeight: '600',color: Colors.black,},
  sectionDescription: {marginTop: 8,fontSize: 12,fontWeight: '400',color: Colors.dark,},
  highlight: {fontWeight: '700',},
  footer: {color: Colors.dark,fontSize: 12,fontWeight: '600',padding: 4,paddingRight: 12,textAlign: 'right',},
});

export default HomeScreen
