echo "Starting Hyperledger Fabric Network"
echo "*******************************************************************"
chmod -R 777 network
cd network/fabric-network
echo "Bringing up Network with Certificate Authority and channel 'festtickets'"
./network.sh up createChannel -c festtickets -ca -s couchdb
echo "Hyperledger Fabric Network started"
sleep 3
echo "couchDB is running on port 7984 and 8984"
sleep 1
echo "*******************************************************************"
echo "Deploying chaincode 'festival' on channel 'festtickets'"
./network.sh deployCC -ccn token -ccp ../chaincode/ -ccl go -c festtickets -ccv 1.0 -ccs 1 -cci initLedger
echo "Chaincode deployment- completed"
echo "*******************************************************************"
sleep 2
echo "Starting the rest services"
cd ../../rest-services
docker-compose up --build -d
echo "rest services started on port 9085 (localhost:9085)"
echo "*******************************************************************"
sleep 3
echo "Starting the website"
cd ../web-app
docker-compose up --build -d
echo "front end started on port 3001 (localhost:3001)"
cd ../
echo "*******************************************************************"