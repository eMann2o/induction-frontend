import axios from "axios";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.example' });

axios.get(`${process.env.VITE_API_BASE_URL}/api/users`)
    .then(Response => {
        console.log('Got data:', Response.data);
    })
    .catch(err => {
        console.log('Something went wrong:', err);
    });