import React, { useState } from 'react';
import axios from 'axios';
import './LoginForm.css';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../../constants/apiConstants';
import { withRouter } from "react-router-dom";

function LoginForm(props) {
    const [state, setState] = useState({
        email: "",
        password: "",
        successMessage: null
    })
    const handleChange = (e) => {
        const { id, value } = e.target
        setState(prevState => ({
            ...prevState,
            [id]: value
        }))
    }

    const handleSubmitClick = (e) => {
        e.preventDefault();
        const payload = {
            "emailID": state.email,
            "password": state.password,
        }

        if (payload.emailID === "wbp@wbp.org") {

            redirectToOrganizerPage();
            props.showError(null)
        } else {
            console.log("API_BASE_URL",API_BASE_URL)
            axios.post(API_BASE_URL + '/user', payload)
                .then(function (response) {
                    if (response.status === 200) {
                        setState(prevState => ({
                            ...prevState,
                            'email': state.email,
                            'successMessage': 'Login successful. Redirecting to home page..'
                        }))
                        localStorage.setItem(ACCESS_TOKEN_NAME, response.data.token);


                        redirectToTable();
                        props.showError(null)
                    }
                    else if (response.code === 204) {
                        props.showError("Username and password do not match");
                    }
                    else {
                        props.showError("Username does not exists");
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        }

    }
    const redirectToTable = () => {
        console.log("state in login", state)
        props.updateTitle('Home');
        props.history.push('/table');
        props.updateEmail(state.email)
    }

    const redirectToOrganizerPage = () => {
        console.log("state in login", state)
        props.updateTitle('Organizer Home');
        props.history.push('/organizer');
        props.updateEmail(state.email)
    }


    const redirectToRegister = () => {
        props.history.push('/register');
        props.updateTitle('Register');
    }

    return (
        <div className="card col-12 col-lg-4 login-card mt-2 hv-center">
            <form>
                <div className="form-group text-left">
                    <label htmlFor="exampleInputEmail1">Email address</label>
                    <input type="email"
                        className="form-control"
                        id="email"
                        aria-describedby="emailHelp"
                        placeholder="Enter email"
                        value={state.email}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group text-left">
                    <label htmlFor="exampleInputPassword1">Password</label>
                    <input type="password"
                        className="form-control"
                        id="password"
                        placeholder="Password"
                        value={state.password}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-check">
                </div>
                <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={handleSubmitClick}
                >Submit</button>
            </form>
            <div className="alert alert-success mt-2" style={{ display: state.successMessage ? 'block' : 'none' }} role="alert">
                {state.successMessage}
            </div>
            <div className="registerMessage">
                <span>Dont have an account? </span>
                <span className="loginText" onClick={() => redirectToRegister()}>Register</span>
            </div>
        </div>
    )
}

export default withRouter(LoginForm);
