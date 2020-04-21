const mongoose      = require("mongoose");
const Campground    = require("./models/campground"),
      Comment       = require("./models/comment"),
      User          = require("./models/user");

var seedCamps = [
    {
        name: "Salmon Overlook", 
        image: "https://images.unsplash.com/photo-1564577160324-112d603f750f?auto=format&fit=crop&w=800&q=80",
        description: "Wooded area with a closeby waterfall",
        cost: 24.99
    },
    {
        name: "Avo Plains", 
        image: "https://images.unsplash.com/photo-1528433556524-74e7e3bfa599?auto=format&fit=crop&w=800&q=80",
        description: "Flat plans with gorgeous views",
        cost: 10.00
    },
    {
        name: "Green Canyon", 
        image: "https://images.unsplash.com/photo-1455763916899-e8b50eca9967?auto=format&fit=crop&w=800&q=80",
        description: "Camp at the base of beautiful canyons",
        cost: 50
    }
]

var seedComments = [
    {
        text: "Astonishment the sky calls to us paroxysm of global death Tunguska event the only home we've ever known Flatland.",
        author: "Alpha"
    },
    {
        text: "Made in the interiors of collapsing stars a mote of dust suspended in a sunbeam stirred by starlight venture great turbulent clouds not a sunrise but a galaxyrise.",
        author: "Beta"
    },
    {
        text: "At the edge of forever made in the interiors of collapsing stars finite but unbounded vastness is bearable only through love rich in mystery at the edge of forever.",
        author: "Gamma"
    },
]

var seedUsers = [
    {
        email: "sarah@domain.com",
        username: "smallsarah",
        password: "password1"
    },
    {
        email: "portrait@domain.com",
        username: "theartist",
        password: "password2"
    },
    {
        email: "examplar@domain.com",
        username: "examplar",
        password: "password3"
    },
]

var deleteAll = async function(){
    await Campground.deleteMany({})
    console.log("Campgrounds removed");
    await Comment.deleteMany({})
    console.log("Comments removed");
    await User.deleteMany({})
    console.log("Users removed");
}

// NOTE: "Push" use "_id", "=" use "id" 
var createCampUser = async function(){
    for (let i = 0; i < 3; i++) {
        let camp = await Campground.create(seedCamps[i]);
        console.log("Campground created");
        let user = await User.register({
            email: seedUsers[i].email,
            username: seedUsers[i].username
        }, seedUsers[i].password);
        console.log("User Created")
        author = {
            id: user._id,
            username: user.username,
        }
        camp.author = author;
        camp.save();
        console.log("Author pushed to camp");


        campinfo = {
            _id: camp._id,
            name: camp.name
        }

        user.campgrounds.push(campinfo);
        user.save();
        
        console.log("Camp pushed to author");
    }
}

var createComments = async function(){
    for (let i = 0; i < 3; i++) {
        let camp = await Campground.findOne({name: seedCamps[i].name})
        for (let i = 0; i < 3; i++) {
            let user = await User.findOne({username: seedUsers[i].username})
            let comment = await Comment.create(seedComments[i]);
            console.log("Comment created")

            author = {
                id: user._id,
                username: user.username
            }
            comment.author = author;
            comment.save();
            console.log("Author pushed to comment");

            camp.comments.push(comment);
            user.comments.push(comment);
            camp.save();
            user.save();
            console.log("Comment pushed to camp & user")
        }
    }
}


var seedDB = async function(){
    try{
        console.log("====================");
        await deleteAll();
        console.log("====================");
        await createCampUser();
        console.log("====================");
        await createComments();
        console.log("====================");

        // Auto Sign In
        me = {
            email: "mag@gmail.com",
            username: "Malcolm",
            password: "a"
        }
        await User.register({email: me.email, username: me.username}, me.password);

    }
    catch (err){
        console.log(err);
    }
}

// var seedDBOwn = function(){
//     // Delete Campgrounds
//     Campground.deleteMany({})
//     .then((resp) => {
//         if(resp.ok === 0) return console.log(resp)
//         console.log("Deleted Database")
//         // resp is obj telling how many deleted
//     })
//     .then((err) => {
//         if(err) return console.log(err)
//         // Create camps
//         return Campground.create(seedCamps, function(err, resp){
//             if (err) return console.log(err)
//             console.log("Populated Database")
//             // resp is saved data
//         })
//     })
//     .then((err) => {
//         if(err) return console.log(err)
//     })
//     console.log("seedDB")
// }

module.exports = seedDB;