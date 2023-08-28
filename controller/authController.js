const express = require('express');
const knex = require('knex')(require('../knexfile'));

const register = async (req, res) => {
    try {
        /*
        firstname
        lastname
        email
        phone_number
        dob
        url - default
        username
        password
        confirm password
        bio - optional
        
        */
    } catch (err) {
        
    }
}
const login = async (req, res) => {
    try {
        if (!req.body.text) return res.status(400).json({ message: "Please send something!!" });
        const user = await knex('user')
            .where({ username: req.body.text })
            .orWhere({email: req.body.text})
            .first();
        
        if (user) {
            return res.status(200).json({ message: "Customer has been found" });
        }
        return res.status(404).json({ message: `No customer with the login detail:  ${req.body.text} ` })    
    } catch (err) {
        res.status(500).json({ message: `We couldn't even connect to DB: ${err}` });
    }
}

module.exports = {
    login
}