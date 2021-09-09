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

// InstitutionsSearchAccountFilter struct for InstitutionsSearchAccountFilter
type InstitutionsSearchAccountFilter struct {
	Loan *[]AccountSubtype `json:"loan,omitempty"`
	Depository *[]AccountSubtype `json:"depository,omitempty"`
	Credit *[]AccountSubtype `json:"credit,omitempty"`
	Investment *[]AccountSubtype `json:"investment,omitempty"`
	AdditionalProperties map[string]interface{}
}

type _InstitutionsSearchAccountFilter InstitutionsSearchAccountFilter

// NewInstitutionsSearchAccountFilter instantiates a new InstitutionsSearchAccountFilter object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewInstitutionsSearchAccountFilter() *InstitutionsSearchAccountFilter {
	this := InstitutionsSearchAccountFilter{}
	return &this
}

// NewInstitutionsSearchAccountFilterWithDefaults instantiates a new InstitutionsSearchAccountFilter object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewInstitutionsSearchAccountFilterWithDefaults() *InstitutionsSearchAccountFilter {
	this := InstitutionsSearchAccountFilter{}
	return &this
}

// GetLoan returns the Loan field value if set, zero value otherwise.
func (o *InstitutionsSearchAccountFilter) GetLoan() []AccountSubtype {
	if o == nil || o.Loan == nil {
		var ret []AccountSubtype
		return ret
	}
	return *o.Loan
}

// GetLoanOk returns a tuple with the Loan field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *InstitutionsSearchAccountFilter) GetLoanOk() (*[]AccountSubtype, bool) {
	if o == nil || o.Loan == nil {
		return nil, false
	}
	return o.Loan, true
}

// HasLoan returns a boolean if a field has been set.
func (o *InstitutionsSearchAccountFilter) HasLoan() bool {
	if o != nil && o.Loan != nil {
		return true
	}

	return false
}

// SetLoan gets a reference to the given []AccountSubtype and assigns it to the Loan field.
func (o *InstitutionsSearchAccountFilter) SetLoan(v []AccountSubtype) {
	o.Loan = &v
}

// GetDepository returns the Depository field value if set, zero value otherwise.
func (o *InstitutionsSearchAccountFilter) GetDepository() []AccountSubtype {
	if o == nil || o.Depository == nil {
		var ret []AccountSubtype
		return ret
	}
	return *o.Depository
}

// GetDepositoryOk returns a tuple with the Depository field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *InstitutionsSearchAccountFilter) GetDepositoryOk() (*[]AccountSubtype, bool) {
	if o == nil || o.Depository == nil {
		return nil, false
	}
	return o.Depository, true
}

// HasDepository returns a boolean if a field has been set.
func (o *InstitutionsSearchAccountFilter) HasDepository() bool {
	if o != nil && o.Depository != nil {
		return true
	}

	return false
}

// SetDepository gets a reference to the given []AccountSubtype and assigns it to the Depository field.
func (o *InstitutionsSearchAccountFilter) SetDepository(v []AccountSubtype) {
	o.Depository = &v
}

// GetCredit returns the Credit field value if set, zero value otherwise.
func (o *InstitutionsSearchAccountFilter) GetCredit() []AccountSubtype {
	if o == nil || o.Credit == nil {
		var ret []AccountSubtype
		return ret
	}
	return *o.Credit
}

// GetCreditOk returns a tuple with the Credit field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *InstitutionsSearchAccountFilter) GetCreditOk() (*[]AccountSubtype, bool) {
	if o == nil || o.Credit == nil {
		return nil, false
	}
	return o.Credit, true
}

// HasCredit returns a boolean if a field has been set.
func (o *InstitutionsSearchAccountFilter) HasCredit() bool {
	if o != nil && o.Credit != nil {
		return true
	}

	return false
}

// SetCredit gets a reference to the given []AccountSubtype and assigns it to the Credit field.
func (o *InstitutionsSearchAccountFilter) SetCredit(v []AccountSubtype) {
	o.Credit = &v
}

// GetInvestment returns the Investment field value if set, zero value otherwise.
func (o *InstitutionsSearchAccountFilter) GetInvestment() []AccountSubtype {
	if o == nil || o.Investment == nil {
		var ret []AccountSubtype
		return ret
	}
	return *o.Investment
}

// GetInvestmentOk returns a tuple with the Investment field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *InstitutionsSearchAccountFilter) GetInvestmentOk() (*[]AccountSubtype, bool) {
	if o == nil || o.Investment == nil {
		return nil, false
	}
	return o.Investment, true
}

// HasInvestment returns a boolean if a field has been set.
func (o *InstitutionsSearchAccountFilter) HasInvestment() bool {
	if o != nil && o.Investment != nil {
		return true
	}

	return false
}

// SetInvestment gets a reference to the given []AccountSubtype and assigns it to the Investment field.
func (o *InstitutionsSearchAccountFilter) SetInvestment(v []AccountSubtype) {
	o.Investment = &v
}

func (o InstitutionsSearchAccountFilter) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if o.Loan != nil {
		toSerialize["loan"] = o.Loan
	}
	if o.Depository != nil {
		toSerialize["depository"] = o.Depository
	}
	if o.Credit != nil {
		toSerialize["credit"] = o.Credit
	}
	if o.Investment != nil {
		toSerialize["investment"] = o.Investment
	}

	for key, value := range o.AdditionalProperties {
		toSerialize[key] = value
	}

	return json.Marshal(toSerialize)
}

func (o *InstitutionsSearchAccountFilter) UnmarshalJSON(bytes []byte) (err error) {
	varInstitutionsSearchAccountFilter := _InstitutionsSearchAccountFilter{}

	if err = json.Unmarshal(bytes, &varInstitutionsSearchAccountFilter); err == nil {
		*o = InstitutionsSearchAccountFilter(varInstitutionsSearchAccountFilter)
	}

	additionalProperties := make(map[string]interface{})

	if err = json.Unmarshal(bytes, &additionalProperties); err == nil {
		delete(additionalProperties, "loan")
		delete(additionalProperties, "depository")
		delete(additionalProperties, "credit")
		delete(additionalProperties, "investment")
		o.AdditionalProperties = additionalProperties
	}

	return err
}

type NullableInstitutionsSearchAccountFilter struct {
	value *InstitutionsSearchAccountFilter
	isSet bool
}

func (v NullableInstitutionsSearchAccountFilter) Get() *InstitutionsSearchAccountFilter {
	return v.value
}

func (v *NullableInstitutionsSearchAccountFilter) Set(val *InstitutionsSearchAccountFilter) {
	v.value = val
	v.isSet = true
}

func (v NullableInstitutionsSearchAccountFilter) IsSet() bool {
	return v.isSet
}

func (v *NullableInstitutionsSearchAccountFilter) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableInstitutionsSearchAccountFilter(val *InstitutionsSearchAccountFilter) *NullableInstitutionsSearchAccountFilter {
	return &NullableInstitutionsSearchAccountFilter{value: val, isSet: true}
}

func (v NullableInstitutionsSearchAccountFilter) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableInstitutionsSearchAccountFilter) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


