 /* 
 Need and unique(ness) are set normally, mean = 0.5
 gparameter indicates what object is being sold, as of now there are two generic objects,
 object0 and object1 which can represent any two sellable data types, for ex. Age and Location
    
 askPrice depends on the mean price of that object, which is retrieved from historyList
 historyList is a lists of list with dimension0 = [values_of_gparameter]
 the length of the individual list for a gparameter is the number of trades that occured for that object
    
 In this case, the historyList has two sublists, one each for object0 and object1,
 the askPrice for an object will be the mean of the prices of its corresponding historyList
    
 The adjAskPrice is the negotiation aspect of the trade, which depends on unique(ness) and need
    
 To arrive at adjusted ask price, we use a variable called factor. The factor is a weighted mean of need 
 and (1-uniqueness) i.e if the need is more, the factor is more and if uniqueness is more, factor is less.
    
 We then make the adjusted ask price to be (1-factor)*askPrice. This is the minimum price that the seller is willing 
 to go down to.
 */
class Seller
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
		let mean 				= sum(historyList[this.gparam].slice(-nHist))/nHist;
		this.askPrice = (mean/q)*(1+this.c*Math.max(this.trend-0.1,0));
		let num = this.w1*this.need 
				+ this.w2*(1-this.unique) 
				+ this.w3*this.ownerValue 
				+ this.w4*this.demand
				+ this.w5*this.richness
				+ this.w6*this.applicability
				+ this.w7*this.repeatedPurchase;
		let den 	= this.w1 + this.w2 + this.w3 + this.w4 + this.w5 + this.w6 + this.w7;
		let factor 	= num/den;
		this.adjAskPrice = (1-this.p*factor)*this.askPrice;
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

	gparamList.slice(-nHist).forEach((element) =>{
		parameterList[element]++;
	})

	return parameterList[gparam]/nHist;
}

module.exports = Seller;
