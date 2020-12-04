//
//  STPAPIClient+ApplePay.m
//  Stripe
//
//  Created by Jack Flintermann on 12/19/14.
//

#import "STPAPIClient+ApplePay.h"

#import "NSError+Stripe.h"
#import "PKPayment+Stripe.h"
#import "STPAPIClient+Private.h"
#import "STPAnalyticsClient.h"
#import "STPSourceParams.h"
#import "STPPaymentMethodAddress.h"
#import "STPPaymentMethodBillingDetails.h"
#import "STPPaymentMethodCardParams.h"
#import "STPPaymentMethodParams.h"
#import "STPTelemetryClient.h"
#import "STPToken.h"

@implementation STPAPIClient (ApplePay)

- (void)createTokenWithPayment:(PKPayment *)payment completion:(STPTokenCompletionBlock)completion {
    NSMutableDictionary *params = [[[self class] parametersForPayment:payment] mutableCopy];
    [[STPTelemetryClient sharedInstance] addTelemetryFieldsToParams:params];
    [self createTokenWithParameters:params
                         completion:completion];
    [[STPTelemetryClient sharedInstance] sendTelemetryData];
}

- (void)createSourceWithPayment:(PKPayment *)payment completion:(STPSourceCompletionBlock)completion {
    NSCAssert(payment != nil, @"'payment' is required to create an apple pay source");
    NSCAssert(completion != nil, @"'completion' is required to use the source that is created");
    [self createTokenWithPayment:payment completion:^(STPToken * _Nullable token, NSError * _Nullable error) {
        if (token.tokenId == nil
            || error != nil) {
            completion(nil, error ?: [NSError stp_genericConnectionError]);
        }
        else {
            STPSourceParams *params = [STPSourceParams new];
            params.type = STPSourceTypeCard;
            params.token = token.tokenId;
            [self createSourceWithParams:params completion:completion];
        }
    }];
}

- (void)createPaymentMethodWithPayment:(PKPayment *)payment completion:(STPPaymentMethodCompletionBlock)completion {
    NSCAssert(payment != nil, @"'payment' is required to create an apple pay payment method");
    NSCAssert(completion != nil, @"'completion' is required to use the payment method that is created");
    [self createTokenWithPayment:payment completion:^(STPToken * _Nullable token, NSError * _Nullable error) {
        if (token.tokenId == nil
            || error != nil) {
            completion(nil, error ?: [NSError stp_genericConnectionError]);
        }
        else {
            STPPaymentMethodCardParams *cardParams = [STPPaymentMethodCardParams new];
            cardParams.token = token.tokenId;
            STPPaymentMethodBillingDetails *billingDetails = [[self class] billingDetailsFromPKContact:payment.billingContact];
            STPPaymentMethodParams *paymentMethodParams = [STPPaymentMethodParams paramsWithCard:cardParams
                                                                                  billingDetails:billingDetails
                                                                                        metadata:nil];
            [self createPaymentMethodWithParams:paymentMethodParams completion:completion];
        }
    }];

}

+ (STPPaymentMethodBillingDetails *)billingDetailsFromPKContact:(PKContact *)billingContact {
    if (billingContact) {
        STPPaymentMethodBillingDetails *details = [[STPPaymentMethodBillingDetails alloc] init];
        NSPersonNameComponents *nameComponents = billingContact.name;
        if (nameComponents) {
            details.name = [NSPersonNameComponentsFormatter localizedStringFromPersonNameComponents:nameComponents
                                                                                       style:NSPersonNameComponentsFormatterStyleDefault
                                                                                     options:(NSPersonNameComponentsFormatterOptions)0];
        }
        CNPostalAddress *cnAddress = billingContact.postalAddress;
        if (cnAddress) {
            STPPaymentMethodAddress *address = [[STPPaymentMethodAddress alloc] init];
            address.line1 = cnAddress.street;
            address.city = cnAddress.city;
            address.state = cnAddress.state;
            address.postalCode = cnAddress.postalCode;
            address.country = cnAddress.ISOCountryCode;
            details.address = address;
        }
        return details;
    }
    else {
        return nil;
    }
}

+ (NSDictionary *)addressParamsFromPKContact:(PKContact *)billingContact {
    if (billingContact) {
        NSMutableDictionary *params = [NSMutableDictionary dictionary];

        NSPersonNameComponents *nameComponents = billingContact.name;
        if (nameComponents) {
            params[@"name"] = [NSPersonNameComponentsFormatter localizedStringFromPersonNameComponents:nameComponents
                                                                                       style:NSPersonNameComponentsFormatterStyleDefault
                                                                                     options:(NSPersonNameComponentsFormatterOptions)0];
        }

        CNPostalAddress *address = billingContact.postalAddress;
        if (address) {
            params[@"address_line1"] = address.street;
            params[@"address_city"] = address.city;
            params[@"address_state"] = address.state;
            params[@"address_zip"] = address.postalCode;
            params[@"address_country"] = address.ISOCountryCode;
        }

        return params;
    }
    else {
        return nil;
    }
}

+ (NSDictionary *)parametersForPayment:(PKPayment *)payment {
    NSCAssert(payment != nil, @"Cannot create a token with a nil payment.");

    NSString *paymentString = [[NSString alloc] initWithData:payment.token.paymentData encoding:NSUTF8StringEncoding];
    NSMutableDictionary *payload = [NSMutableDictionary new];
    payload[@"pk_token"] = paymentString;
    payload[@"card"] = [self addressParamsFromPKContact:payment.billingContact];

    NSCAssert(!(paymentString.length == 0 && [[Stripe defaultPublishableKey] hasPrefix:@"pk_live"]), @"The pk_token is empty. Using Apple Pay with an iOS Simulator while not in Stripe Test Mode will always fail.");

    NSString *paymentInstrumentName = payment.token.paymentMethod.displayName;
    if (paymentInstrumentName) {
        payload[@"pk_token_instrument_name"] = paymentInstrumentName;
    }

    NSString *paymentNetwork = payment.token.paymentMethod.network;
    if (paymentNetwork) {
        payload[@"pk_token_payment_network"] = paymentNetwork;
    }

    NSString *transactionIdentifier = payment.token.transactionIdentifier;
    if (transactionIdentifier) {
        if ([payment stp_isSimulated]) {
            transactionIdentifier = [PKPayment stp_testTransactionIdentifier];
        }
        payload[@"pk_token_transaction_id"] = transactionIdentifier;
    }

    return payload;
}

#pragma mark - Errors

+ (NSError *)pkPaymentErrorForStripeError:(NSError *)stripeError {
    if (stripeError == nil) {
        return nil;
    }
    NSMutableDictionary *userInfo = [stripeError.userInfo mutableCopy];
    PKPaymentErrorCode errorCode = PKPaymentUnknownError;
    if (stripeError.domain == StripeDomain) {
        if ([stripeError.userInfo[STPCardErrorCodeKey] isEqualToString:STPIncorrectZip]) {
            errorCode = PKPaymentBillingContactInvalidError;
            userInfo[PKPaymentErrorPostalAddressUserInfoKey] = CNPostalAddressPostalCodeKey;
        }
    }
    return [NSError errorWithDomain:PKPaymentErrorDomain code:errorCode userInfo:userInfo];
}

@end

void linkSTPAPIClientApplePayCategory(void){}
