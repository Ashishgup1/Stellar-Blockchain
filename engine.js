var Engine = {
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
				priceSold = 0;
			}
		}
		this.saveRecord(priceSold, SellerReq.gparam, historyList, gparamList);
		return priceSold;
	},
	saveRecord : function (priceSold, gparam, historyList, gparamList)
	{
		if(priceSold != 0)
		{
			historyList[gparam].push(priceSold);
			gparamList.push(gparam);
		}
	}
}
/*
let gparamList = new Array();

for(let i = 0;i<200;i++)
{
	gparamList.push(i%10);
}

let nHist 			= 200,
	q 			 	= 0.97,
	historyList 	= new Array();

for(let i=0;i<10;i++)
{
	tempList = new Array();
	for(let j=0;j<300;j++)
	{
		tempList.push(300);
	}
	historyList.push(tempList);
}

for(let i=0;i<10;i++)
{
	console.log("--------------------------------");
	// need, unique, ownerValue, demand, richness, applicability, repeatedPurchase, gparam
	let buyer = new Buyer(historyList, nHist, q, gparamList, 0.9,0.1+i/10,0.1,0.1,0.1,0.1,0.1,2),	
		seller = new Seller(historyList, nHist, q, gparamList, 0.9,0.1,0.1,0.1,0.1,0.1,0.1,2);
	console.log(buyer);
	console.log(seller);	
	transact_price(buyer, seller);
}
console.log("--------------------------------");
*/
module.exports= Engine;
