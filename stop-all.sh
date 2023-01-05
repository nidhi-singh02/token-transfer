echo "Stopping the rest services"
cd rest-services
docker-compose  down
echo "*******************************************************************"
sleep 3
echo "Stopping the website"
cd ../web-app
docker-compose down
echo "*******************************************************************"
echo "Stopping Blockchain network"
echo "*******************************************************************"
cd ../network/fabric-network
./network.sh down
cd ../../
echo "*******************************************************************"
docker network rm festival-test