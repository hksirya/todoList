const express=require('express');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const _=require("lodash");

const app=express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set('view engine','ejs');

mongoose.connect("mongodb+srv://hksirya:<password>@cluster0.xlc3tqu.mongodb.net/todoList?retryWrites=true&w=majority",{useNewUrlParser: true, useUnifiedTopology: true});

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

const itemsSchema=mongoose.Schema({
  name:String
});

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({name:"Welcome to your Todo List"});

const item2=new Item({name:"Hit the + button to add new List Items"});

const item3=new Item({name:" Hit this to delete the items"});

const defaultItem=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);

app.get("/",(req,res)=>{

  Item.find({},function(err,foundItems){

    if(foundItems.length===0){
      Item.insertMany(defaultItem,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully Added")
        }
      });
      res.redirect("/");
  }else{
      res.render("list",{ListTitle:"Today",itemsList:foundItems});
    }
  });  
});

app.get("/:customListName",function(req,res){

  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name:customListName,
          list:defaultItem
        });
      
        list.save();
        res.redirect("/" + customListName)
      }else{
        res.render("list",{ListTitle:foundList.name,itemsList:foundList.items});
      }
    }
  })
});

app.post("/",function(req,res){
  const itemName=req.body.item;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  })

  if(listName==="Today"){
    item.save();
   res.redirect("/")
  }else{
   List.findOne({name:listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
   }) 
  }
});

app.post("/delete",function(req,res){
  const checkedItem=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItem,function(err){
      if(!err){
        console.log("Successfully Removed");
        res.redirect("/")
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull :{items :{_id:checkedItem}}},function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
  
});



