import axios from "axios";

axios.get('htp://localhost:5000/api/users')
    .then(Response => {
        console.log('Got data:', Response.data);
    })

    .catch(error => {
        console.log('Something went wrong:', error);
    });