package main

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
//	Token    []Token  `json:"token"`
	balance    int  `json:"balance"`
	BankID     []string `json:"bankID"`
}


type Wrapper struct {
	Status     string `json:"status"`
	TransactionID     string `json:"transactionID"`
	Source     string `json:"source"`
	Destination     string `json:"destination"`
	UserID  string `json:"userID"`
	Token Token `json:"token"`
	Id - owner+cts
}

type Token struct {
	Name string `json:"name"`
	Symbol string  `json:"symbol"`
	Value   float32 `json:"value"`
	UserID string  `json:"UserID"`
}

//Role constants
var Roles = []string{"admin", "user"}

const BankID = "hdfcbank404"
const AdminID = "admin@hdfcbank"
const AdminBalance = 1000000
const Maxtoken= 700000000
