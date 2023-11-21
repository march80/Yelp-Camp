const mongoose = require('mongoose');
const db = mongoose.connection;
const Campground = require('../models/campground.js')
const cities = require('./cities.js')
const {places, descriptors} = require('./seedHelpers.js');
const campground = require('../models/campground.js');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
.then(() => {
    console.log("db connected")
})
.catch(err => {
    console.log("Oh No Error")
    console.log(err)
})

const sample =(array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i =0; i < 500; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 10;
        const camp = new Campground({
            author: '65528d2950bac5af2ffa8db7',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore voluptate voluptatibus ullam? Quisquam consequatur rem reiciendis beatae inventore aperiam labore 
            fugiat ipsum totam. Deleniti maxime architecto, eligendi deserunt amet accusantium.`,
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dwcbi82ts/image/upload/v1700077483/YelpCamp/weo9fkhnxiwqqxfxiulq.jpg',
                  filename: 'YelpCamp/weo9fkhnxiwqqxfxiulq'
                  
                },
                {
                  url: 'https://res.cloudinary.com/dwcbi82ts/image/upload/v1700077483/YelpCamp/ewqyae3wn0buwrst8ejv.jpg',
                  filename: 'YelpCamp/ewqyae3wn0buwrst8ejv'
                }
              ] 
        })
        await camp.save();
        
    }
}

seedDB().then(() => {
    db.close()
})