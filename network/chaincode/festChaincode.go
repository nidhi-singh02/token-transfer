package main

import (
	"encoding/json"
	"fmt"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"log"
	"strconv"
)

// TicketFest provides functions for  transferring tokens between accounts
type TicketFest struct {
	contractapi.Contract
}

func main() {

	TicketFestChaincode, err := contractapi.NewChaincode(&TicketFest{}, &NFTContract{}, &FTContract{})
	if err != nil {
		log.Panicf("Error creating TicketFest chaincode: %v", err)
	}

	fmt.Println("TicketFestChaincode:", TicketFestChaincode)
	if err := TicketFestChaincode.Start(); err != nil {
		log.Panicf("Error starting TicketFest chaincode: %v", err)
	}

}

// InitLedger adds a base set of assets to the ledger
func (t *TicketFest) InitLedger(ctx contractapi.TransactionContextInterface) error {

	//Initiliaze Organizer for SettlemintFest

	organizer := User{UserID: OrganizerID, UserName: "WBP", Role: []string{"organizer"}}

	organizerJSON, err := json.Marshal(organizer)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(OrganizerID, organizerJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state for organizer %v", err)
	}

	//Initiliaze festival
	festival := Festival{FestivalID: FestivalID, Name: "TGIF-Fest", MaxNoOfTickets: 100, Organizers: []string{OrganizerID}}

	festivalJSON, err := json.Marshal(festival)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(festival.FestivalID, festivalJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state for festival %v", err)
	}

	//Initiliaze Exchange Agency admin 
	exchangeAdmin := User{UserID: ExchangeOperator, UserName: "ExchangeOperator", Role: []string{"exchangeOperator"}, Token: 0}

	exchangeAdminJSON, err := json.Marshal(exchangeAdmin)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(ExchangeOperator, exchangeAdminJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state for ExchangeOperator %v", err)
	}

	//Initiliaze Secondary Market Admin
	
	secondaryMarketAdmin := User{UserID: SecondaryMarketAdmin, UserName: "SecondaryMarketAdmin", Role: []string{"secondaryMarketplace"}}

	secondaryAdminJSON, err := json.Marshal(secondaryMarketAdmin)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(SecondaryMarketAdmin, secondaryAdminJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state for SecondaryMarketAdmin %v", err)
	}

	FTContract  := FTContract{}
	ptrFTContract := &FTContract
	// Mint 2000 tokens by Exchange Admin
	(*ptrFTContract).MintToken(ctx,2000)

	NFTContract  := NFTContract{}
	ptrNFTContract := &NFTContract
	
	//Mint 10 tickets for festival at initilization time by Organizer
	for i:= 0;i<10;i++{
	(*ptrNFTContract).MintTicket(ctx , OrganizerID , FestivalID , "tic"+ strconv.Itoa(i))
	}

	return nil
}

func (t *TicketFest) RegisterUser(ctx contractapi.TransactionContextInterface, userID string) error {

	//Verify userID is already registered
	UserBytes, err := ctx.GetStub().GetState(userID)
	if err != nil {
		return fmt.Errorf("failed to read user %s : %v", userID, err)
	}

	if UserBytes != nil {
		return fmt.Errorf("'userID' %s already exists", userID)

	}

	user := User{UserID: userID, UserName: userID, Role: []string{"user"}}

	userJSON, err := json.Marshal(user)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(userID, userJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state for user %v", err)
	}

	return nil

}

func (t *TicketFest) QueryFestivalByID(ctx contractapi.TransactionContextInterface, FestivalID string) (Festival,error) {
	//Check festivalID exists or not

	FestivalBytes, err := ctx.GetStub().GetState(FestivalID)
	if err != nil {
		return Festival{},fmt.Errorf("failed to read festivalID %s : %v", FestivalID, err)
	}

	var FestivalData Festival

	if FestivalBytes == nil {
		return Festival{},fmt.Errorf("FestivalID %s is invalid.It does not exist", FestivalID)

	}

	if FestivalBytes != nil {
		err = json.Unmarshal(FestivalBytes, &FestivalData)
	}

	return FestivalData,nil


}