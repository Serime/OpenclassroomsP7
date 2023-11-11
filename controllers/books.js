const Book = require('../models/Book');
const fs = require('fs');

exports.getBooks = (request, response, next) => {
    Book.find()
        .then(books => response.status(200).json(books))
        .catch(error => response.status(400).json({ error }));
};

exports.getIdBook = (request, response, next) => {
    Book.findOne({ _id: request.params.id })
        .then(book => response.status(200).json(book))
        .catch(error => response.status(404).json({ error }));
};

exports.getThreeBooksBestrating = (request, response, next) => {
    Book.find()
        .sort({ averageRating: -1 })
        .limit(3)
        .then(books => response.status(200).json(books))
        .catch(error => response.status(400).json({ error }));
};

exports.postBook = (request, response, next) => { 
    const bookObject = JSON.parse(request.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: request.auth.userId,
        imageUrl: `${request.protocol}://${request.get('host')}/images/${request.file.filename}`
    });

    book.save()
        .then(() => { response.status(201).json({message: 'Book enregistré'})})
        .catch(error => { response.status(400).json( { error })})
 };

exports.postBookRating = (request, response, next) => {
    Book.findOne({ _id: request.params.id })
        .then(book => {
            let userAlreadyRatingThisBook = false;
            book.ratings.map(rating => {
                if (request.auth.userId === rating.userId) {
                    userAlreadyRatingThisBook = true;                 
                }
            })

            if (userAlreadyRatingThisBook) {
                response.status(400).json({ message: 'Book déjà noté' })         
            } else {
                book.ratings.push({
                    'userId': request.auth.userId,
                    'grade': request.body.rating
                });
    
                let sumRating = 0;
                book.ratings.map(rating => sumRating += rating.grade);
                book.averageRating = sumRating / book.ratings.length;
    
                Book.updateOne({ _id: request.params.id }, book)
                    .then((book) => () => { response.status(200).json(book) })
                    .catch((error) => { response.status(401).json({ error }) });
            }           
        })
        .catch((error) => { response.status(401).json({ error}) });
};

exports.putBook = (request, response, next) => {
    const bookObject = request.file ? {
        ...JSON.parse(request.body.book),
        imageUrl: `${request.protocol}://${request.get('host')}/images/${request.file.filename}`
    } : { ...request.body };

    delete bookObject._userId;
    Book.findOne({_id: request.params.id})
        .then((book) => {
            if (book.userId != request.auth.userId) {
                response.status(403).json({ message : 'unauthorized request'});
            } else {    
                Book.updateOne({ _id: request.params.id}, { ...bookObject, _id: request.params.id})
                .then(() => {
                    if (request.file) {
                        const filename = book.imageUrl.split('/images/')[1];
                        fs.unlink(`images/${filename}`, (error) => {
                            if (error) {
                                console.error(error);
                            }
                        });
                    }
                    response.status(200).json({message : 'Book modifié'})
                })
                .catch(error => response.status(400).json({ error }));
            }
        })
        .catch((error) => {
            response.status(400).json({ error });
        });
                        
};

exports.deleteBook = (request, response, next) => {
    Book.findOne({ _id: request.params.id})
        .then(book => {
            if (book.userId != request.auth.userId) {
                response.status(401).json({message: 'Not authorized'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: request.params.id})
                    .then(() => { response.status(200).json({message: 'Book supprimé'})})
                    .catch(error => response.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            response.status(500).json({ error });
        });
};
