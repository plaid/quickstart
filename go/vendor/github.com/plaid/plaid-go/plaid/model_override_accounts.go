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

// OverrideAccounts Data to use to set values of test accounts. Some values cannot be specified in the schema and will instead will be calculated from other test data in order to achieve more consistent, realistic test data.
type OverrideAccounts struct {
	Type OverrideAccountType `json:"type"`
	Subtype NullableAccountSubtype `json:"subtype"`
	// If provided, the account will start with this amount as the current balance. 
	StartingBalance float32 `json:"starting_balance"`
	// If provided, the account will always have this amount as its  available balance, regardless of current balance or changes in transactions over time.
	ForceAvailableBalance float32 `json:"force_available_balance"`
	// ISO-4217 currency code. If provided, the account will be denominated in the given currency. Transactions will also be in this currency by default.
	Currency string `json:"currency"`
	Meta Meta `json:"meta"`
	Numbers Numbers `json:"numbers"`
	// Specify the list of transactions on the account.
	Transactions []TransactionOverride `json:"transactions"`
	Holdings *HoldingsOverride `json:"holdings,omitempty"`
	InvestmentTransactions *InvestmentsTransactionsOverride `json:"investment_transactions,omitempty"`
	Identity OwnerOverride `json:"identity"`
	Liability LiabilityOverride `json:"liability"`
	InflowModel InflowModel `json:"inflow_model"`
	AdditionalProperties map[string]interface{}
}

type _OverrideAccounts OverrideAccounts

// NewOverrideAccounts instantiates a new OverrideAccounts object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewOverrideAccounts(type_ OverrideAccountType, subtype NullableAccountSubtype, startingBalance float32, forceAvailableBalance float32, currency string, meta Meta, numbers Numbers, transactions []TransactionOverride, identity OwnerOverride, liability LiabilityOverride, inflowModel InflowModel) *OverrideAccounts {
	this := OverrideAccounts{}
	this.Type = type_
	this.Subtype = subtype
	this.StartingBalance = startingBalance
	this.ForceAvailableBalance = forceAvailableBalance
	this.Currency = currency
	this.Meta = meta
	this.Numbers = numbers
	this.Transactions = transactions
	this.Identity = identity
	this.Liability = liability
	this.InflowModel = inflowModel
	return &this
}

// NewOverrideAccountsWithDefaults instantiates a new OverrideAccounts object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewOverrideAccountsWithDefaults() *OverrideAccounts {
	this := OverrideAccounts{}
	return &this
}

// GetType returns the Type field value
func (o *OverrideAccounts) GetType() OverrideAccountType {
	if o == nil {
		var ret OverrideAccountType
		return ret
	}

	return o.Type
}

// GetTypeOk returns a tuple with the Type field value
// and a boolean to check if the value has been set.
func (o *OverrideAccounts) GetTypeOk() (*OverrideAccountType, bool) {
	if o == nil  {
		return nil, false
	}
	return &o.Type, true
}

// SetType sets field value
func (o *OverrideAccounts) SetType(v OverrideAccountType) {
	o.Type = v
}

// GetSubtype returns the Subtype field value
// If the value is explicit nil, the zero value for AccountSubtype will be returned
func (o *OverrideAccounts) GetSubtype() AccountSubtype {
	if o == nil || o.Subtype.Get() == nil {
		var ret AccountSubtype
		return ret
	}

	return *o.Subtype.Get()
}

// GetSubtypeOk returns a tuple with the Subtype field value
// and a boolean to check if the value has been set.
// NOTE: If the value is an explicit nil, `nil, true` will be returned
func (o *OverrideAccounts) GetSubtypeOk() (*AccountSubtype, bool) {
	if o == nil  {
		return nil, false
	}
	return o.Subtype.Get(), o.Subtype.IsSet()
}

// SetSubtype sets field value
func (o *OverrideAccounts) SetSubtype(v AccountSubtype) {
	o.Subtype.Set(&v)
}

// GetStartingBalance returns the StartingBalance field value
func (o *OverrideAccounts) GetStartingBalance() float32 {
	if o == nil {
		var ret float32
		return ret
	}

	return o.StartingBalance
}

// GetStartingBalanceOk returns a tuple with the StartingBalance field value
// and a boolean to check if the value has been set.
func (o *OverrideAccounts) GetStartingBalanceOk() (*float32, bool) {
	if o == nil  {
		return nil, false
	}
	return &o.StartingBalance, true
}

// SetStartingBalance sets field value
func (o *OverrideAccounts) SetStartingBalance(v float32) {
	o.StartingBalance = v
}

// GetForceAvailableBalance returns the ForceAvailableBalance field value
func (o *OverrideAccounts) GetForceAvailableBalance() float32 {
	if o == nil {
		var ret float32
		return ret
	}

	return o.ForceAvailableBalance
}

// GetForceAvailableBalanceOk returns a tuple with the ForceAvailableBalance field value
// and a boolean to check if the value has been set.
func (o *OverrideAccounts) GetForceAvailableBalanceOk() (*float32, bool) {
	if o == nil  {
		return nil, false
	}
	return &o.ForceAvailableBalance, true
}

// SetForceAvailableBalance sets field value
func (o *OverrideAccounts) SetForceAvailableBalance(v float32) {
	o.ForceAvailableBalance = v
}

// GetCurrency returns the Currency field value
func (o *OverrideAccounts) GetCurrency() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.Currency
}

// GetCurrencyOk returns a tuple with the Currency field value
// and a boolean to check if the value has been set.
func (o *OverrideAccounts) GetCurrencyOk() (*string, bool) {
	if o == nil  {
		return nil, false
	}
	return &o.Currency, true
}

// SetCurrency sets field value
func (o *OverrideAccounts) SetCurrency(v string) {
	o.Currency = v
}

// GetMeta returns the Meta field value
func (o *OverrideAccounts) GetMeta() Meta {
	if o == nil {
		var ret Meta
		return ret
	}

	return o.Meta
}

// GetMetaOk returns a tuple with the Meta field value
// and a boolean to check if the value has been set.
func (o *OverrideAccounts) GetMetaOk() (*Meta, bool) {
	if o == nil  {
		return nil, false
	}
	return &o.Meta, true
}

// SetMeta sets field value
func (o *OverrideAccounts) SetMeta(v Meta) {
	o.Meta = v
}

// GetNumbers returns the Numbers field value
func (o *OverrideAccounts) GetNumbers() Numbers {
	if o == nil {
		var ret Numbers
		return ret
	}

	return o.Numbers
}

// GetNumbersOk returns a tuple with the Numbers field value
// and a boolean to check if the value has been set.
func (o *OverrideAccounts) GetNumbersOk() (*Numbers, bool) {
	if o == nil  {
		return nil, false
	}
	return &o.Numbers, true
}

// SetNumbers sets field value
func (o *OverrideAccounts) SetNumbers(v Numbers) {
	o.Numbers = v
}

// GetTransactions returns the Transactions field value
func (o *OverrideAccounts) GetTransactions() []TransactionOverride {
	if o == nil {
		var ret []TransactionOverride
		return ret
	}

	return o.Transactions
}

// GetTransactionsOk returns a tuple with the Transactions field value
// and a boolean to check if the value has been set.
func (o *OverrideAccounts) GetTransactionsOk() (*[]TransactionOverride, bool) {
	if o == nil  {
		return nil, false
	}
	return &o.Transactions, true
}

// SetTransactions sets field value
func (o *OverrideAccounts) SetTransactions(v []TransactionOverride) {
	o.Transactions = v
}

// GetHoldings returns the Holdings field value if set, zero value otherwise.
func (o *OverrideAccounts) GetHoldings() HoldingsOverride {
	if o == nil || o.Holdings == nil {
		var ret HoldingsOverride
		return ret
	}
	return *o.Holdings
}

// GetHoldingsOk returns a tuple with the Holdings field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *OverrideAccounts) GetHoldingsOk() (*HoldingsOverride, bool) {
	if o == nil || o.Holdings == nil {
		return nil, false
	}
	return o.Holdings, true
}

// HasHoldings returns a boolean if a field has been set.
func (o *OverrideAccounts) HasHoldings() bool {
	if o != nil && o.Holdings != nil {
		return true
	}

	return false
}

// SetHoldings gets a reference to the given HoldingsOverride and assigns it to the Holdings field.
func (o *OverrideAccounts) SetHoldings(v HoldingsOverride) {
	o.Holdings = &v
}

// GetInvestmentTransactions returns the InvestmentTransactions field value if set, zero value otherwise.
func (o *OverrideAccounts) GetInvestmentTransactions() InvestmentsTransactionsOverride {
	if o == nil || o.InvestmentTransactions == nil {
		var ret InvestmentsTransactionsOverride
		return ret
	}
	return *o.InvestmentTransactions
}

// GetInvestmentTransactionsOk returns a tuple with the InvestmentTransactions field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *OverrideAccounts) GetInvestmentTransactionsOk() (*InvestmentsTransactionsOverride, bool) {
	if o == nil || o.InvestmentTransactions == nil {
		return nil, false
	}
	return o.InvestmentTransactions, true
}

// HasInvestmentTransactions returns a boolean if a field has been set.
func (o *OverrideAccounts) HasInvestmentTransactions() bool {
	if o != nil && o.InvestmentTransactions != nil {
		return true
	}

	return false
}

// SetInvestmentTransactions gets a reference to the given InvestmentsTransactionsOverride and assigns it to the InvestmentTransactions field.
func (o *OverrideAccounts) SetInvestmentTransactions(v InvestmentsTransactionsOverride) {
	o.InvestmentTransactions = &v
}

// GetIdentity returns the Identity field value
func (o *OverrideAccounts) GetIdentity() OwnerOverride {
	if o == nil {
		var ret OwnerOverride
		return ret
	}

	return o.Identity
}

// GetIdentityOk returns a tuple with the Identity field value
// and a boolean to check if the value has been set.
func (o *OverrideAccounts) GetIdentityOk() (*OwnerOverride, bool) {
	if o == nil  {
		return nil, false
	}
	return &o.Identity, true
}

// SetIdentity sets field value
func (o *OverrideAccounts) SetIdentity(v OwnerOverride) {
	o.Identity = v
}

// GetLiability returns the Liability field value
func (o *OverrideAccounts) GetLiability() LiabilityOverride {
	if o == nil {
		var ret LiabilityOverride
		return ret
	}

	return o.Liability
}

// GetLiabilityOk returns a tuple with the Liability field value
// and a boolean to check if the value has been set.
func (o *OverrideAccounts) GetLiabilityOk() (*LiabilityOverride, bool) {
	if o == nil  {
		return nil, false
	}
	return &o.Liability, true
}

// SetLiability sets field value
func (o *OverrideAccounts) SetLiability(v LiabilityOverride) {
	o.Liability = v
}

// GetInflowModel returns the InflowModel field value
func (o *OverrideAccounts) GetInflowModel() InflowModel {
	if o == nil {
		var ret InflowModel
		return ret
	}

	return o.InflowModel
}

// GetInflowModelOk returns a tuple with the InflowModel field value
// and a boolean to check if the value has been set.
func (o *OverrideAccounts) GetInflowModelOk() (*InflowModel, bool) {
	if o == nil  {
		return nil, false
	}
	return &o.InflowModel, true
}

// SetInflowModel sets field value
func (o *OverrideAccounts) SetInflowModel(v InflowModel) {
	o.InflowModel = v
}

func (o OverrideAccounts) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if true {
		toSerialize["type"] = o.Type
	}
	if true {
		toSerialize["subtype"] = o.Subtype.Get()
	}
	if true {
		toSerialize["starting_balance"] = o.StartingBalance
	}
	if true {
		toSerialize["force_available_balance"] = o.ForceAvailableBalance
	}
	if true {
		toSerialize["currency"] = o.Currency
	}
	if true {
		toSerialize["meta"] = o.Meta
	}
	if true {
		toSerialize["numbers"] = o.Numbers
	}
	if true {
		toSerialize["transactions"] = o.Transactions
	}
	if o.Holdings != nil {
		toSerialize["holdings"] = o.Holdings
	}
	if o.InvestmentTransactions != nil {
		toSerialize["investment_transactions"] = o.InvestmentTransactions
	}
	if true {
		toSerialize["identity"] = o.Identity
	}
	if true {
		toSerialize["liability"] = o.Liability
	}
	if true {
		toSerialize["inflow_model"] = o.InflowModel
	}

	for key, value := range o.AdditionalProperties {
		toSerialize[key] = value
	}

	return json.Marshal(toSerialize)
}

func (o *OverrideAccounts) UnmarshalJSON(bytes []byte) (err error) {
	varOverrideAccounts := _OverrideAccounts{}

	if err = json.Unmarshal(bytes, &varOverrideAccounts); err == nil {
		*o = OverrideAccounts(varOverrideAccounts)
	}

	additionalProperties := make(map[string]interface{})

	if err = json.Unmarshal(bytes, &additionalProperties); err == nil {
		delete(additionalProperties, "type")
		delete(additionalProperties, "subtype")
		delete(additionalProperties, "starting_balance")
		delete(additionalProperties, "force_available_balance")
		delete(additionalProperties, "currency")
		delete(additionalProperties, "meta")
		delete(additionalProperties, "numbers")
		delete(additionalProperties, "transactions")
		delete(additionalProperties, "holdings")
		delete(additionalProperties, "investment_transactions")
		delete(additionalProperties, "identity")
		delete(additionalProperties, "liability")
		delete(additionalProperties, "inflow_model")
		o.AdditionalProperties = additionalProperties
	}

	return err
}

type NullableOverrideAccounts struct {
	value *OverrideAccounts
	isSet bool
}

func (v NullableOverrideAccounts) Get() *OverrideAccounts {
	return v.value
}

func (v *NullableOverrideAccounts) Set(val *OverrideAccounts) {
	v.value = val
	v.isSet = true
}

func (v NullableOverrideAccounts) IsSet() bool {
	return v.isSet
}

func (v *NullableOverrideAccounts) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableOverrideAccounts(val *OverrideAccounts) *NullableOverrideAccounts {
	return &NullableOverrideAccounts{value: val, isSet: true}
}

func (v NullableOverrideAccounts) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableOverrideAccounts) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


