//todo move the content of the routes to this file, as the routes is but a connection between the models and the controllers.
// Use this website for referense https://medium.com/@gecno/node-js-express-mongodb-and-mongoose-understanding-the-mvc-model-678952631ea3
// difference between the routes and the controllers is that the controllers is the logistics that occur when calling the api.
// 
import Entertainment from "../models/entertainment.js";
import Genres from "../models/genres.js";
import {STATUS_CODES, MODEL_TYPES} from '../config/constants.js';

export const healthCheck = async(req, res) => {
    res.status(STATUS_CODES.SUCCESS).json({status: 'ok'})
}

export const findMoviesOnFilter = async(req , res) => {
    try{
        const filter = {};
        // we will not add the filter unless it exist. This is because setting it to null would still count as a value and would be searched for.
        if(req.body.title) filter.title = req.body.title;
        if(req.body.entertainmentType) filter.entertainmentType = req.body.entertainmentType;
        if(req.body.releaseYear) filter.releaseYear = req.body.releaseYear;



        if (req.body.genre?.length > 0) {
            const genres = await Genres.find( { name: { $in: req.body.genre } } ).exec();
            filter.genre = { $all: genres.map(g => g._id) }; // We create and add $in operation as this will be included in the filter object
        };

        const entertainment = await Entertainment.find({filter})
            .limit(20)
            .sort(asc)
            .exec();    // this provides a higher level of error message descriptions.
        
        res.status(STATUS_CODES.SUCCESS).json(entertainment);
    }catch(err){
        res.status(STATUS_CODES.NOT_FOUND).json({error: err.message})
    };
}

// Create one controller that takes in a list of movies from such results as findmoviesOnFilter, 
// and then add another filter to this methord to se if any of them is avaiable in my region or platform
// even if the above option can do that, it will go faster if there is a dedicated controller that can skip the serching and just use the already existing finds.
/*
    Say that the user didn't search for region or platform originally, byt they get a lot of movies and now they wanna verify if any of them is avaiable in here region
    or through one of her platforms. In this case, we could search through filters again, or just use the already found movies. So this is to allow for getting the nessusary data
    without doing a new search.
*/

export default { healthCheck, findMoviesOnFilter };