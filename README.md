## SettleMint Assigment

We have three folders for three different layers

### network

This folder contains all Hyperledger Fabric related cryptographic material, channel artifacts, genesis block,chaincode and docker-compose YAML files.

### rest-services

This folder is a Web server based on Node.js and Express.js framework. It facilitates following things -

Acts like a Web server that wraps all the Fabric interaction logic as REST API (GET, POST endpoints).<br />
Acts as client for Fabric network by using Fabric-Client NODE SDK <br />
Bridge between an user interface layer and fabric network layer.

### web-app

This folder is participant's interface(User,Organizer,Secondary Market Admin) developed using react.js. This consumes REST API to contact with Web server.

# Prerequisites:

- **Docker and Docker Compose (latest)**
- **Golang (latest) with $GOPATH set**
- **Check the url of 'certificateAuthorities' and 'peers' in ccp-template.json and ccp-template.yaml located on path network/fabric-network/organizations**
- **Check .env file under web-app for hostname of rest services**

### Bringing up Hyperledger Fabric Network, rest services and web app with one command

```bash
. ./start-all.sh
```

- **CouchDB starts on port 7984 (http://localhost:7984/\_utils/#). Initilaized data can be seen in "tickets_festival" database**
- **Rest service starts on port 9085 (localhost:9085). Check by hitting "http://localhost:9085/ping" in browser**
- **For verifying REST services, please find the Postman collection named "Ticket Festival"**
- **Front end starts on port 3001 (localhost:3001).**
- **SettleMint front end : http://localhost:3001**
- **Secondary Market front end : http://localhost:3001/secondaryMarket**

# Demo video

[![Watch the video](https://github.com/nidhi-singh02/NFT-FT-festival/blob/main/demo-icon.PNG)](https://drive.google.com/file/d/1HteGqocJR5vCWuuHg8fQLYIAMPuiuB92/view?usp=sharing)
