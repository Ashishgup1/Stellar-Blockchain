var Engine = 
{
	transact_price : function(BuyerReq, SellerReq, historyList, gparamList)
	{
		let askPrice 		    = SellerReq.askPrice,
			adjustedAskPrice 	= SellerReq.adjAskPrice,
			bidPrice 		   	= BuyerReq.bidPrice,
			adjustedBidPrice 	= BuyerReq.adjBidPrice,
			priceSold         	= 0;
			
		if(askPrice <= bidPrice)
		{
			priceSold = askPrice;
		}
		else
		{
			if(askPrice <= adjustedBidPrice)
			{
				priceSold = askPrice;
			}
			else if (adjustedAskPrice <= adjustedBidPrice)
			{
				priceSold = (adjustedAskPrice+adjustedBidPrice)/2;
			}
			else
			{
				priceSold = (adjustedAskPrice+adjustedBidPrice)/2;
			}
		}

		return priceSold;
	},
}

module.exports= Engine;
