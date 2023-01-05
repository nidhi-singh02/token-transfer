import React, { useState, useEffect } from 'react';
import './TableComponent.css';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/apiConstants';
import { withRouter } from "react-router-dom";


function TableForm(props) {

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
        sendDetailsToServer()

    }, [state.email, state.tickets])

    const handleChange = (e) => {
        const { id, value } = e.target
        setState(prevState => ({
            ...prevState,
            [id]: value
        }))

    }

    const sendDetailsToServer = () => {
        const payload = props.emailID

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


    const CallBuyTicket = () => {

        const payload = { "emailID": props.emailID }
        props.showError(null);

        axios.post(API_BASE_URL + '/buyticket/', payload)
            .then(function (response) {
                console.log("response for buy ticket", response.data.data)

                if (response.status === 200) {
                    setState(prevState => ({
                        ...prevState,
                        'successMessage': 'Bought ticket successfully.',
                        tickets: [...prevState.tickets, response.data.data]
                    }))
                    props.showError(null)
                } else if (response.status === 202) {
                    props.showError(response.data);
                }
                else if (response.status === 203) {
                    props.showError(response.data);
                }
                else {
                    props.showError("Some error ocurred");
                }
            })
            .catch(function (error) {
                console.log("error  from catch:", error);
            });

    }


    const CallBuyToken = () => {

        props.showError(null);
        const payload = { "userID": props.emailID, "amount": state.amount }

        axios.post(API_BASE_URL + '/getToken/', payload)
            .then(function (response) {
                console.log("response for buy ticket", response)
                if (response.status === 200) {

                    setState(prevState => ({
                        ...prevState,
                        'successMessage': 'Received token successfully.',
                        'balance': state.balance + parseFloat(state.amount)
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
                    props.showError(null)
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


    const handleSubmitClick = (e) => {
        e.preventDefault();
        CallBuyTicket()
    }

    const handleSubmitClickToken = (e) => {
        e.preventDefault();
        CallBuyToken();
        setState(prevState => ({
            ...prevState,
            amount: ''
        }))

    }


    return (
        <div>
            <div>
                <h1 id='title'>Tickets owned by user {props.emailID}</h1>
                <h3>User's balance is : {state.balance}</h3>
                <table id='tickets'>
                    <tbody>
                        <tr>{renderTableHeader()}</tr>
                        {renderTableData()}
                    </tbody>
                </table>
            </div>

            <br></br>
            <div class="alert alert-info">
                <strong>Info!</strong> Ticket price is 1000 tokens.
                   </div >

            <button
                type="submit"
                className="btn btn-primary"
                onClick={handleSubmitClick}

            >
                Buy Ticket
                </button>

            <hr class="border border-primary"></hr>
            <div>
                <form>
                    <div class="form-group-token">
                        <label for="amount">Enter amount:</label>
                        <input type="number" step="0.01" class="form-control" id="amount" value={state.amount}
                            onChange={handleChange} />
                    </div>
                </form>


                <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={handleSubmitClickToken}
                >
                    Buy Token
                </button>
            </div >


            <div class="alert alert-success" style={{ display: state.successMessage ? 'block' : 'none' }} role="alert">
                <span type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></span>
                {state.successMessage}
            </div>
        </div >
    )

}

export default withRouter(TableForm);