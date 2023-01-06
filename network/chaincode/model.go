package main


type Bank struct {
	BankID       string   `json:"ID"`
	Name         string   `json:"name"`
	MaxNoOfToken int      `json:"maxNoOfToken"`
	TotalToken   int      `json:"totalToken"`
	Admins       []string `json:"admins"`
}

type User struct {
	UserID   string   `json:"userID"`
	UserName string   `json:"userName"`
	Role     []string `json:"role"`
	Balance  float32  `json:"balance"`
	BankID   string   `json:"bankID"`
}

type Wrapper struct {
	UserID           string `json:"userID"`
	Status           string `json:"status"`
	OriginTxnID      string `json:"OriginTxnID"`
	DestinationTxnID string `json:"DestinationTxnID"`
	Source           string `json:"source"`      // Source is the blockchain transferring the token - channel
	Destination      string `json:"destination"` // Destination is the blockchain receiving the token - channel
	Token            Token  `json:"token"`
}

type Token struct {
	Name   string `json:"name"`
	Symbol string `json:"symbol"`
	Value  int    `json:"value"`
	UserID string `json:"userID"`
}

// Role constants
var Roles = []string{"admin", "user"}

const BankID = "hdfcbank404"
const AdminID = "admin@hdfcbank"
const AdminBalance = 1000000
const Maxtoken = 700000000
