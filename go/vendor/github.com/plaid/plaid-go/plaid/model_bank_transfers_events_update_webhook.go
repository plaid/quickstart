/*
 * The Plaid API
 *
 * The Plaid REST API. Please see https://plaid.com/docs/api for more details.
 *
 * API version: 2020-09-14_1.31.1
 */

// Code generated by OpenAPI Generator (https://openapi-generator.tech); DO NOT EDIT.

package plaid

import (
	"encoding/json"
)

// BankTransfersEventsUpdateWebhook Fired when new bank transfer events are available. Receiving this webhook indicates you should fetch the new events from `/bank_transfer/event/sync`.
type BankTransfersEventsUpdateWebhook struct {
	// `BANK_TRANSFERS`
	WebhookType string `json:"webhook_type"`
	// `BANK_TRANSFERS_EVENTS_UPDATE`
	WebhookCode string `json:"webhook_code"`
	AdditionalProperties map[string]interface{}
}

type _BankTransfersEventsUpdateWebhook BankTransfersEventsUpdateWebhook

// NewBankTransfersEventsUpdateWebhook instantiates a new BankTransfersEventsUpdateWebhook object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewBankTransfersEventsUpdateWebhook(webhookType string, webhookCode string) *BankTransfersEventsUpdateWebhook {
	this := BankTransfersEventsUpdateWebhook{}
	this.WebhookType = webhookType
	this.WebhookCode = webhookCode
	return &this
}

// NewBankTransfersEventsUpdateWebhookWithDefaults instantiates a new BankTransfersEventsUpdateWebhook object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewBankTransfersEventsUpdateWebhookWithDefaults() *BankTransfersEventsUpdateWebhook {
	this := BankTransfersEventsUpdateWebhook{}
	return &this
}

// GetWebhookType returns the WebhookType field value
func (o *BankTransfersEventsUpdateWebhook) GetWebhookType() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.WebhookType
}

// GetWebhookTypeOk returns a tuple with the WebhookType field value
// and a boolean to check if the value has been set.
func (o *BankTransfersEventsUpdateWebhook) GetWebhookTypeOk() (*string, bool) {
	if o == nil  {
		return nil, false
	}
	return &o.WebhookType, true
}

// SetWebhookType sets field value
func (o *BankTransfersEventsUpdateWebhook) SetWebhookType(v string) {
	o.WebhookType = v
}

// GetWebhookCode returns the WebhookCode field value
func (o *BankTransfersEventsUpdateWebhook) GetWebhookCode() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.WebhookCode
}

// GetWebhookCodeOk returns a tuple with the WebhookCode field value
// and a boolean to check if the value has been set.
func (o *BankTransfersEventsUpdateWebhook) GetWebhookCodeOk() (*string, bool) {
	if o == nil  {
		return nil, false
	}
	return &o.WebhookCode, true
}

// SetWebhookCode sets field value
func (o *BankTransfersEventsUpdateWebhook) SetWebhookCode(v string) {
	o.WebhookCode = v
}

func (o BankTransfersEventsUpdateWebhook) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if true {
		toSerialize["webhook_type"] = o.WebhookType
	}
	if true {
		toSerialize["webhook_code"] = o.WebhookCode
	}

	for key, value := range o.AdditionalProperties {
		toSerialize[key] = value
	}

	return json.Marshal(toSerialize)
}

func (o *BankTransfersEventsUpdateWebhook) UnmarshalJSON(bytes []byte) (err error) {
	varBankTransfersEventsUpdateWebhook := _BankTransfersEventsUpdateWebhook{}

	if err = json.Unmarshal(bytes, &varBankTransfersEventsUpdateWebhook); err == nil {
		*o = BankTransfersEventsUpdateWebhook(varBankTransfersEventsUpdateWebhook)
	}

	additionalProperties := make(map[string]interface{})

	if err = json.Unmarshal(bytes, &additionalProperties); err == nil {
		delete(additionalProperties, "webhook_type")
		delete(additionalProperties, "webhook_code")
		o.AdditionalProperties = additionalProperties
	}

	return err
}

type NullableBankTransfersEventsUpdateWebhook struct {
	value *BankTransfersEventsUpdateWebhook
	isSet bool
}

func (v NullableBankTransfersEventsUpdateWebhook) Get() *BankTransfersEventsUpdateWebhook {
	return v.value
}

func (v *NullableBankTransfersEventsUpdateWebhook) Set(val *BankTransfersEventsUpdateWebhook) {
	v.value = val
	v.isSet = true
}

func (v NullableBankTransfersEventsUpdateWebhook) IsSet() bool {
	return v.isSet
}

func (v *NullableBankTransfersEventsUpdateWebhook) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableBankTransfersEventsUpdateWebhook(val *BankTransfersEventsUpdateWebhook) *NullableBankTransfersEventsUpdateWebhook {
	return &NullableBankTransfersEventsUpdateWebhook{value: val, isSet: true}
}

func (v NullableBankTransfersEventsUpdateWebhook) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableBankTransfersEventsUpdateWebhook) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


