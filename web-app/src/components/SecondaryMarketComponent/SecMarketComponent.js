import React, { useState, useEffect } from 'react';
import './SecMarketComponent.css';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/apiConstants';
import { withRouter } from "react-router-dom";


function SecMarketComponent(props) {

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
        getTicketsinSecMarket()

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

    const getTicketsinSecMarket = () => {

        axios.get(API_BASE_URL + '/tickets/secondarymarket/')
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

        const payload = { "from": "secondary@wbp.org", "to": props.emailID, ticketID: state.ticketID, "price": state.price }
        props.showError(null);

        axios.post(API_BASE_URL + '/buyticketSecondary/', payload)
            .then(function (response) {
                console.log("response for buy ticket", response.data)

                if (response.status === 200) {
                    setState(prevState => ({
                        ...prevState,
                        'successMessage': 'Bought ticket successfully',
                        balance: state.balance - parseFloat(state.price),
                        tickets: response.data
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
        CallBuyTicket();
        setState(prevState => ({
            ...prevState,
            ticketID: '',
            price: ''
        }))

    }

    const handleSellTicket = (e) => {
        e.preventDefault();
        redirectToSellPage();

    }

    const redirectToSellPage = () => {
        props.updateTitle('Secondary Market Sales');
        props.history.push('/sell');
        props.updateEmail(state.email)
    }



    return (
        <div>
            <div>
                <h1 id='title'>Tickets available in secondaryMarket</h1>
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
                        <label for="ticketID">Enter ticket ID:</label>
                        <input type="text" class="form-control" id="ticketID" value={state.ticketID}
                            onChange={handleChangeTicket} />
                    </div>
                    <div class="form-group-token">
                        <label for="price">Enter price:</label>
                        <input type="number" step="0.01" class="form-control" id="price" value={state.price}
                            onChange={handleChange} />
                    </div>
                </form>

                <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={handleSubmitTicket}
                >
                    Buy Ticket
                </button>
            </div >


            <div class="alert alert-success" style={{ display: state.successMessage ? 'block' : 'none' }} role="alert">
                <span type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></span>
                {state.successMessage}
            </div>

            <button
                type="submit"
                className="btn btn-primary"
                onClick={handleSellTicket}
            >
                Sell Ticket
                </button>
        </div >
    )

}

export default withRouter(SecMarketComponent);