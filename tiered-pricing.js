Items = new Mongo.Collection('items');

if (Meteor.isClient) {
  //Session.setDefault('style', 'ORU0004');

  var logHello = function(){
    console.log('hello');
  };

  var currentTriggerValues = function(){
    var t = [];
    var triggerThresholds = $('.triggerRow').find('.qty-sold-trigger');
    var salePercents = $('.triggerRow').find('.percent-off');
    for (var i=0; i<triggerThresholds.length; i++){
      t.push({'qtySold': triggerThresholds[i].value, 'salePercent': salePercents[i].value});
    }
    console.log(t);
    return t;
  };

  Template.tieredPricing.events({
    "click #add-row": function(){
      Items.update(Session.get('selectedItemTriggersId'), {$push: {qtySoldTriggers: {'qtySold': null, 'salePercent': null}}});
    },

    "click #save-btn": function(){
      Items.update(Session.get('selectedItemTriggersId'), {$set: {qtySoldTriggers: currentTriggerValues()}});
    },

    "submit #set-style": function(e){
      var s = document.getElementById('input-style').value.toUpperCase();
      Meteor.http.get('http://api.backcountry.com/v1/products/' + s + '?fields=skus', function (err, res) {
        console.log(res.statusCode, res.data);
        if(res.statusCode == 200){
          Session.set('selectedItem', res.data);
          console.log(res.data);
          console.log('setting product image');
          console.log($('#productImage'))
          $('#productImage').attr('src', 'http://www.backcountry.com/' + res.data.products[0].skus[0].image.url);
        } else {
          alert('Item not found');
        }
      });
      return false
    }
  });


Template.tieredPricing.helpers({
  colors: function(){
    var colors = [];
    var selectedItem = Session.get('selectedItem');
    if(typeof(selectedItem) != 'undefined'){
      selectedItem.products[0].skus.forEach(function(sku){
        color = sku.color.name;
        if (colors.indexOf(color) == -1){
          colors.push(sku.color.name);
        }
      });
    }
    return colors
  },

  selectedItem: function(){
    return Session.get('selectedItem');
  },

  triggers: function(){
    var selectedItem = Session.get('selectedItem');
    if (typeof(selectedItem) == 'undefined'){
      return
    }
    var selectedItemTriggers = Items.find({'style': selectedItem.products[0].id}).fetch()[0];

    if (typeof(selectedItemTriggers) == 'undefined'){
      Items.insert({
        'style': selectedItem.products[0].id,
        'qtySoldTriggers': []
      });
      selectedItemTriggers = Items.find({'style': selectedItem.products[0].id}).fetch()[0];
    }

    Session.set('selectedItemTriggersId', Items.find({'style': selectedItem.products[0].id}).fetch()[0]._id);
    return selectedItemTriggers.qtySoldTriggers
  }
});

};

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}