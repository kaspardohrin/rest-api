const Contact = require('../models/contact.model.js');

exports.options = (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', ['Content-Type', 'text/html']);
    res.sendStatus(200);
}

exports.findAll = (req, res) => {
    console.log('findAll');
    if(req.accepts('json')) {
        Contact.find().then(contacts => {

            let startAt = 0;
            if(req.query.start) {
                startAt = req.query.start;
            }

            let loopedContacts = 0;
            let returnContacts = []
            contacts.forEach(function(element) {
                if(startAt > loopedContacts) {
                    loopedContacts++;
                    return;
                }
                let newContact = element.toJSON()
                newContact._links = {}
                newContact._links.self = { href: req.protocol + '://' + req.headers.host + '/contacts/' + newContact._id }
                newContact._links.collection = { href: req.protocol + '://' + req.headers.host + '/contacts/' }
                returnContacts.push(newContact)
            })

            res.header('Access-Control-Allow-Origin', '*').json({
                items: returnContacts,

                _links: {
                    self: { href: req.protocol + '://' + req.headers.host + req.originalUrl }
                },

                pagination: {
                    currentPage: 1,
                    currentItems: contacts.length,
                    totalPages: 1,
                    totalItems: contacts.length,
                    _links: {
                        first: {
                            page: 1,
                            href: req.protocol + '://' + req.headers.host + req.originalUrl
                        },
                        last: {
                            page: 1,
                            href: req.protocol + '://' + req.headers.host + req.originalUrl
                        },
                        previous: {
                            page: 1,
                            href: req.protocol + '://' + req.headers.host + req.originalUrl
                        },
                        next: {
                            page: 1,
                            href: req.protocol + '://' + req.headers.host + req.originalUrl
                        }
                    }
                }
            })
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving contacts."
            });
        });   
    } else {
        res.sendStatus(400);
    }
};

exports.findOne = (req, res) => {
    console.log('findOne');
    Contact.findById(req.params.contactId)
    .then(contact => {
        if(!contact) {
            return res.header('Access-Control-Allow-Origin', '*').status(404).send({
                message: "contact with id " + req.params.contactId + " doesn't exsist"
            });            
        } else {
            let rContact = contact.toJSON()
            rContact._links = {}
            rContact._links.self = { href: req.protocol + '://' + req.headers.host + '/contacts/' + rContact._id }
            rContact._links.collection = { href: req.protocol + '://' + req.headers.host + '/contacts/' }
            json(rContact);
        }

    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.header('Access-Control-Allow-Origin', '*').status(404).send({
                message: "contact not found with id " + req.params.contactId
            });                
        }
        return res.header('Access-Control-Allow-Origin', '*').status(500).send({
            message: "Error retrieving contact with id " + req.params.contactId
        });
    });
};

exports.create = (req, res) => {
    console.log('got into create..')
    if(!req.body.name) {
        return res.header('Access-Control-Allow-Origin', '*').status(400).send({
            message: "contact name can not be empty"
        });

    } else {
        console.log('..trying to create..');
        const contact = new Contact({
            name: req.body.name, 
            email: req.body.email,
            phone: req.body.phone
        });

        contact.save()
        .then(data => {
            res.header('Access-Control-Allow-Origin', '*').status(201).send(data);
            console.log('..created succesfully')
        }).catch(err => {
            res.header('Access-Control-Allow-Origin', '*').status(500).send({
                message: err.message || "Some error occurred while creating the contact."
            });
        });
    }
};

exports.update = (req, res) => {
    console.log('update');
    Contact.findById(req.params.contactId)
    .then(contact => {
        if(!contact) {
            return res.header('Access-Control-Allow-Origin', '*').status(404).send({
                message: "contact not found with id " + req.params.contactId
            });            
        }
        if(!req.body.name || !req.body.email || !req.body.phone) {
            return res.header('Access-Control-Allow-Origin', '*').status(400).send('Must fill in all contact fields');
        } else {
            contact.name = req.body.name;
            contact.email = req.body.email;
            contact.phone = req.body.phone;
            contact.save();
            let rContact = contact.toJSON()
            res.header('Access-Control-Allow-Origin', '*').json(rContact);
        }

    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.header('Access-Control-Allow-Origin', '*').status(404).send({
                message: "contact not found with id " + req.params.contactId
            });                
        }
        return res.header('Access-Control-Allow-Origin', '*').status(500).send({
            message: "Error retrieving contact with id " + req.params.contactId
        });
    });
};

exports.delete = (req, res) => {
    console.log('delete');
    Contact.findByIdAndRemove(req.params.contactId)
    .then(contact => {
        if(!contact) {
            return res.header('Access-Control-Allow-Origin', '*').status(404).send({
                message: "contact not found with id " + req.params.contactId
            });
        }
        res.header('Access-Control-Allow-Origin', '*').status(204).send({message: "contact deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.header('Access-Control-Allow-Origin', '*').status(404).send({
                message: "contact not found with id " + req.params.contactId
            });                
        }
        return res.header('Access-Control-Allow-Origin', '*').status(500).send({
            message: "Could not delete contact with id " + req.params.contactId
        });
    });
};