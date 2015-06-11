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

    "submit #set-style": function(e){
      var s = document.getElementById('input-style').value.toUpperCase();
      console.log('Trying to get item');
      console.log(s);

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
  items: function(){
    return Items.find({})
  },

  colors: function(){
    var colors = [];
    var selectedItem = Session.get('selectedItem');
    console.log(selectedItem);
    if(typeof(selectedItem) != 'undefined'){
      console.log('pushing colors');
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
    console.log('finding triggers for current item');

    var selectedItem = Session.get('selectedItem');
    console.log(selectedItem);
    if (typeof(selectedItem) == 'undefined'){
      return
    }
    var selectedItemTriggers = Items.find({'style': selectedItem.products[0].id}).fetch()[0];

    console.log(selectedItem);
    console.log(selectedItemTriggers);
    if (typeof(selectedItemTriggers) == 'undefined'){
      console.log('giving up and returning');
      return false
    }


    console.log(selectedItemTriggers);
    console.log(selectedItemTriggers.qtySoldTriggers);
    return selectedItemTriggers.qtySoldTriggers

  }

});

};


if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
