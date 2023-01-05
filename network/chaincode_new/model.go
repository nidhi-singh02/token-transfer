package main

// Scenarios to represent
//1 bank(SBI) - 1st user -> 2nd user -> 
//2 banks
//(SBI bank) -> 1 user ----- 1 user - HDFC bank

// one bank can have different channels
// Inter-channel communication 
// tests on caliper for multiple channels
// tests on caliper for one channel 

// Novelty
// Wrapper
// channels on different orderers
// comparsion results
// Generic stack

// why multi-RAFT not good solution

// sharing the config file shared across, doesn't matter ? - Data sharding logic
// Consortium management operation - new org added, edit the file

// Bank describes basic details of Bank
type Bank struct {
	BankID     string   `json:"ID"`
	Name           string   `json:"name"`
	MaxNoOfToken int      `json:"maxNoOfToken"`
	TotalToken   int      `json:"totalToken"`
	Admins []string `json:"admins"`
}

type User struct {
	UserID   string   `json:"userID"`
	UserName string   `json:"userName"`
	Role     []string `json:"role"`
	Balance    float32  `json:"balance"`
	BankID     string `json:"bankID"`
}


type Wrapper struct {
	UserID  string `json:"userID"`
	Status     string `json:"status"`
	OriginTxnID     string `json:"OriginTxnID"` // Source is the blockchain transferring the token - channel
	DestinationTxnID     string `json:"DestinationTxnID"` // Source is the blockchain transferring the token - channel
	Source     string `json:"source"` // Source is the blockchain transferring the token - channel
	Destination     string `json:"destination"` // Destination is the blockchain receiving the token - channel
	Token Token `json:"token"`
	ID   string `json:"ID"` //owner+cts
}

type Token struct {
	Name string `json:"name"`
	Symbol string  `json:"symbol"`
	Value   int `json:"value"`
	UserID string  `json:"userID"`
}

//Role constants
var Roles = []string{"admin", "user"}

const BankID = "hdfcbank404"
const AdminID = "admin@hdfcbank"
const AdminBalance = 1000000
const Maxtoken= 700000000
