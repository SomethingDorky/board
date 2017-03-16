// Variable Declarations
var expressSanitizer    = require("express-sanitizer"),
    methodOverride      = require("method-override"),
    bodyParser          = require("body-parser"),
    mongoose            = require("mongoose"),
    express             = require("express"),
    app                 = express();
    

// Connect Mongoose to MongoDB    
var url = process.env.DATABASEURL || "mongodb://localhost/dorky_board";
mongoose.connect(url);

// App Configuration
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

// Mongoose Model Config
var postSchema = new mongoose.Schema({
    title: String,
    image_link: 
        {
            type: String, 
            default: "https://somethingdorky.com/images/dorky_thumb.png"
        },
    body: String,
    created: 
        {
            type: Date, 
            default: Date.now
        }
});

var Post = mongoose.model("Post", postSchema);

// Test Post Creation -- Leave Commented Out!!
//for(var p = 1; p <= 5; p++) {
//    Post.create(
//    {
//        title: "Test Post " + p,
//        image_link: "https://somethingdorky.com/thing/images/dorkypics/dork" + p + ".jpg",
//        body: "This is test post " + p + ". It's pretty dorky."
//    },
//    function(err, post) {
//        if(err) {
//            console.log(err);
//        } else {
//            console.log("New Post: ");
//            console.log(post);
//        }
//    });
//}

// RESTful Routes

// Default traffic to posts index
app.get("/", function(req, res) {
    res.redirect("/posts");
});

// INDEX -- Show all board posts
app.get("/posts", function(req, res) {
    Post.find({}, function(err, posts) {
        if(err) {
            console.log("SOMETHING BROKE!");
            console.log(err);
        } else {
            res.render("posts", {posts: posts});
        }
    });
});

// NEW -- Show the new post form
app.get("/posts/new", function(req, res) {
    res.render("new");
});

// CREATE -- Add a new post
app.post("/posts", function(req, res) {
    req.body.post.body = req.sanitize(req.body.post.body);
    
    Post.create(req.body.post, function(err, post) {
        if(err) {
            console.log(err);
            res.render("new");
        } else {
            res.redirect("/posts");
        }
    });
});

// SHOW -- Show a single post
app.get("/posts/:id", function(req, res) {
    Post.findById(req.params.id, function(err, post) {
       if(err) {
           console.log(err);
           res.redirect("/posts");
       } else {
           res.render("show", {post: post});
       }
    });
});

// EDIT -- Show edit form for a single post
app.get("/posts/:id/edit", function(req, res) {
    Post.findById(req.params.id, function(err, post) {
       if(err) {
           console.log(err);
           res.redirect("/posts");
       } else {
           res.render("edit", {post: post});
       }
    });
});

// UPDATE -- Update a single post
app.put("/posts/:id", function(req, res) {
    req.body.post.body = req.sanitize(req.body.post.body);
    
    Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, post) {
        if(err) {
            console.log(err);
            res.redirect("/posts/");
       } else {
            res.redirect("/posts/" + req.params.id);
       }
    });
});

// DELETE -- Delete a single post
app.delete("/posts/:id", function(req, res) {
    Post.findByIdAndRemove(req.params.id, function(err) {
       if(err) {
           console.log(err);
           res.redirect("/posts");
       } else {
           res.redirect("/posts");
       }
    });
});

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Board is running...");
});
    