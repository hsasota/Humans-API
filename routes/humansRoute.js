var express = require('express');
var app = express.Router();
var mongoose = require('mongoose');
var Human = require('../models/Humans.js');
var validator = require('express-validator/check');
const expressValidator = require('express-validator');

app.use(expressValidator({
    customValidators: {
      isEmailAvailable(email) {
        return new Promise((resolve, reject) => {
          Human.findOne({ email: email }, (err, email) => {
            if (err) throw err;
            if(email == null) {
              resolve();
            } else {
              reject();
            }
          });
        });
      },
      noId(id) {
        return new Promise((resolve, reject) => {
          Human.findById(id, (err, human) => {
            if (err) throw err;
            if(human == null) {
              resolve();
            } else {
              reject();
            }
          });
        });
      }
    }
  })
);

app.get('/try', (req, res, next) => {
  Human.find((err, humans) => {
    if (err) return next(err);
    res.json(humans);
  });
});

/* Create a human document */
app.post('/human', (req, res, next) => {
  const email = req.body.email;
  const name = req.body.name;

  req.checkBody({
    'email': {
        notEmpty: true,
        errorMessage: 'Email is required',
        isEmail: {
          errorMessage: 'Invalid Email Address'
        },
        isEmailAvailable: {
          errorMessage: 'Email Address is already in use'
        }
    },
    'name': {
        notEmpty: true,
        errorMessage: 'Name is required'
    }
  });
  req.asyncValidationErrors().then(() => {
    //no errors, create email
    const newHuman = new Human({
      name: name,
      email: email,
    });

    Human.create(newHuman, (err, human) => {
      res.status(201).send({
        description: 'Document Created'
      })
      // console.log("New email:", newHuman);
    });
  }).catch((errors) => {

      if(errors) {
          return res.status(400).json({
              success: false,
              description: 'Input Error',
              errors: errors
          });
      };
  });
});

/* Retrieved human collection */
app.get('/humans', (req, res, next) => {
  Human.find((err, humans) => {
    if (err) return next(err);
    return res.status(200).send({ 
      description: 'Collection Retrieved'
    });
    res.json(humans);
  });
});

/* Retrieved human document */
app.get('/human/:id', [
  validator.param('id').isMongoId().trim(),
], (req, res, next) => {
     var errors = validator.validationResult(req);
        if ( !errors.isEmpty() ) {
            return res.status(404).send({ 
              description: 'Document Not Found'
            });
        } Human.findById(req.params.id, (err, human) => {
            if (human == null) {
                return res.status(404).send({ 
                  description: 'Document Not Found'
                });
            }
            return res.status(200).send({ 
              description: 'Document Retrieved'
            });
            res.json(human);
        });
});

/* Update a human document */
app.put('/human/:id', [
  validator.param('id').isMongoId().trim(),
], (req, res, next) => {
      var errors = validator.validationResult(req);
        if ( !errors.isEmpty() ) {
            return res.status(404).send({ 
              description: 'Document Not Found'
            });
      }
      const email = req.body.email;
      const name = req.body.name;
      
      req.checkBody({
        'email': {
            notEmpty: true,
            errorMessage: 'Email is required',
            isEmail: {
              errorMessage: 'Invalid Email Address'
            },
            isEmailAvailable: {
              errorMessage: 'Email Address is already in use'
            }
        },
        'name': {
            notEmpty: true,
            errorMessage: 'Name is required'
        }
      });
      req.asyncValidationErrors().then(() => {
           Human.findByIdAndUpdate(req.params.id, req.body, (err, human) => {
              if (human == null) {
                return res.status(404).send({ 
                  description: 'Document Not Found'
                });
              }
              return res.status(200).send({
                description: 'Document Updated'
              });
              res.json(human);
          });
      }).catch((errors) => {

      if(errors) {
          return res.status(400).json({
              success: false,
              description: 'Input Error',
              errors: errors
          });
      };
  });
});

/* Delete a human document */
app.delete('/human/:id', [
  validator.param('id').isMongoId().trim(),
], (req, res, next) => {
      var errors = validator.validationResult(req);
        if ( !errors.isEmpty() ) {
            return res.status(404).send({ 
              description: 'Document Not Found'
            });
        } Human.findByIdAndRemove(req.params.id, req.body, (err, human) => {
            if (human == null) {
              return res.status(404).send({ 
                description: 'Document Not Found'
              });
            }
            return res.status(200).send({ 
              description: 'Document Deleted'
            });
            res.json(human);
        });
});

module.exports = app;