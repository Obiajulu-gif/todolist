const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const date = require(__dirname + '/date.js');
const _ = require('lodash');

//enable env variable
require('dotenv').config()

console.log(process.env.dbName);
const app = express()
// basic setup for EJS in express
app.set('view engine', 'ejs'); //it rende only the items in veiw folder

app.use(bodyParser.urlencoded({extended:true}))// bodyParser setup
app.use(express.static("public"))//this serve up all our static files (i.e image, css, javascript)
// Setup For our Mongoose Database
const url = process.env.DB_HOST
const localURI = 'mongodb://0.0.0.0:27017/todolistDB'
mongoose.connect(url, {useNewUrlParser: true})

// Mongoose Schema for the todolist
const itemSchema = {
  name: String
};

const Item = mongoose.model("item", itemSchema);

// Creating a default Document for our app
const item1 = new Item({
  name: "Welcome to your todolist "
})
const item2 = new Item({
  name: "Hit the ➕ button to add a new item."
})
const item3 = new Item({
  name: "👈 Hit this to delete an item"
})

const defaultItem = [item1,item2,item3]

const listSchema = {
  name: String,
  items: [itemSchema] // this will get the above Schema
}

const List = mongoose.model("List", listSchema)

app.get("/", (req, res) => {

  let day = date.getDay()
  let fullDate = date.getWeek()

  // Finding the Data from our Database
  Item.find((err, items) => {
    // this code check if the array called item is empty, then we will add the defaultItem to our Database
    if (items.length === 0 || items.length < 3) {
      Item.insertMany(defaultItem, (err) => {
        if (!err) {
          console.log("Sucessfully Inserted");
        }
      })
      res.redirect('/');//it will redirect to our homepage and after whhich it will land in the else statement where it render the page
    }else {

      // this line of code tend to render the code in  the template ejs
      res.render("list", {kindOfDay: day, preference:"Today", fullDate: fullDate, newItem: items})
    }
  })
})

app.post("/", (req, res) => {
  const itemName = req.body.newItem
  const listName = req.body.list // this is coming from our submit button name(key/value)
  // this will add to our Database
  const newItem = new Item({
    name: itemName
  })
  if (listName === "Today") {
    newItem.save()
    res.redirect('/');
  }else {
    // it will go to our created collection and Search for the listName
    List.findOne({name: listName},(err, results) => {
      results.items.push(newItem)//it will  tap into item key(which is a list) and push a new item in the list
      results.save()
      res.redirect(`/${listName}`);
    })
  }
})
app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (!err) {
        console.log("Sucessfully Deleted");
        res.redirect('/');
      }
    })
  }else {
    // the findOneAndDelete takes three argument,
    // first the check the find the name of the collection
    // we use the $pull from mongoDB and check for the key inside the document(row) after which we specify the id to remove
    // then, we use the callback function
    List.findOneAndDelete({name: listName}, {$pull: {items: {checkedItemId}}}, (err, results ) => {
      if (!err) {
        res.redirect(`/${listName}`);
      }
    });
  }
  // this line of code remove the item from our Database

})
// Creating a dynamic page
app.get('/:paramName', (req, res) => {
  let day = date.getDay()
  let fullDate = date.getWeek()
  const customListName = _.lowerCase(req.params.paramName);

  // find  a Certain variable and check if it exist in the Database
  List.findOne({name: customListName}, (err, results) => {
    if (!err) { // check if there is no error
      if (!results) {
        // Create a new list
        const list = new List ({
          name: customListName,
          items: defaultItem
        })
        list.save()
        res.redirect(`/${customListName}`);// we redirect to the new create link
      }else {

        // Show an existing List
        res.render('list',{kindOfDay: day, preference: results.name, fullDate: fullDate, newItem: results.items});
      }
    }
  })
});

app.get('/about', (req, res) => {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log("Server has started Sucessfully");
})
