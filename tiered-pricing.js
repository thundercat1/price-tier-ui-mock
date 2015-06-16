/*
Items = [
 {
    'style': 'ORU0004',
    'expires': new Date(2015, 6, 6),
    'qtySoldTriggers': [
      {
        'qtySold': 100,
        'salePercent': 40,
        'finished': true
      },
      {
        'qtySold': 50,
        'salePercent': 20,
        'finished': false
      },
      {
        'qtySold': 20,
        'salePercent': 10,
        'finished': false
      }
    ]
 } 
]
*/

Items = new Mongo.Collection('items');

if (Meteor.isClient) {
  Session.setDefault('style', 'ORU0004');

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
    "click #add-item": function(){
      console.log('adding item');
      Items.insert(
      {
        'style': 'SNZ0340',
        'expires': new Date(2015, 6, 6),
        'qtySoldTriggers': [
        {
          'qtySold': 0,
          'salePercent': 30,
          'finished': true
        },
        {
          'qtySold': 20,
          'salePercent': 20,
          'finished': false
        }
        ]
      });
    },

    "click #log-items": function(){
      i = Items.find({});
      console.log(i);
    },

    /*
    "change .qty-sold-trigger": function(e){
      logHello();
      currentTriggerValues();
      //Items.update(Session.get('selectedItemTriggersId'), {$set: {: ! this.checked}});
      Items.update(Session.get('selectedItemTriggersId'), {$set: {qtySoldTriggers: currentTriggerValues()}});
    },
    */

    "click #add-row": function(){
      //var newQtySoldTrigger = document.getElementById('new-trigger-qty-sold').value;
      //var newSalePercent = document.getElementById('new-trigger-sale-percent').value;
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