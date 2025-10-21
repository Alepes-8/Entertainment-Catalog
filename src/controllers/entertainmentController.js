//todo move the content of the routes to this file, as the routes is but a connection between the models and the controllers.
// Use this website for referense https://medium.com/@gecno/node-js-express-mongodb-and-mongoose-understanding-the-mvc-model-678952631ea3
// difference between the routes and the controllers is that the controllers is the logistics that occur when calling the api.
// 
import Entertainment from "../models/entertainment.js";
import Platforms from "../models/platforms.js"
import Genres from "../models/genres.js";
import Avalability from "../models/avalability.js"
import ApiCalled from "../models/apiCalled.js";
import {STATUS_CODES, API_WAIT_TIMES, APIS_CALLS} from '../config/constants.js';
import { WATCHMODE_API_KEY } from '../config/config.js';
import apiCalled from "../models/apiCalled.js";

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
            filter.genre = { $in: genres.map(g => g._id) }; // We create and add $in operation as this will be included in the filter object
        };

        const entertainment = await Entertainment.find({filter})
            .limit(30)  // Set a limit, otherwise the avalability filtering will be exessive
            .sort(asc)
            .exec();    // this provides a higher level of error message descriptions.
        
        // Get the avalability status of each movie found within the filter.
        const availabilityFilter = {}
        if(req.body.region) availabilityFilter.regions = req.body.region;

        if(req.body.platform?.length > 0){
            const platforms = await Platforms.find({ name: {$in : requestAnimationFrame.body.platform}}).exec();
            availabilityFilter.platform = {$in : platforms.map(p => p._id)};
        }

        const avalabilities = await Avalability.find(availabilityFilter);
        
        res.status(STATUS_CODES.SUCCESS).json([entertainment, avalabilities]);
    }catch(err){
        res.status(STATUS_CODES.NOT_FOUND).json({error: err.message})
    };
}

export const uppdateEntertainemntData = async(req, res) => {
    try{
        // Check the database when the last api call was made for this platform
        console.log(APIS_CALLS.WATCHMODE_PLATFORM_COLLECTION_UPDATE + `_${req.param.platform}`)
        const latestUpdate = await ApiCalled.findOne({apiName: APIS_CALLS.WATCHMODE_PLATFORM_COLLECTION_UPDATE + `_${req.param.platform}`})
        const currentTime = new Date();

        if(currentTime - latestUpdate.lastCalled < API_WAIT_TIMES.WATCHMODE_PLATFORM_COLLECTION_UPDATE){
            res.status(STATUS_CODES.API_WAIT_CALL_TIME).json({message: "The api call for watchmode platforms data was done resently."});
            return;
        }

        // Find the source ID for the platform that is desire to be updated.
        console.log(req.param);
        const platformData = await Platforms.find({name : req.param.platform});

        console.log(platformData);

        if((await platformData).length === 0){ //todo verify that this is correct I believe the platform.length may check incorrectly.
            res.status(STATUS_CODES.NOT_FOUND).json({message: "Platform not found"})
        }

        // Set your API key here
        /*
        const apiKey = WATCHMODE_API_KEY;
        const sourceIds = platformData.watchModeSourceId;
        const url = `https://api.watchmode.com/v1/list-titles/?apiKey=${apiKey}&source_ids=${sourceIds}&regions=SE`;

        const response = await fetch(url);
        const jsonResponse = await response.json();
        console.log(json);
        */
        /*//get the genres from the response and upsert them into the genres collection
        const combinedGenres = [...new Set(jsonResponse.flatMap(p => p.genres))];
        
        const filteredGenres = await json.map(genre => ({
            updateOne: {
                filter: {name: genre},
                update: { $set: {name: genre} },
                upsert: true
            }
        }));

        await Genres.bulkWrite(filteredGenres);
        const dbGenres = await Genres.find({name: {$in: combinedGenres}});*/
        /*
        // do something with myJson
        const filteredData = await jsonResponse.map(entertainment => ({
            updateOne:{
                filter: {
                    {watchMongodEntertainemntID: entertainment.id}//todo add form of id 
                },
            
                update: {
                    $set: {
                        title: entertainment.title,
                        entertainmentType: entertainment.type,
                        // genre: entertainment.genre.map(g => dbGenres.find(dbg => dbg.name === g)?._id), //TODO no current implementation of genres in the watchmode api response
                        releaseYear: entertainment.year , 
                        watchMongodEntertainemntID, entertainment.id
                    }
                },
                upsert: true    
            }
        }));

*/
        // Get the data from the api

        // update and enter new data into the server based on the data from the api
        res.status(STATUS_CODES.SUCCESS).json({message: "Update function called"})
    }catch(err){
        res.status(STATUS_CODES.SERVER_ERROR).json({error: err.message})
    }
}

export const getSourceIdsFromWatchmodeApi = async(req, res) => {
    try{
        const lastCalledEntry = await ApiCalled.findOne({apiName: APIS_CALLS.WATCHMODE_SOURCE_UPDATE});
        const currentTime = new Date();

        if(currentTime - lastCalledEntry.lastCalled < API_WAIT_TIMES.WATCHMODE_SOURCE_UPDATE){
            res.status(STATUS_CODES.API_WAIT_CALL_TIME).json({message: "The api call for watchmode sources was done resently."});
            return;
        };

        // Set your API key here
        const apiKey = WATCHMODE_API_KEY;

        const url = `https://api.watchmode.com/v1/sources/?apiKey=${apiKey}`;

        const response = await fetch(url);
        const jsonBody = await response.json();

        // Process and upsert the data into the Platforms collection
        const filteredData = await jsonBody.map(item => ({
            updateOne: {
                filter: {
                     $or: [
                        { watchModeSourceId: item.id }, // match existing by ID
                        { name: item.name, watchModeSourceId: {$ne: item.id}}             // or match existing by name
                    ]
                },
                update: {
                    $set:  {
                        name: item.name, 
                        watchModeSourceId: item.id
                    }
                },
                upsert: true
            }
        }));

        await Platforms.bulkWrite(filteredData);

        await ApiCalled.updateOne(
            {apiName: APIS_CALLS.WATCHMODE_SOURCE_UPDATE}, // Filter to find the name
            {$set: {    // If the name is found, update the last called time
                lastCalled: currentTime
            }},
            { upsert: true } // If the name isn't found, upsert tells updateOne to create new entry.
        );

        const dbPlatformsData = await Platforms.find();
        res.status(STATUS_CODES.SUCCESS).json(dbPlatformsData);
    }catch(err){
        res.status(STATUS_CODES.NOT_FOUND).json({error: err.message});
    }
}

export default { 
    healthCheck, 
    findMoviesOnFilter, 
    uppdateEntertainemntData, 
    getSourceIdsFromWatchmodeApi
};