App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  images: [
    "images/ps5.jpg",
    "images/ps4.png",
    "images/xbox-series-s.png",
    "images/xbox-series-x.png",
  ],
  
  init: function() {
    return App.initWeb3();
  },

  initWeb3: async function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Marketplace.json", function(marketplace) {
      App.contracts.Marketplace = TruffleContract(marketplace);
      App.contracts.Marketplace.setProvider(App.web3Provider);

      return App.render();
    });
  },

  render: function(){
    var marketplaceInstance;
    console.log(App.images[1]);
      // Captura o endereço da conta conectada
      web3.eth.getCoinbase(function(err, account) {
        if (err === null) {
          App.account = account;

          var connectedAccount = $("#connected-account");
          connectedAccount.append("Conta conectada: "+account);
        }
      });
          
      App.contracts.Marketplace.deployed()
      .then(function(instance){
        marketplaceInstance = instance;
        return marketplaceInstance.productCount();
      })
      .then(function(productCount){
        for(i = 1; i <= productCount; i++){
          marketplaceInstance.products(i)
          .then(function(product){
          var consoleRow = $("#consoleRow"); 
          var consoleTemplate = $("#consoleTemplate");

            var id = product[0];
            var name = product[1];
            var price = product[2];
            var owner = product[3];
            var purchased = product[4];

            consoleTemplate.find('.panel-title').text(name);
            consoleTemplate.find('.price').text(price+" ETH");
            consoleTemplate.find('.seller').text(owner);
            consoleTemplate.find('.seller').text(owner);
            consoleTemplate.find('img').attr('src', App.images[id-1]);

            if(purchased){
              consoleTemplate.find('.btn-buy').attr('data-id', id);
              consoleTemplate.find('.btn-buy').attr('data-price', price);
              consoleTemplate.find('.btn-buy').attr('style', "display: none");
              consoleTemplate.find('.selled').attr('style', "");
            }else{
              consoleTemplate.find('.btn-buy').attr('data-id', id);
              consoleTemplate.find('.btn-buy').attr('data-price', price);
              consoleTemplate.find('.selled').attr('style', "display: none");
              consoleTemplate.find('.btn-buy').attr('style', "");
            }
            consoleRow.append(consoleTemplate.html());
          })
        }
      })
      .catch(function(error){
        console.log(error);
      });
  

    $(document).on('click', '.btn-buy', App.handlePurchase);
  },

  handlePurchase: function(event) {
    event.preventDefault();

    var productId = parseInt($(event.target).data('id'));
    var productPrice = parseInt($(event.target).data('price'));
    
    App.contracts.Marketplace.deployed()
    .then(function(instance){
      return instance.purchaseProduct(productId, {from: App.account, value: web3.toWei(productPrice, 'ether')})
    })
    .then(function(result){
      location.reload();
    })
    .catch(function(error){
      console.log(error);
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
