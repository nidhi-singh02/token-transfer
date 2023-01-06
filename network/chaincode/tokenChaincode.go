package main

import (
	"encoding/json"
	"fmt"
	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"log"
	"strconv"
)

// FTContract provides functions for  transferring tokens between accounts
type FTContract struct {
	contractapi.Contract
}

// event provides an organized struct for emitting Token events
type eventToken struct {
	from  string
	to    string
	value int
}

const totalSupplyKey = "supplykey"
const allowancePrefix = "allowance"

// This function triggers a Transfer event
// Mint of Token can be done only by Admin
func (f *FTContract) MintToken(ctx contractapi.TransactionContextInterface, account string, amount int, txnID string, channel string) error {

	if amount <= 0 {
		return fmt.Errorf("mint amount must be a positive integer")
	}

	// TODO: Extract identity information of the transactor. Minting is
	// allowed only to the admins.
	// Assuming a dummy operator account for the demo purpose in this example.
	// Instead of reading the identity of the transactor and checking if the
	// identity has minting permission in it.
	fromBytes, err := ctx.GetStub().GetState("u"+account)
	if err != nil {
		return fmt.Errorf("failed to read client account %s from world state: %v", account, err)
	}

	var UserData User

	if fromBytes != nil {
		err = json.Unmarshal(fromBytes, &UserData)
	}

	//check user has Any roles assigned to it
	if len(UserData.Role) <= 0 {
		return fmt.Errorf("user %v has NO role", account)

	}
	roles := UserData.Role

	UserHasOrgRole := false
	//Check user role is of Admin for minting Tokens
	for _, role := range roles {
		if role == "admin" {
			UserHasOrgRole = true
			break
		}
	}
	//Only Admin is authorized to Mint Tickets
	if !UserHasOrgRole {
		return fmt.Errorf("User %v Not authorized to mint Tokens", account)

	}

	var currentBalance, updatedBalance float32

	currentBalance = UserData.Balance
	updatedBalance = currentBalance + float32(amount)
	UserData.Balance = updatedBalance

	userJSON, err := json.Marshal(UserData)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState("u"+account, userJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state for user %v", err)
	}

	// Update the totalSupply
	totalSupplyBytes, err := ctx.GetStub().GetState(totalSupplyKey)
	if err != nil {
		return fmt.Errorf("failed to retrieve total token supply: %v", err)
	}

	var totalSupply int

	// If no tokens have been minted, initialize the totalSupply
	if totalSupplyBytes == nil {
		totalSupply = 0
	} else {
		totalSupply, _ = strconv.Atoi(string(totalSupplyBytes)) // Error handling not needed since Itoa() was used when setting the totalSupply, guaranteeing it was an integer.
	}

	// Add the mint amount to the total supply and update the state
	totalSupply += amount
	err = ctx.GetStub().PutState(totalSupplyKey, []byte(strconv.Itoa(totalSupply)))
	if err != nil {
		return err
	}

	//TxnID:= shim.GetTxID();
	//	log.Printf("TxnID %s",TxnID)
	WrapperData := Wrapper{UserID: account, Status: "active", Source: channel, OriginTxnID: txnID, Token: Token{Name: "Digital Rupee", Symbol: "INR", Value: amount}}

	wrapperJSON, err := json.Marshal(WrapperData)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(account, wrapperJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state for user %v", err)
	}

	// Emit the Transfer event
	transferEvent := eventToken{"0x0", account, amount}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("Transfer Token", transferEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	log.Printf("minter account %s balance updated from %v to %v - %v", account, currentBalance, updatedBalance, WrapperData)

	return nil

}

func (f *FTContract) TransferToken(ctx contractapi.TransactionContextInterface, to string, amount int, channel string) error {
	if amount < 0 { // transfer of 0 is allowed in ERC-20, so just validate against negative amounts
		return fmt.Errorf("amount must be a positive integer")
	}

	// TODO: Extract identity information of the transactor. Minting is
	// allowed only to the exchange operators.
	// Assuming a dummy operator account for the demo purpose in this example.
	// Instead of reading the identity of the transactor and checking if the
	// identity has minting permission in it.
	fromBytes, err := ctx.GetStub().GetState("u"+AdminID)
	if err != nil {
		return fmt.Errorf("failed to read admin %s from world state: %v", AdminID, err)
	}

	//check admin account exists or not
	if fromBytes == nil {
		return fmt.Errorf("admin account %s is invalid. It does not exists", AdminID)

	}

	toBytes, err := ctx.GetStub().GetState("u"+to)
	if err != nil {
		return fmt.Errorf("failed to read recipient account %s from world state: %v", to, err)
	}

	//check to account exists or not
	if toBytes == nil {
		return fmt.Errorf("to account %s is invalid. It does not exists", to)

	}

	var FromUserData User

	if fromBytes != nil {
		err = json.Unmarshal(fromBytes, &FromUserData)
	}

	var currentBalance, updatedBalance float32

	currentBalance = FromUserData.Balance

	if currentBalance == 0 {
		return fmt.Errorf("admin account %s has no balance", AdminID)
	}

	if currentBalance < float32(amount) {
		return fmt.Errorf("admin account %s has insufficient funds", AdminID)
	}

	updatedBalance = currentBalance - float32(amount)

	FromUserData.Balance = updatedBalance
	userJSON, err := json.Marshal(FromUserData)
	if err != nil {
		return err
	}

	var ToUserData User

	if toBytes != nil {
		err = json.Unmarshal(toBytes, &ToUserData)
	}

	toCurrentBalance := ToUserData.Balance
	toUpdatedBalance := toCurrentBalance + float32(amount)
	ToUserData.Balance = toUpdatedBalance

	touserJSON, err := json.Marshal(ToUserData)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState("u"+AdminID, userJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state for admin user %v", err)
	}

	err = ctx.GetStub().PutState("u"+to, touserJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state for to user %v", err)
	}

	log.Printf("admin %s balance updated from %v to %v", AdminID, currentBalance, updatedBalance)
	log.Printf("recipient %s balance updated from %v to %v", to, toCurrentBalance, toUpdatedBalance)

	// Wrapper
	AdminBytes, err := ctx.GetStub().GetState(AdminID)
	if err != nil {
		return fmt.Errorf("failed to read recipient account %s from world state: %v", to, err)
	}

	//check to account exists or not
	if AdminBytes == nil {
		return fmt.Errorf("to account %s is invalid. It does not exists", to)

	}

	var WrapperData Wrapper

	if AdminBytes != nil {
		err = json.Unmarshal(AdminBytes, &WrapperData)
	}

	WrapperData.Status = "inactive"
	WrapperData.UserID = to
	WrapperData.Destination = channel

	wrapperJSON, err := json.Marshal(WrapperData)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(to, wrapperJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state for to user %v", err)
	}

	// Emit the Transfer event
	transferEvent := eventToken{AdminID, to, amount}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("Transfer Token", transferEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	return nil

}

func (f *FTContract) TransferTokenFrom(ctx contractapi.TransactionContextInterface, from string, to string, amount float32, channel string) error {
	if amount < 0 { // transfer of 0 is allowed in ERC-20, so just validate against negative amounts
		return fmt.Errorf("amount must be a positive integer")
	}

	fromBytes, err := ctx.GetStub().GetState("u"+from)
	if err != nil {
		return fmt.Errorf("failed to read client account %s from world state: %v", from, err)
	}

	//check from account exists or not
	if fromBytes == nil {
		return fmt.Errorf("from account %s is invalid. It does not exists", from)

	}

	log.Printf("fromBytes %v",string(fromBytes))
	toBytes, err := ctx.GetStub().GetState("u"+to)
	if err != nil {
		return fmt.Errorf("failed to read recipient account %s from world state: %v", to, err)
	}

	//check to account exists or not
	if toBytes == nil {
		return fmt.Errorf("to account %s is invalid. It does not exists", to)

	}

	log.Printf("toBytes %v",string(toBytes))

	var FromUserData User

	if fromBytes != nil {
		err = json.Unmarshal(fromBytes, &FromUserData)
	}

	amountFloat := float32(amount)
	currentBalance := FromUserData.Balance

	if currentBalance == 0 {
		return fmt.Errorf("from account %s has no balance", from)
	}

	if currentBalance < amountFloat {
		return fmt.Errorf("from account %s has insufficient funds", from)
	}

	updatedBalance := currentBalance - amountFloat

	log.Printf("updatedBalance %v",updatedBalance)

	FromUserData.Balance = updatedBalance
	userJSON, err := json.Marshal(FromUserData)
	if err != nil {
		return err
	}


	log.Printf("FromUserData %v",FromUserData)

	var ToUserData User

	if toBytes != nil {
		err = json.Unmarshal(toBytes, &ToUserData)
	}

	toCurrentBalance := ToUserData.Balance
	toUpdatedBalance := toCurrentBalance + amountFloat
	ToUserData.Balance = toUpdatedBalance

	log.Printf("ToUserData %v",ToUserData)

	// get token
	TokenBytes, err := ctx.GetStub().GetState("u"+from)
	if err != nil {
		return fmt.Errorf("failed to read recipient account %s from world state: %v", to, err)
	}

	if TokenBytes == nil {
		return fmt.Errorf("to account %s is invalid. It does not exists", to)

	}

	//

	touserJSON, err := json.Marshal(ToUserData)
	if err != nil {
		return err
	}

	log.Printf("userJSON %v",string(userJSON))

	err = ctx.GetStub().PutState("u"+from, userJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state for from user %v", err)
	}

	log.Printf("touserJSON %v",string(touserJSON))

	err = ctx.GetStub().PutState("u"+to, touserJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state for to user %v", err)
	}


	// Wrapper
	AdminBytes, err := ctx.GetStub().GetState(from)

	log.Printf("AdminBytes %v",string(AdminBytes))

	if err != nil {
		return fmt.Errorf("failed to read recipient account %s from world state: %v", to, err)
	}

	//check to account exists or not
	if AdminBytes == nil {
		return fmt.Errorf("to account %s is invalid. It does not exists", to)

	}

	var WrapperData Wrapper

	if AdminBytes != nil {
		err = json.Unmarshal(AdminBytes, &WrapperData)
	}

	WrapperData.Status = "active"
	WrapperData.UserID = to
	WrapperData.Destination = channel
	WrapperData.Token.Value = int(amount)

	wrapperJSON, err := json.Marshal(WrapperData)
	if err != nil {
		return err
	}
	log.Printf("wrapperJSON %v",string(wrapperJSON))	
	err = ctx.GetStub().PutState(to, wrapperJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state for to user %v", err)
	}

	log.Printf("Token : from %s balance updated from %v to %v", from, currentBalance, updatedBalance)
	log.Printf("Token : recipient %s balance updated from %v to %v", to, toCurrentBalance, toUpdatedBalance)

	// Emit the Transfer event
	transferEvent := eventToken{from, to, int(amount)}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("Transfer Token", transferEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	return nil

}

// BalanceOf returns the balance of the given account
func (f *FTContract) BalanceOfToken(ctx contractapi.TransactionContextInterface, account string) (float32, error) {
	UserBytes, err := ctx.GetStub().GetState("u"+account)
	if err != nil {
		return 0, fmt.Errorf("failed to read from world state: %v", err)
	}

	var UserData User

	if UserBytes == nil {
		return 0, fmt.Errorf("the account %s does not exist", account)
	}

	if UserBytes != nil {
		err = json.Unmarshal(UserBytes, &UserData)
	}

	balance := UserData.Balance // Error handling not needed since Itoa() was used when setting the account balance, guaranteeing it was an integer.

	return balance, nil
}

// TotalSupply returns the total token supply
func (f *FTContract) TotalSupplyToken(ctx contractapi.TransactionContextInterface) (int, error) {

	// Retrieve total supply of tokens from state of smart contract
	totalSupplyBytes, err := ctx.GetStub().GetState(totalSupplyKey)
	if err != nil {
		return 0, fmt.Errorf("failed to retrieve total token supply: %v", err)
	}

	var totalSupply int

	// If no tokens have been minted, return 0
	if totalSupplyBytes == nil {
		totalSupply = 0
	} else {
		totalSupply, _ = strconv.Atoi(string(totalSupplyBytes)) // Error handling not needed since Itoa() was used when setting the totalSupply, guaranteeing it was an integer.
	}

	log.Printf("TotalSupply: %d tokens", totalSupply)

	return totalSupply, nil
}

// Approve allows the spender to withdraw from the calling client's token account
// The spender can withdraw multiple times if necessary, up to the value amount. This function triggers an Approval event
func (f *FTContract) ApproveToken(ctx contractapi.TransactionContextInterface, spender string, value int) error {

	fromBytes, err := ctx.GetStub().GetState("u"+AdminID)
	if err != nil {
		return fmt.Errorf("failed to read client account %s from world state: %v", AdminID, err)
	}

	var UserData User

	if fromBytes != nil {
		err = json.Unmarshal(fromBytes, &UserData)
	}

	// Get ID of submitting client identity
	owner := UserData.UserID

	// Create allowanceKey
	allowanceKey, err := ctx.GetStub().CreateCompositeKey(allowancePrefix, []string{owner, spender})
	if err != nil {
		return fmt.Errorf("failed to create the composite key for prefix %s: %v", allowancePrefix, err)
	}

	// Update the state of the smart contract by adding the allowanceKey and value
	err = ctx.GetStub().PutState(allowanceKey, []byte(strconv.Itoa(value)))
	if err != nil {
		return fmt.Errorf("failed to update state of smart contract for key %s: %v", allowanceKey, err)
	}

	// Emit the Approval event
	approvalEvent := eventToken{owner, spender, value}
	approvalEventJSON, err := json.Marshal(approvalEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("Approval Token", approvalEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	log.Printf("client %s approved a withdrawal allowance of %d for spender %s", owner, value, spender)

	return nil
}

// Allowance returns the amount still available for the spender to withdraw from the owner
func (f *FTContract) AllowanceToken(ctx contractapi.TransactionContextInterface, owner string, spender string) (int, error) {

	// Create allowanceKey
	allowanceKey, err := ctx.GetStub().CreateCompositeKey(allowancePrefix, []string{owner, spender})
	if err != nil {
		return 0, fmt.Errorf("failed to create the composite key for prefix %s: %v", allowancePrefix, err)
	}

	// Read the allowance amount from the world state
	allowanceBytes, err := ctx.GetStub().GetState(allowanceKey)
	if err != nil {
		return 0, fmt.Errorf("failed to read allowance for %s from world state: %v", allowanceKey, err)
	}

	var allowance int

	// If no current allowance, set allowance to 0
	if allowanceBytes == nil {
		allowance = 0
	} else {
		allowance, err = strconv.Atoi(string(allowanceBytes)) // Error handling not needed since Itoa() was used when setting the totalSupply, guaranteeing it was an integer.
	}

	log.Printf("The allowance left for spender %s to withdraw from owner %s: %d", spender, owner, allowance)

	return allowance, nil
}

// QueryTickets uses a query string to perform a query for assets.
// Query string matching state database syntax is passed in and executed as is.
// Supports ad hoc queries that can be defined at runtime by the client.
// Only available on state databases that support rich query (e.g. CouchDB)
func (f *FTContract) QueryTokens(ctx contractapi.TransactionContextInterface, queryString string) ([]*Wrapper, error) {
	return getQueryResultForQueryString(ctx, queryString)
}

// getQueryResultForQueryString executes the passed in query string.
// The result set is built and returned as a byte array containing the JSON results.
func getQueryResultForQueryString(ctx contractapi.TransactionContextInterface, queryString string) ([]*Wrapper, error) {
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	return constructQueryResponseFromIterator(resultsIterator)
}

// constructQueryResponseFromIterator constructs a slice of assets from the resultsIterator
func constructQueryResponseFromIterator(resultsIterator shim.StateQueryIteratorInterface) ([]*Wrapper, error) {
	var wrapperToken []*Wrapper
	for resultsIterator.HasNext() {
		queryResult, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		var wrapper Wrapper
		err = json.Unmarshal(queryResult.Value, &wrapper)
		if err != nil {
			return nil, err
		}
		wrapperToken = append(wrapperToken, &wrapper)
	}

	return wrapperToken, nil
}
