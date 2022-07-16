
const Order = require("./Order");

let drink_cost = 10;

const large_size = 115;
const medium_size = 1112;
const small_size = 1110;

const OrderState = Object.freeze({
    WELCOMING:   Symbol("welcoming"),
    SIZE:   Symbol("size"),
    TYPE:   Symbol("type"),
    DRINKS:  Symbol("drinks"),
    PAYMENT: Symbol("payment"),


    SECOND_ITEM: Symbol("welcoming"),
    CHICKEN: Symbol("chicken"),
    SECONDORDER:   Symbol("order2"),
    ORDERTYPE2:   Symbol("ordertype2"),
});

module.exports = class ShwarmaOrder extends Order{
    constructor(sNumber, sUrl){
        super(sNumber, sUrl);
        this.stateCur = OrderState.WELCOMING;
        this.sSize = "";
        this.sType = "";
        this.sDrinks = "";
        this.sItem = "shawarama";
        
        this.sOrderItem2 = "Chicken Roll";
        this.sORDERTYPE2 = "";
        this.sSECONDORDER = "";
        this.nFinal_Price = 0;
    }
        handleInput(sInput){
          let aReturn = [];
          switch(this.stateCur){
              case OrderState.WELCOMING:
                  this.stateCur = OrderState.SIZE;
                  aReturn.push("Welcome to Food shop.");
                  aReturn.push("What size meal would you like?");
                  break;
              case OrderState.SIZE:
                  this.stateCur = OrderState.SECOND_ITEM
                  this.sSize = sInput;
                  if (sInput.toLowerCase() == "large") {
                      this.nFinal_Price += large_size;
                  } else if (sInput.toLowerCase() == "medium") {
                      this.nFinal_Price += medium_size;
                  } else if (sInput.toLowerCase() == "small"){
                      this.nFinal_Price += small_size;
                  }else{
                      aReturn.push("valid sizes are: large, small, medium");
                      break;    
                  }
                  aReturn.push("What would you add to the fries?");
                  break;
  
                  case OrderState.SECOND_ITEM:
                  this.stateCur = OrderState.SECONDORDER;
                  this.sType = sInput;
                  if (sInput.toLowerCase() == "large") {
                      this.nFinal_Price += large_size;
                  } else if (sInput.toLowerCase() == "medium") {
                      this.nFinal_Price += medium_size;
                  } else if (sInput.toLowerCase() == "small"){
                      this.nFinal_Price += small_size;
                  }else{
                      aReturn.push("valid sizes are: large, small, medium");
                      break;    
                  }
              case OrderState.SECONDORDER:
                  this.sSECONDORDER = sInput
                  this.stateCur = OrderState.TYPE
                  if (sInput.toLowerCase() != "no") {
                      if (this.sSECONDORDER == "large") {
                      this.nFinal_Price += large_size;
                      } else if (this.sSECONDORDER == "medium") {
                          this.nFinal_Price += medium_size;
                      } else {
                          this.nFinal_Price += small_size;
                      }
                  aReturn.push("What would you add to the cheese in roll?");
                  }else{
                      aReturn.push(`${sInput} is not valid, please  choose regular or cheddar`);
                    }
                  break;
  
                  case OrderState.TYPE:
                  this.stateCur = OrderState.DRINKS
                  this.sORDERTYPE2 = sInput;
                  aReturn.push("Would you like drinks with that?");
                  break;
                  case OrderState.DRINKS:
                      if((sInput.toLowerCase() != "dr.pepper") &&
                        (sInput.toLowerCase() != "cocacola") &&
                        (sInput.toLowerCase() != "pepsi") &&
                        (sInput.toLowerCase() != "no")) {
                          aReturn.push(`${sInput} is not valid, please choose fanta,canada dry, pepsi or no`);
                        } else {
                          this.stateCur = OrderState.PAYMENT;
                          this.nOrder = this.nOrder + 2;
                          if(sInput.toLowerCase() != "no"){
                            this.sDrinks = sInput;
                            drink_cost = 4;
                        }
                        aReturn.push("Thank you for your order of");
                        aReturn.push(`Order 1: ${this.sSize} ${this.sItem} with ${this.sType}.`);
                        if (this.sSECONDORDER != "no") {
                            aReturn.push(`Order 2: ${this.sOrderItem2} with ${this.sORDERTYPE2}.`); 
                        } if(this.sDrinks){                          
                               aReturn.push(` with a drink of ${this.sDrinks}`);
                        }
                        aReturn.push(`Total is $${this.nFinal_Price + drink_cost}`)
                        let d = new Date(); 
                        d.setMinutes(d.getMinutes() + 15);
                        aReturn.push(`Please pick it up at ${d.toTimeString()}`);
                        aReturn.push(`Please pay for your order here`);
                        aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
                      }
                        break;
               case OrderState.PAYMENT:
                console.log(sInput);
                this.isDone(true);
                let d = new Date();
                d.setMinutes(d.getMinutes() + 20);
                aReturn.push(`Your order will be delivered at ${d.toTimeString()}`);
                break;
        }
        return aReturn;
    }
    renderForm(sTitle = "-1", sAmount = "-1"){
      // your client id should be kept private
      if(sTitle != "-1"){
        this.sItem = sTitle;
      }
      if(sAmount != "-1"){
        this.nFinal_Price = sAmount;
      }
      const sClientID = process.env.SB_CLIENT_ID || 'put your client id here for testing ... Make sure that you delete it before committing'
      return(`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your ${this.sItem} order of $${this.nFinal_Price}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nFinal_Price}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);
  
    }
}
=======
const Order = require("./Order");

let drink_cost = 0;

const large_size = 115;
const medium_size = 112;
const small_size = 1011;

const OrderState = Object.freeze({
    WELCOMING:   Symbol("welcoming"),
    SIZE:   Symbol("size"),
    TYPE:   Symbol("type"),
    DRINKS:  Symbol("drinks"),
    PAYMENT: Symbol("payment"),


    SECOND_ITEM: Symbol("welcoming"),
    CHICKEN: Symbol("chicken"),
    SECONDORDER:   Symbol("order2"),
    ORDERTYPE2:   Symbol("ordertype2"),
});

module.exports = class ShwarmaOrder extends Order{
    constructor(sNumber, sUrl){
        super(sNumber, sUrl);
        this.stateCur = OrderState.WELCOMING;
        this.sSize = "";
        this.sType = "";
        this.sDrinks = "";
        this.sItem = "shawarama";
        
        this.sOrderItem2 = "Chicken Roll";
        this.sORDERTYPE2 = "";
        this.sSECONDORDER = "";
        this.nFinal_Price = 0;
    }
        handleInput(sInput){
          let aReturn = [];
          switch(this.stateCur){
              case OrderState.WELCOMING:
                  this.stateCur = OrderState.SIZE;
                  aReturn.push("Welcome to Food shop.");
                  aReturn.push("What size meal would you like?");
                  break;
              case OrderState.SIZE:
                  this.stateCur = OrderState.SECOND_ITEM
                  this.sSize = sInput;
                  if (sInput.toLowerCase() == "large") {
                      this.nFinal_Price += large_size;
                  } else if (sInput.toLowerCase() == "medium") {
                      this.nFinal_Price += medium_size;
                  } else if (sInput.toLowerCase() == "small"){
                      this.nFinal_Price += small_size;
                  }else{
                      aReturn.push("valid sizes are: large, small, medium");
                      break;    
                  }
                  aReturn.push("What would you add to the fries?");
                  break;
  
                  case OrderState.SECOND_ITEM:
                  this.stateCur = OrderState.SECONDORDER;
                  this.sType = sInput;
                  if (sInput.toLowerCase() == "large") {
                      this.nFinal_Price += large_size;
                  } else if (sInput.toLowerCase() == "medium") {
                      this.nFinal_Price += medium_size;
                  } else if (sInput.toLowerCase() == "small"){
                      this.nFinal_Price += small_size;
                  }else{
                      aReturn.push("valid sizes are: large, small, medium");
                      break;    
                  }
              case OrderState.SECONDORDER:
                  this.sSECONDORDER = sInput
                  this.stateCur = OrderState.TYPE
                  if (sInput.toLowerCase() != "no") {
                      if (this.sSECONDORDER == "large") {
                      this.nFinal_Price += large_size;
                      } else if (this.sSECONDORDER == "medium") {
                          this.nFinal_Price += medium_size;
                      } else {
                          this.nFinal_Price += small_size;
                      }
                  aReturn.push("What would you add to the cheese in roll?");
                  }else{
                      aReturn.push(`${sInput} is not valid, please  choose regular or cheddar`);
                    }
                  break;
  
                  case OrderState.TYPE:
                  this.stateCur = OrderState.DRINKS
                  this.sORDERTYPE2 = sInput;
                  aReturn.push("Would you like drinks with that?");
                  break;
                  case OrderState.DRINKS:
                      if((sInput.toLowerCase() != "dr.pepper") &&
                        (sInput.toLowerCase() != "cocacola") &&
                        (sInput.toLowerCase() != "pepsi") &&
                        (sInput.toLowerCase() != "no")) {
                          aReturn.push(`${sInput} is not valid, please choose fanta,canada dry, pepsi or no`);
                        } else {
                          this.stateCur = OrderState.PAYMENT;
                          this.nOrder = this.nOrder + 2;
                          if(sInput.toLowerCase() != "no"){
                            this.sDrinks = sInput;
                            drink_cost = 4;
                        }
                        aReturn.push("Thank you for your order of");
                        aReturn.push(`Order 1: ${this.sSize} ${this.sItem} with ${this.sType}.`);
                        if (this.sSECONDORDER != "no") {
                            aReturn.push(`Order 2: ${this.sOrderItem2} with ${this.sORDERTYPE2}.`); 
                        } if(this.sDrinks){                          
                               aReturn.push(` with a drink of ${this.sDrinks}`);
                        }
                        aReturn.push(`Total is $${this.nFinal_Price + drink_cost}`)
                        let d = new Date(); 
                        d.setMinutes(d.getMinutes() + 15);
                        aReturn.push(`Please pick it up at ${d.toTimeString()}`);
                        aReturn.push(`Please pay for your order here`);
                        aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
                      }
                        break;
               case OrderState.PAYMENT:
                console.log(sInput);
                this.isDone(true);
                let d = new Date();
                d.setMinutes(d.getMinutes() + 20);
                aReturn.push(`Your order will be delivered at ${d.toTimeString()}`);
                break;
        }
        return aReturn;
    }
    renderForm(sTitle = "-1", sAmount = "-1"){
      // your client id should be kept private
      if(sTitle != "-1"){
        this.sItem = sTitle;
      }
      if(sAmount != "-1"){
        this.nFinal_Price = sAmount;
      }
      const sClientID = process.env.SB_CLIENT_ID || 'put your client id here for testing ... Make sure that you delete it before committing'
      return(`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your ${this.sItem} order of $${this.nFinal_Price}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nFinal_Price}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);
  
    }
}
>>>>>>> daef1d3172e5ae586409a043dea32573dc6e6dc9
