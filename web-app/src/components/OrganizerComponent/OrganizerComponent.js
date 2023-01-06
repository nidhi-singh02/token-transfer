import React, { useState, useEffect } from 'react';
import './OrganizerComponent.css';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/apiConstants';
import { withRouter } from "react-router-dom";


function OrganizerComponent(props) {

    const [state, setState] = useState({
        email: "",
        password: "",
        tickets_zero: [{ "Ticket ID": "", "Festival ID": "", "Owner": "", "Price": "", "Approved": "" }],
        successMessage: "",
        balance: 0,
        tickets: [],
        soldTickets: []

    })

    const getEmail = () => {
        setState(prevState => ({
            ...prevState,
            'email': props.emailID
        }))
    }

    useEffect(() => {
        getEmail()
        getBalance()
       // getTotalTickets()

    }, [state.email, state.tickets, state.soldTickets, state.balance, state.tickets.approved])
    //added tickets
    const handleChange = (e) => {
        const { id, value } = e.target
        setState(prevState => ({
            ...prevState,
            [id]: value
        }))

    }

    const getTotalTickets = () => {
        const payload = props.emailID

        axios.get(API_BASE_URL + '/ticketsByOrganizer/' + payload)
            .then(function (response) {

                if (response.status === 200) {
                    let AllTickets = response.data;
                    let SoldTickets = AllTickets.filter(function (e) {
                        return e.owner !== payload;
                    });
                    let remainingTickets = AllTickets.filter(function (e) {
                        return e.owner === payload;
                    });

                    setState(prevState => ({
                        ...prevState,
                        'soldTickets': SoldTickets,
                        'tickets': remainingTickets

                    }))

                } else {
                    props.showError("Some error ocurred");
                }
            })
            .catch(function (error) {
                console.log(error);
            });

    }

    const search = (nameKey, myArray) => {
        for (var i = 0; i < myArray.length; i++) {
            if (myArray[i].ticketID === nameKey) {
                return myArray[i];
            }
        }
    }

    const CallApproveTicket = () => {
        props.showError(null);
        const payload = { "from": props.emailID, "to": "secondary@wbp.org", "ticketID": state.ticketID }

        axios.post(API_BASE_URL + '/approveticket/', payload)
            .then(function (response) {
                console.log("response for approve ticket", response)
                if (response.status === 200) {

                    let TobeUpdated = search(state.ticketID, state.tickets)

                    setState(prevState => ({
                        ...prevState,
                        'successMessage': 'Approved ticket successfully.',
                        tickets: [...prevState.tickets, TobeUpdated]
                    }))
                    props.showError(null)
                } else if (response.status === 203) {
                    props.showError(response.data);
                } else if (response.status === 202) {
                    props.showError(response.data);
                }
                else {
                    props.showError("Some error ocurred");
                }

            })
            .catch(function (error) {
                console.log(error);
            });

    }


    const MintTicket = () => {
        props.showError(null);

        const payload = { "userID": props.emailID, "amount": state.ticketID }

        console.log("payload", payload)
        axios.post(API_BASE_URL + '/minttoken/', payload)
            .then(function (response) {
                console.log("response for minttoken", response)
                if (response.status === 200) {
                    setState(prevState => ({
                        ...prevState,
                        'successMessage': 'Minted ticket.',
                        tickets: [...prevState.tickets, response.data]
                    }))
                    props.showError(null)
                } else if (response.status === 203) {
                    props.showError(response.data);
                } else {
                    props.showError("Some error ocurred");
                }

            })
            .catch(function (error) {
                console.log(error);
            });

    }
    const getBalance = () => {
        const payload = { "emailID": props.emailID }
        axios.post(API_BASE_URL + '/getBalance/', payload)
            .then(function (response) {
                if (response.status === 200) {
                    setState(prevState => ({
                        ...prevState,
                        'balance': response.data
                    }))

                } else {
                    props.showError("Some error ocurred");
                }
            })
            .catch(function (error) {
                console.log(error);
            });

    }


    const renderTableData = () => {
        if (state.tickets && state.tickets.length > 0) {
            return state.tickets.map((ticket, index) => {
                const { ticketID, festivalID, price, owner, approved } = ticket //destructuring
                return (
                    <tr key={ticketID}>
                        <td>{ticketID}</td>
                        <td>{festivalID}</td>
                        <td>{owner}</td>
                        <td>{price}</td>
                        <td>{approved}</td>
                    </tr>
                )
            })
        }

    }

    const renderTableHeader = () => {
        let header = Object.keys(state.tickets_zero[0])
        return header.map((key, index) => {
            return <th key={index}>{key.toUpperCase()}</th>
        })
    }


    const renderTicketsSold = () => {

        if (state.soldTickets && state.soldTickets.length > 0) {
            return state.soldTickets.map((ticket, index) => {
                const { ticketID, festivalID, price, owner, approved } = ticket
                return (
                    <tr key={ticketID}>
                        <td>{ticketID}</td>
                        <td>{festivalID}</td>
                        <td>{owner}</td>
                        <td>{price}</td>
                        <td>{approved}</td>
                    </tr>
                )
            })
        }

    }


    const handleSubmitClickToken = (e) => {
        e.preventDefault();
        CallApproveTicket()
        setState(prevState => ({
            ...prevState,
            ticketID: ''
        }))

    }

    const handleSubmitMint = (e) => {
        e.preventDefault();
        MintTicket()
        setState(prevState => ({
            ...prevState,
            ticketID: ''
        }))

    }

    return (
        <div>
            <div>
                <h3>Admin balance is : {state.balance}</h3>
                {/* <h1 id='title'>Tickets remaining</h1>
                <table id='tickets'>
                    <tbody>
                        <tr>{renderTableHeader()}</tr>
                        {renderTableData()}
                    </tbody>
                </table> */}

            </div>
            <br></br>
{/* 
            <div>
                <h1 id='title'>Tickets sold</h1>
                <table id='tickets'>
                    <tbody>
                        <tr>{renderTableHeader()}</tr>
                        {renderTicketsSold()}
                    </tbody>
                </table>

            </div> */}

            <br></br>
            <div>
                <form>
                    <div class="form-group-token">
                        <label for="ticketID">Enter amount:</label>
                        <input type="text" class="form-control" id="ticketID" value={state.ticketID}
                            onChange={handleChange} />
                    </div>
                </form>


                <button type="submit" class="btn btn-primary" onClick={handleSubmitClickToken} >
                    Approve Token
             </button>
                <button type="submit" class="btn btn-primary" onClick={handleSubmitMint} >
                    Mint Token
             </button>

            </div >

            <div class="alert alert-success" style={{ display: state.successMessage ? 'block' : 'none' }} role="alert">
                <span type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></span>
                {state.successMessage}
            </div>
        </div >
    )

}

export default withRouter(OrganizerComponent);