import React, { useState } from 'react';
import './App.css';
import Header from './components/Header/Header';
import LoginForm from './components/LoginForm/LoginForm';
import Table from './components/TableComponent/TableComponent';
import OrganizerForm from './components/OrganizerComponent/OrganizerComponent';
import RegistrationForm from './components/RegistrationForm/RegistrationForm';
import Home from './components/Home/Home';
import SecMarketLoginForm from './components/SecMarketLoginForm/SecMarketLoginForm';
import SecMarket from './components/SecondaryMarketComponent/SecMarketComponent';
import SecondarySellForm from './components/SecondarySellComponent/SecondarySellComponent';
import PrivateRoute from './utils/PrivateRoute';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import AlertComponent from './components/AlertComponent/AlertComponent';
function App() {
  const [title, updateTitle] = useState(null);
  const [errorMessage, updateErrorMessage] = useState(null);
  const [emailID, updateEmail] = useState(null);
  return (
    <Router>
      <div className="App">
        <Header title={title} />
        <div className="container d-flex align-items-center flex-column">
          <Switch>
            <Route path="/" exact={true}>
              <RegistrationForm showError={updateErrorMessage} updateTitle={updateTitle} />
            </Route>
            <Route path="/register">
              <RegistrationForm showError={updateErrorMessage} updateTitle={updateTitle} />
            </Route>
            <Route path="/login">
              <LoginForm showError={updateErrorMessage} updateTitle={updateTitle} updateEmail={updateEmail} />
            </Route>
            <Route path="/table">
              <Table showError={updateErrorMessage} updateTitle={updateTitle} updateEmail={updateEmail} emailID={emailID} />
            </Route>
            <Route path="/organizer">
              <OrganizerForm showError={updateErrorMessage} updateTitle={updateTitle} updateEmail={updateEmail} emailID={emailID} />
            </Route>
            <Route path="/secondaryMarket">
              <SecMarketLoginForm showError={updateErrorMessage} updateTitle={updateTitle} updateEmail={updateEmail} />
            </Route>
            <Route path="/market">
              <SecMarket showError={updateErrorMessage} updateTitle={updateTitle} updateEmail={updateEmail} emailID={emailID} />
            </Route>
            <Route path="/sell">
              <SecondarySellForm showError={updateErrorMessage} updateTitle={updateTitle} updateEmail={updateEmail} emailID={emailID} />
            </Route>
            <PrivateRoute path="/home">
              <Home />
            </PrivateRoute>
          </Switch>
          <AlertComponent errorMessage={errorMessage} hideError={updateErrorMessage} />
        </div>
      </div>
    </Router>
  );
}

export default App;
