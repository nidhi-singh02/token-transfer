package main

// Festival describes basic details of Festival
type Festival struct {
	FestivalID     string   `json:"ID"`
	Name           string   `json:"name"`
	MaxNoOfTickets int      `json:"maxNoOfTickets"`
	TotalTickets   int      `json:"totalTickets"`
	TicketsSold    int      `json:"ticketsSold"`
	TicketsLeft    int      `json:"ticketsLeft"`
	Organizers     []string `json:"organizers"`
}

type User struct {
	UserID   string   `json:"userID"`
	UserName string   `json:"userName"`
	Role     []string `json:"role"`
	Token    float32  `json:"token"`
}

type Ticket struct {
	TicketID   string  `json:"ticketID"`
	FestivalID string  `json:"festivalID"`
	Price      float32 `json:"price"`
	Owner      string  `json:"owner"`
	Approved   string  `json:"approved"`
	Organizer  string `json:"organizer"`
}

var Roles = []string{"organizer", "user", "exchangeOperator", "secondaryMarketplace"}

//Role constants

const FestivalID = "fest404"
const OrganizerID = "wbp@wbp.org"
const ExchangeOperator = "exchange@wbp.org"
const SecondaryMarketAdmin = "secondary@wbp.org"

var fixedTicketPrice float32 = 1000
