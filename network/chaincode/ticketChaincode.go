package main

import (
	"encoding/json"
	"fmt"
	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// event provides an organized struct for emitting Token events
type eventTicket struct {
	from     string
	to       string
	TicketID string
}

type eventApprovedForAll struct {
	owner    string
	operator string
	approved bool
}

type eventApproved struct {
	owner    string
	approved string
	TicketID string
}

const approvalPrefix = "approval"
const CommissionPercent float32 = 2


// NFTContract provides functions for  transferring tickets between accounts
type NFTContract struct {
	contractapi.Contract
}

func (n *NFTContract) MintTicket(ctx contractapi.TransactionContextInterface, userID string, festivalID string, ticketID string) error {

	//Get festivalID from blockchain
	FestivalBytes, err := ctx.GetStub().GetState(festivalID)
	if err != nil {
		return fmt.Errorf("failed to read festival %s from world state: %v", festivalID, err)
	}

	var FestivalData Festival

	//Checking festivalID exists or not
	if FestivalBytes == nil {
		return fmt.Errorf("festival %s does not exist", festivalID)

	}

	if FestivalBytes != nil {
		err = json.Unmarshal(FestivalBytes, &FestivalData)
	}

	//Verifying mint tickets count for a festival shouldn't be exceeding Max No of Tickets Allowed
	totalTicketsMinted := FestivalData.TotalTickets

	if totalTicketsMinted >= FestivalData.MaxNoOfTickets {
		return fmt.Errorf("cannot create more than %v tickets for festival %v", FestivalData.MaxNoOfTickets, festivalID)
	}

	//Checking festival is having atleast one organizer
	organizers := FestivalData.Organizers

	if len(organizers) == 0 {
		return fmt.Errorf("festival %v is having no organizers", festivalID)
	}

	// TODO: Extract identity information of the transactor. Minting is
	// allowed only to the organizer.
	// Inputing an organizer account in the function for the demo purpose in this example.
	// Instead of reading the identity of the transactor and checking if the
	// identity has minting permission in it.

	//Get userID from world state
	UserBytes, err := ctx.GetStub().GetState(userID)
	if err != nil {
		return fmt.Errorf("failed to read client account %s from world state: %v", userID, err)
	}

	var UserData User
	//Checking userID exists or not
	if UserBytes == nil {
		return fmt.Errorf("user %s does not exist", userID)
	}

	if UserBytes != nil {
		err = json.Unmarshal(UserBytes, &UserData)
	}
	//check user has Any roles assigned to it
	if len(UserData.Role) <= 0 {
		return fmt.Errorf("user %v has NO role", userID)

	}
	roles := UserData.Role

	UserHasOrgRole := false
	//Check user role is that of organizer for minting tickets for festival
	for _, role := range roles {
		if role == "organizer" {
			UserHasOrgRole = true
			break
		}
	}
	//Only organizer is authorized to Mint Tickets

	if !UserHasOrgRole {
		return fmt.Errorf("User %v Not authorized to mint tickets. Does not have organizer role.", userID)

	}

	//Only organizer is authorized to Mint Tickets for particular festival.
	//This check ensures an organizer role should not be allowed to mint for all festivals
	//Checking User is one of the organizers for that festival
	foundOrg := false
	for _, organizer := range organizers {
		if organizer == userID {
			foundOrg = true
			break
		}
	}
	if !foundOrg {
		return fmt.Errorf("user %v is not organizer for festival %v. Cannot Mint.", userID, festivalID)
	}

	finalticketID := ticketID + festivalID

	// Check if the token to be minted does not exist
	TicketBytes, err := ctx.GetStub().GetState(finalticketID)
	if err != nil {
		return fmt.Errorf("failed to read ticket %s from world state: %v", finalticketID, err)
	}

	if TicketBytes != nil {
		return fmt.Errorf("ticket %v is already minted", finalticketID)

	}

	FestivalData.TotalTickets++
	//Increment TicketsLeft by 1 so every ticket that is minted
	FestivalData.TicketsLeft++

	ticket := Ticket{TicketID: finalticketID, FestivalID: festivalID, Price: fixedTicketPrice, Owner: userID,Organizer :userID}

	ticketJSON, err := json.Marshal(ticket)
	if err != nil {
		return err
	}

	FestivalJSON, err := json.Marshal(FestivalData)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(finalticketID, ticketJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state for ticket %v %v", finalticketID, err)
	}

	err = ctx.GetStub().PutState(festivalID, FestivalJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state for festival %v %v", festivalID, err)
	}

	// Emit the Transfer event
	transferEvent := eventTicket{"0x0", userID, finalticketID}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("Transfer Ticket", transferEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	return nil

}

//This function 'TransferTicket' to be used by the organizer for transferring tickets to the users
//Fixed price in currency token is assumed as 1token for 1 ticket
func (n *NFTContract) TransferTicket(ctx contractapi.TransactionContextInterface, to string, ticketID string) error {

	// TODO: Extract identity information of the transactor. Minting is
	// allowed only to the organizer.
	// Assuming a dummy organizer account for the demo purpose in this example.
	// Instead of reading the identity of the transactor and checking if the
	// identity has minting permission in it.

	fromBytes, err := ctx.GetStub().GetState(OrganizerID)
	if err != nil {
		return fmt.Errorf("failed to read 'OrganizerID' account %s : %v", OrganizerID, err)
	}

	if fromBytes == nil {
		return fmt.Errorf("'OrganizerID' account %s is invalid.It does not exist", OrganizerID)

	}

	//if 'from' account is of organizer, user can buy from organizer at a fixed price.
	//No need to propose new price

	TicketBytes, err := ctx.GetStub().GetState(ticketID)
	if err != nil {
		return fmt.Errorf("failed to read ticketID %s : %v", ticketID, err)
	}

	var TicketData Ticket

	//Check ticketID exists or not
	if TicketBytes == nil {
		return fmt.Errorf("ticketID %s is invalid.It does not exist", ticketID)

	}

	if TicketBytes != nil {
		err = json.Unmarshal(TicketBytes, &TicketData)
	}

	toBytes, err := ctx.GetStub().GetState(to)
	if err != nil {
		return fmt.Errorf("failed to read recipient account %s : %v", to, err)
	}

	var ToData User
	//TO-DO: Check to and organizer shouldn't be same in both function
	//That person cannot transfer to himself

	//Check to account exists
	if toBytes == nil {
		return fmt.Errorf("'to' account %s is invalid.It does not exist", to)

	}

	festivalID := TicketData.FestivalID
	if festivalID == "" {
		return fmt.Errorf("Ticket is not associated with any festival")
	}

	// Check if `from` is the current owner of the ticket
	owner := TicketData.Owner
	approved := TicketData.Approved
	price := TicketData.Price

	operatorApproval, err := n.IsApprovedForAll(ctx, owner, OrganizerID)

	if err != nil {
		return fmt.Errorf("Error getting approval for owner %v from %v is: %v", owner, OrganizerID, err)

	}

	if owner != OrganizerID && approved != OrganizerID && !operatorApproval {
		return fmt.Errorf("The OrganizerID %v is not the current owner %v nor authorized operator of ticket %v", OrganizerID, owner, ticketID)
	}

	FestivalBytes, err := ctx.GetStub().GetState(festivalID)
	if err != nil {
		return fmt.Errorf("failed to read festival %s : %v", festivalID, err)
	}

	var FromData User
	if fromBytes == nil {
		_ = json.Unmarshal(fromBytes, &FromData)
	}

	if toBytes != nil {
		err = json.Unmarshal(toBytes, &ToData)
	}

	//Check balance in "to" account for erc20 token so that he can buy
	// if balance is there , it must be greater then the newvalue for ticket
	RecepientBalance := ToData.Token

	if RecepientBalance < float32(price) {
		return fmt.Errorf("Balance of new owner is lesser than the price for ticket. Cannot buy")

	}

	TicketData.Owner = to

	// Clear the approved client for this non-fungible token

	TicketData.Approved = ""

	ticketJSON, err := json.Marshal(TicketData)
	if err != nil {
		return err
	}

	//Transfer token  "to" to "OrganizerID"

	transferErr := TransferTokenFrom(ctx, to, OrganizerID, price)

	if transferErr != nil {
		return fmt.Errorf("Error while transferring token :%v", transferErr)

	}
	//Festival
	var FestivalData Festival

	if FestivalBytes != nil {
		err = json.Unmarshal(FestivalBytes, &FestivalData)
	}

	FestivalData.TicketsSold++
	FestivalData.TicketsLeft--

	FestivalJSON, err := json.Marshal(FestivalData)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(festivalID, FestivalJSON)
	if err != nil {
		return fmt.Errorf("failed to put festival %v : %v", festivalID, err)
	}

	err = ctx.GetStub().PutState(ticketID, ticketJSON)
	if err != nil {
		return fmt.Errorf("failed to put ticket %v  : %v", ticketID, err)
	}

	// Emit the Transfer event
	transferEvent := eventTicket{OrganizerID, to, ticketID}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("Transfer Ticket", transferEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	return nil

}

//This function 'TransferTicketFrom' to be used by the anyone for transferring tickets
//newPrice has float32 data type instead of int
func (n *NFTContract) TransferTicketFrom(ctx contractapi.TransactionContextInterface, from string, to string, ticketID string, newPrice float32) error {

	//Check from account exists or not
	fromBytes, err := ctx.GetStub().GetState(from)
	if err != nil {
		return fmt.Errorf("failed to read 'from' account %s : %v", from, err)
	}

	if fromBytes == nil {
		return fmt.Errorf("'from' account %s is invalid.It does not exist", from)

	}

	TicketBytes, err := ctx.GetStub().GetState(ticketID)
	if err != nil {
		return fmt.Errorf("failed to read ticketID %s : %v", ticketID, err)
	}

	var TicketData Ticket

	//Check ticketID exists or not
	if TicketBytes == nil {
		return fmt.Errorf("ticketID %s is invalid.It does not exist", ticketID)

	}

	if TicketBytes != nil {
		err = json.Unmarshal(TicketBytes, &TicketData)
	}

	toBytes, err := ctx.GetStub().GetState(to)
	if err != nil {
		return fmt.Errorf("failed to read recipient account %s : %v", to, err)
	}

	var ToData User
	var FromData User
	//Check to account exists
	if toBytes == nil {
		return fmt.Errorf("'to' account %s is invalid.It does not exist", to)

	}

	// transfer of 0 is allowed in ERC20, so just validate against negative amounts
	//Converted float input to int
	if int(newPrice) < 0 {
		return fmt.Errorf("New price %v cannot be negative", newPrice)

	}

	//TO-DO: Convert price to 3 decimals places
	//Allow price to be entered in form of decimals,
	//should handle at chaincode level
	newPriceInPoweroF3 := newPrice * 1000

	//New Price comparsion with current price.
	//New Price cannot be greater than 110% of the current price

	currentPrice := TicketData.Price
	MaxLimit := 1.1 * (currentPrice * 1000)
	if newPriceInPoweroF3 > MaxLimit {
		return fmt.Errorf("New price %v is 110 percent greater %v than current price: %v", newPriceInPoweroF3, MaxLimit, currentPrice)

	}

	festivalID := TicketData.FestivalID
	if festivalID == "" {
		return fmt.Errorf("Ticket is not associated with any festival")
	}

	// Check if `from` is the current owner of the ticket
	owner := TicketData.Owner
	approved := TicketData.Approved

	operatorApproval, err := n.IsApprovedForAll(ctx, owner, from)

	if err != nil {
		return fmt.Errorf("Error getting approval for owner %v from %v is:%v", from, owner, err)

	}

	if owner != from && approved != from && !operatorApproval {
		return fmt.Errorf("from %v is not the current owner %v nor authorized operator of ticket %v", from, owner, ticketID)
	}

	FestivalBytes, err := ctx.GetStub().GetState(festivalID)
	if err != nil {
		return fmt.Errorf("failed to read festival %s : %v", festivalID, err)
	}

	if toBytes != nil {
		err = json.Unmarshal(toBytes, &ToData)
	}

	if fromBytes != nil {
		err = json.Unmarshal(fromBytes, &FromData)
	}

	//Check balance in "to" account for erc20 token so that he can buy
	// if balance is there , it must be greater then the newvalue for ticket
	RecepientBalance := ToData.Token

	if RecepientBalance < newPrice {
		return fmt.Errorf("Balance of new owner %v is lesser than the price %v for ticket. Cannot buy", to, newPrice)

	}

	SenderBalance := FromData.Token
	var commission float32
	commission = (CommissionPercent / 100) * newPrice

	fmt.Println("owner:",owner,"from",from,"approved",approved,"commission",commission)

	//Check transfer from someone other than the organizer and from has the required approval
	if owner != from && approved == from {

	
		//Check Balance in the approval opperator account - Secondary Market sales person

		if SenderBalance < commission {
			return fmt.Errorf("Balance of sender  %v is lesser than the comission. Cannot transfer", from)
		}

		//Transfer 'commission' from 'from' to 'owner' - organizer's account
		transferErr := TransferTokenFrom(ctx, from, owner, commission)

		if transferErr != nil {
			return fmt.Errorf("Error transferring commission %v from %v to organizer %v :%v", commission, from, owner, transferErr)

		}

	}

	TicketData.Owner = to
	TicketData.Price = newPrice

	// Clear the approved client for this non-fungible token

	TicketData.Approved = ""

	ticketJSON, err := json.Marshal(TicketData)
	if err != nil {
		return err
	}

	//Transfer token  "to" to "from"
	//TO-DO:token to be transferred to "from" all the time or
	//to the actual owner

	transferErr := TransferTokenFrom(ctx, to, from, newPrice)

	if transferErr != nil {
		return fmt.Errorf("Error while transferring token :%v", transferErr)

	}
	//Festival
	var FestivalData Festival

	if FestivalBytes != nil {
		err = json.Unmarshal(FestivalBytes, &FestivalData)
	}

	FestivalData.TicketsSold++
	FestivalData.TicketsLeft--

	FestivalJSON, err := json.Marshal(FestivalData)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(festivalID, FestivalJSON)
	if err != nil {
		return fmt.Errorf("failed to put festival %v : %v", festivalID, err)
	}

	err = ctx.GetStub().PutState(ticketID, ticketJSON)
	if err != nil {
		return fmt.Errorf("failed to put ticket %v  : %v", ticketID, err)
	}

	// Emit the Transfer event
	transferEvent := eventTicket{from, to, ticketID}
	transferEventJSON, err := json.Marshal(transferEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("Transfer Ticket", transferEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	return nil

}

//owner : The owner of ticket
//approved :The new approved client
func (n *NFTContract) ApproveTicket(ctx contractapi.TransactionContextInterface, owner string, approved string, ticketID string) error {

	//Only organizer has authority to use this function

	// TODO: Extract identity information of the transactor. Approval is
	// allowed only to the current owner of the ticket or an authorized person.
	// Taking owner in the input and comparing it with the ticket owner for the demo purpose
	// Instead of reading the identity of the transactor and checking if the
	// identity has current owner/authorized permission in it.

	tickets, err := ReadNFT(ctx, ticketID)

	if err != nil {
		return fmt.Errorf("Cannot get ticket for %v : %v", ticketID, err)

	}

	TicketOwner := tickets.Owner

	OwnerBytes, err := ctx.GetStub().GetState(owner)
	if err != nil {
		return fmt.Errorf("failed to read 'owner' account %s : %v", owner, err)
	}

	if OwnerBytes == nil {
		return fmt.Errorf("'Owner' account %s is invalid.It does not exist", owner)

	}

	//Check approved account exists or not
	ApprovedBytes, err := ctx.GetStub().GetState(approved)
	if err != nil {
		return fmt.Errorf("failed to read 'approved' account %s : %v", approved, err)
	}

	if ApprovedBytes == nil {
		return fmt.Errorf("'Approved' account %s is invalid.It does not exist", approved)

	}


	//Check 'owner' passed in is an authorized operator of the current owner
	operatorApproval, err := n.IsApprovedForAll(ctx, TicketOwner, owner)

	if err != nil {
		return fmt.Errorf("Error getting approval for owner %v from %v is :%v", TicketOwner, owner, err)

	}
	//Check owner is the current owner of the ticket or
	//authorized operator of the current owner
	if owner != TicketOwner && !operatorApproval {
		return fmt.Errorf("owner %v is not correct owner nor authorized person for ticket %v", owner, ticketID)

	}
	// Update the approved client of the non-fungible token
	tickets.Approved = approved

	ticketsJSON, err := json.Marshal(tickets)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(ticketID, ticketsJSON)
	if err != nil {
		return fmt.Errorf("failed to put ticket %v : %v", ticketID, err)
	}

	// Emit the Approval event
	approvalEvent := eventApproved{owner, approved, ticketID}

	approvalEventJSON, err := json.Marshal(approvalEvent)
	if err != nil {
		return fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("Approval Token", approvalEventJSON)
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	return nil

}

func (n *NFTContract) SetApprovalForAll(ctx contractapi.TransactionContextInterface, operator string, approved bool) (bool, error) {

	//TO-DO : Getting Client Identity for obtaining sender
	//For demo purpose, taking owner of ticket as "Organizer"

	OrganizerBytes, err := ctx.GetStub().GetState(OrganizerID)
	if err != nil {
		return false, fmt.Errorf("failed to read account %s from world state: %v", OrganizerID, err)
	}

	var UserData User

	if OrganizerBytes != nil {
		err = json.Unmarshal(OrganizerBytes, &UserData)
	}

	sender := UserData.UserID

	// Create approvalKey
	approvalKey, err := ctx.GetStub().CreateCompositeKey(approvalPrefix, []string{sender, operator})
	if err != nil {
		return false, fmt.Errorf("failed to create the composite key for prefix %s: %v", approvalPrefix, err)
	}

	approval := eventApprovedForAll{sender, operator, approved}

	approvalJSON, err := json.Marshal(approval)
	if err != nil {
		return false, fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}

	// Update the state of the smart contract by adding the approvalKey and value
	err = ctx.GetStub().PutState(approvalKey, approvalJSON)
	if err != nil {
		return false, fmt.Errorf("failed to update state of smart contract for key %s: %v", approvalKey, err)
	}

	// Emit the ApprovalForAll event
	approvalForAllEvent := eventApprovedForAll{sender, operator, approved}

	approvalEventJSON, err := json.Marshal(approvalForAllEvent)
	if err != nil {
		return false, fmt.Errorf("failed to obtain JSON encoding: %v", err)
	}
	err = ctx.GetStub().SetEvent("Approval For All Token", approvalEventJSON)
	if err != nil {
		return false, fmt.Errorf("failed to set event: %v", err)
	}

	return true, nil
}

func (n *NFTContract) IsApprovedForAll(ctx contractapi.TransactionContextInterface, owner string, operator string) (bool, error) {

	// Create approvalKey
	approvalKey, err := ctx.GetStub().CreateCompositeKey(approvalPrefix, []string{owner, operator})
	if err != nil {
		return false, fmt.Errorf("failed to create the composite key for prefix %s: %v", approvalPrefix, err)
	}

	ApprovalBytes, err := ctx.GetStub().GetState(approvalKey)
	if err != nil {
		return false, fmt.Errorf("failed to read approval key %s from world state: %v", approvalKey, err)
	}
	var approved bool
	var ApprovalData eventApprovedForAll
	if ApprovalBytes != nil {
		_ = json.Unmarshal(ApprovalBytes, &ApprovalData)
		approved = ApprovalData.approved
	} else {
		approved = false
	}

	return approved, nil

}

func (n *NFTContract) GetApprovedTicket(ctx contractapi.TransactionContextInterface, ticketID string) (string, error) {
	ticket, err := ReadNFT(ctx, ticketID)
	if err != nil {
		return "", fmt.Errorf("Cannot get ticket for %v : %v", ticketID, err)

	}
	return ticket.Approved, nil
}

func ReadNFT(ctx contractapi.TransactionContextInterface, ticketID string) (Ticket, error) {

	TicketBytes, err := ctx.GetStub().GetState(ticketID)
	if err != nil {
		return Ticket{}, fmt.Errorf("ticketID %s can't be read: %v", ticketID, err)
	}

	var TicketData Ticket

	if TicketBytes == nil {
		return Ticket{}, fmt.Errorf("ticketID %s is invalid.It does not exist", ticketID)

	}
	if TicketBytes != nil {
		err = json.Unmarshal(TicketBytes, &TicketData)

		if err != nil {
			return Ticket{}, fmt.Errorf("Unmarshalling failed :%v", err)

		}
	}

	return TicketData, nil

}

func (n *NFTContract) OwnerOf(ctx contractapi.TransactionContextInterface, ticketID string) (string, error) {

	ticket, err := ReadNFT(ctx, ticketID)
	if err != nil {
		return "", fmt.Errorf("Cannot get ticket for %v : %v", ticketID, err)

	}

	owner := ticket.Owner
	if owner == "" {
		return "", fmt.Errorf("No owner is assigned to ticket %v", ticketID)
	}

	return owner, nil
}

// QueryTickets uses a query string to perform a query for assets.
// Query string matching state database syntax is passed in and executed as is.
// Supports ad hoc queries that can be defined at runtime by the client.
// Only available on state databases that support rich query (e.g. CouchDB)
func (n *NFTContract) QueryTickets(ctx contractapi.TransactionContextInterface, queryString string) ([]*Ticket, error) {
	return getQueryResultForQueryString(ctx, queryString)
}

// getQueryResultForQueryString executes the passed in query string.
// The result set is built and returned as a byte array containing the JSON results.
func getQueryResultForQueryString(ctx contractapi.TransactionContextInterface, queryString string) ([]*Ticket, error) {
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	return constructQueryResponseFromIterator(resultsIterator)
}

// constructQueryResponseFromIterator constructs a slice of assets from the resultsIterator
func constructQueryResponseFromIterator(resultsIterator shim.StateQueryIteratorInterface) ([]*Ticket, error) {
	var tickets []*Ticket
	for resultsIterator.HasNext() {
		queryResult, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		var ticket Ticket
		err = json.Unmarshal(queryResult.Value, &ticket)
		if err != nil {
			return nil, err
		}
		tickets = append(tickets, &ticket)
	}

	return tickets, nil
}
