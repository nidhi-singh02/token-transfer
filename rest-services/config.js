'use strict';

const FabricConfig = {
    channelID: 'festtickets',
    chaincodeID: 'marketplace',
    nftContract: 'NFTContract',
    ftContract: 'FTContract',
    ticketFestContract: 'TicketFest'
};
const Config = {
    port: 9085
}

module.exports = { FabricConfig, Config };
