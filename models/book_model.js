const mongoose = require('mongoose')

const Book = mongoose.model('books',{
    author: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    purchase_link: {
        type: String,
        required: true
    },
    abstract: {
        type: String,
        required: true
    },
    image_url: {
        type: String,
        required: true
    },
    price:{
        type: String,
        required: true
    },
    author_bio:{
        type: String,
        required: true
    },
    details:{
        total_pages:{
            type: Number,
            required: true
        },
        age_range:{
            type: String,
            required: true
        },
        format:{
            type: String,
            required: true
        },
        isbn:{
            type: String,
            required: true
        },
        publication_date:{
            type: String,
            required: true
        },
        publisher:{
            type: String,
            required: true
        }
    }
})

module.exports = Book