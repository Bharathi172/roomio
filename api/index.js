const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/Users.js');
const Place = require('./models/Place.js')
const Booking = require('./models/Booking.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');
const app = express();
const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "dfbdgbdthtrhde4363246"

// Middleware
app.use(express.json());
app.use('/uploads',express.static(__dirname+'/uploads'))
app.use(cors({
    credentials: true,
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Allow both origins
}));


app.use(cookieParser());


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));


function getUserDataFromReq(req){
        return new Promise ((resolve,reject) =>{
            jwt.verify(req.cookies.token,jwtSecret,{},async(err,userData) =>{
                if (err) throw err;
                resolve(userData);
            });
        });
        
    }
// Test Route
app.get('/test', (req, res) => {
    res.json('test ok');
});

// Register Route
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userDoc = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt),
        });
        res.json(userDoc);
    } catch (e) {
        res.status(422).json(e);
    }
});

// Login Route
// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const userDoc = await User.findOne({email});
    if(userDoc){
        const passOk = bcrypt.compareSync(password, userDoc.password)

        if(passOk){
            jwt.sign({
                email:userDoc.email,
                id: userDoc._id,
                name:userDoc.name
            },  jwtSecret, {}, (err, token) =>{

                if(err) throw err;
                res.cookie('token', token, {
                    sameSite: 'none',
                    secure: true
                }).json(userDoc);
            });
       
    }else{
        res.status(422).json('pass not ok');
    }
}else{
        res.json('not found')
    }

});

app.get('/profile',(req,res)=>{
    const {token} = req.cookies
    if(token){
        jwt.verify(token,jwtSecret,{},async(err,userData) =>{
            if(err) throw err;
           const {name,email,_id} = await User.findById(userData.id);
            res.json({name,email,_id});
        })
    }else{
        res.json(null);
    }
})




app.post('/logout',(req,res)=>{
res.cookie('token','').json(true);
});

console.log({__dirname});

app.post('/upload-by-link',async (req,res) => {
    const {link} = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    await imageDownloader.image({
        url :link,
        dest: __dirname + '/uploads/' +newName,
    });
    res.json(newName);
})

const photosMiddleware = multer({dest:'uploads/'});
app.post('/upload',photosMiddleware.array('photos',100),(req,res)=>{
    const uploadedFiles = [];
    for (let i = 0 ; i < req.files.length; i++){
        const {path,originalname} = req.files[i];
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = path + '.' + ext;
        fs.renameSync(path,newPath);
        uploadedFiles.push(newPath.replace('uploads',''));
    } 
    res.json(uploadedFiles);
});




app.post('/places', (req, res) => {
    const{token} = req.cookies
    const{title,address,addedPhotos,description,price,perks,extraInfo,checkIn,checkOut,maxGuests} = req.body;
    jwt.verify(token,jwtSecret,{},async(err,userData) =>{
        if(err) throw err;
       const placeDoc = await Place.create({
            owner:userData.id,price,
            title,address,photos:addedPhotos,description,perks,extraInfo,checkIn,checkOut,maxGuests
           })
           res.json(placeDoc);
    })
   
});

app.get('/user-places',(req,res) =>{
const {token} = req.cookies;
jwt.verify(token,jwtSecret,{},async(err,userData) =>{
    const {id} = userData;
    res.json( await Place.find({owner:id}) )
});
});

app.get('/places/:id', async (req,res) => {
    const {id} = req.params;
    res.json(await Place.findById(id));
});

app.put('/places', async(req,res) => {
    
    const{token} = req.cookies
    const{id,title,address,addedPhotos,description,perks,extraInfo,checkIn,checkOut,maxGuests,price} = req.body;
    
    jwt.verify(token,jwtSecret,{},async(err,userData) =>{
        if (err) throw err;
        const placeDoc = await Place.findById(id);
        if(userData.id === placeDoc.owner.toString()){
            placeDoc.set({
            title,address,photos:addedPhotos,description,perks,extraInfo,checkIn,checkOut,maxGuests,price,
            });
            await placeDoc.save();
            res.json('ok');
        }
    });

});


app.get('/places',async (req,res) =>{
    res.json(await Place.find());
});

app.post('/bookings',async(req,res)=>{
const userData = await getUserDataFromReq(req);
const {place,checkIn,checkOut,numberOfGuests,name,phone,price} = req.body;
Booking.create({
    place,checkIn,checkOut,numberOfGuests,name,phone,price,
    user:userData.id,
}).then((doc) =>{
    res.json(doc);
}).catch((err) => {
    throw err;
});

});





app.get('/bookings',async(req,res)=>{
  const userData=  await getUserDataFromReq(req);
res.json(await Booking.find({user:userData.id}).populate('place'))

});

// Start the Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
