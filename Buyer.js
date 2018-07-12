/*
The parameters of this class are similar to the ones in seller_request class,
the only change is in the formula used to calculate the adj_bid_price
    
To arrive at adjusted bid price, we use a variable called factor. The factor is a weighted mean of need and uniqueness i.e
if the need is more, the factor is more and if uniqueness is more, factor is more.
    
We then make the adjusted bid price to be (1+factor)*bid_price. This is the maximum price that the buyer is willing to 
go up to.
*/
class Buyer
{
	constructor(historyList, nHist, q, gparamList, need, unique, ownerValue, demand, richness, applicability, repeatedPurchase, gparam)
	{
		this.p = 0.2;
		this.c = 0.9;
		this.w1 = 1/7;
		this.w2 = 1/7;
		this.w3 = 1/7;
		this.w4 = 1/7;
		this.w5 = 1/7;
		this.w6 = 1/7;
		this.w7 = 1/7;
		this.need 				= need;
		this.unique 			= unique;
		this.ownerValue 		= ownerValue;
		this.demand 			= demand;
		this.richness 			= richness;
		this.applicability 		= applicability;
		this.repeatedPurchase 	= repeatedPurchase;
		this.gparam 			= gparam;
		this.trend 				= getTrend(10, nHist, this.gparam, gparamList);

		let mean = sum(historyList[this.gparam].slice(-nHist))/nHist;
		this.bidPrice = (mean*q)*(1+this.c*Math.max(this.trend-0.1,0));
		let num = this.w1*this.need 
				+ this.w2*this.unique 
				+ this.w3*this.ownerValue 
				+ this.w4*this.demand
				+ this.w5*this.richness
				+ this.w6*this.applicability
				+ this.w7*this.repeatedPurchase;	
		let den 	= this.w1 + this.w2 + this.w3 + this.w4 + this.w5 + this.w6 + this.w7;
		let factor 	= num/den;
		this.adjBidPrice = (1+this.p*factor)*this.bidPrice;
	}
}

/*
Returns sum of an array's elements
*/
function sum(array)
{
	let sum = 0;
	array.forEach((element) =>{
		sum+= element;
	})
	return sum;
}

/*
gparamList is a list which contains g_parameter of all succesfull transactions
total_param is the number of parameters i.e Age, Location etc.
g_param is the parameter number of the parameter whose trend is required.
nHist is the number of past transactions to get trend.
*/
function getTrend(totalParam, nHist, gparam, gparamList)
{
	let parameterList = new Array(totalParam);
	parameterList.fill(0);


	gparamList.slice(-nHist).forEach((element) => {
		parameterList[element]++;
	})

	return parameterList[gparam]/nHist;
}

module.exports = Buyer;
