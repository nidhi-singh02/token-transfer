import React, { useState, useEffect } from 'react';
import './SecondarySellComponent.css';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/apiConstants';
import { withRouter } from "react-router-dom";


function SecondarySellComponent(props) {

    const [state, setState] = useState({
        email: "",
        password: "",
        tickets_zero: [{ "Ticket ID": "", "Festival ID": "", "Owner": "", "Price": "", "Approved": "" }],
        successMessage: "",
        balance: 0,
        tickets: []

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
        getTicketsOwnedbyUser()

    }, [state.email, state.tickets, state.balance, state.tickets.approved])

    const handleChange = (e) => {
        const { id, value } = e.target
        setState(prevState => ({
            ...prevState,
            [id]: value
        }))

    }
    const handleChangeTicket = (e) => {
        const { id, value } = e.target
        setState(prevState => ({
            ...prevState,
            [id]: value
        }))

    }

    const getTicketsOwnedbyUser = () => {

        let payload = props.emailID

        axios.get(API_BASE_URL + '/ticketsByOwner/' + payload)
            .then(function (response) {
                if (response.status === 200) {
                    setState(prevState => ({
                        ...prevState,
                        'tickets': response.data
                    }))
                } else {
                    props.showError("Some error ocurred");
                }
            })
            .catch(function (error) {
                console.log(error);
            });

    }


    const CallSellTicket = () => {


        const payload = { "from": props.emailID, "to": state.to, "ticketID": state.ticketID, "price": state.price }
        props.showError(null);

        axios.post(API_BASE_URL + '/buyticketSecondary/', payload)
            .then(function (response) {
                console.log("response for buy ticket", response.data.data)

                if (response.status === 200) {
                    setState(prevState => ({
                        ...prevState,
                        'successMessage': 'Sold ticket successfully',
                        balance: state.balance + parseFloat(state.price)

                    }))
                    props.showError(null)
                } else if (response.status === 203) {
                    props.showError(response.data);
                } else {
                    props.showError("Some error ocurred");
                }
            })
            .catch(function (error) {
                console.log("error  from catch:", error);
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

    const search = (nameKey, myArray) => {
        for (var i = 0; i < myArray.length; i++) {
            if (myArray[i].ticketID === nameKey) {
                return myArray[i];
            }
        }
    }


    const CallApproveTicket = () => {
        props.showError(null);
        const payload = { "from": props.emailID, "to": "secondary@wbp.org", "ticketID": state.ticket_ID }

        axios.post(API_BASE_URL + '/approveticket/', payload)
            .then(function (response) {
                console.log("response for approve ticket", response)
                if (response.status === 200) {

                    let TobeUpdated = search(state.ticket_ID, state.tickets)

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


    const handleSubmitTicket = (e) => {
        e.preventDefault();
        CallSellTicket();
        setState(prevState => ({
            ...prevState,
            ticketID: '',
            price: '',
            to: ''
        }))

    }
    const handleApproveTicket = (e) => {
        e.preventDefault();
        CallApproveTicket();
        setState(prevState => ({
            ...prevState,
            ticket_ID: ''
        }))

    }


    return (
        <div>
            <div>
                <h1 id='title'>Tickets available with user</h1>
                <h3>User's balance is : {state.balance}</h3>
                <table id='tickets'>
                    <tbody>
                        <tr>{renderTableHeader()}</tr>
                        {renderTableData()}
                    </tbody>
                </table>

            </div>
            <br></br>
            <div>

                <form>
                    <div class="form-group-token">
                        <label for="to">Enter recipient:</label>
                        <input type="text" class="form-control" id="to" value={state.to}
                            onChange={handleChangeTicket} />
                    </div>
                    <div class="form-group-token">
                        <label for="ticketID">Enter ticket ID:</label>
                        <input type="text" class="form-control" id="ticketID" value={state.ticketID}
                            onChange={handleChangeTicket} />
                    </div>
                    <div class="form-group-token">
                        <label for="price">Enter price:</label>
                        <input type="number" step="0.01" min="0" max="9" class="form-control" id="price" value={state.price}
                            onChange={handleChange} />
                    </div>
                </form>

                <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={handleSubmitTicket}
                >
                    Sell Ticket
                </button>
            </div >

            <br>
            </br>

            <div>
                <form>
                    <div class="form-group-token">
                        <label for="ticket_ID">Enter ticket ID:</label>
                        <input type="text" class="form-control" id="ticket_ID" value={state.ticket_ID}
                            onChange={handleChangeTicket} />
                    </div>
                </form>

                <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={handleApproveTicket}
                >
                    Approve Ticket
                </button>
            </div >

            <div class="alert alert-success" style={{ display: state.successMessage ? 'block' : 'none' }} role="alert">
                <span type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></span>
                {state.successMessage}
            </div>

        </div >
    )

}

export default withRouter(SecondarySellComponent);