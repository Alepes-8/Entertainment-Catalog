//todo move the content of the routes to this file, as the routes is but a connection between the models and the controllers.
// Use this website for referense https://medium.com/@gecno/node-js-express-mongodb-and-mongoose-understanding-the-mvc-model-678952631ea3
// difference between the routes and the controllers is that the controllers is the logistics that occur when calling the api.
// 
import Entertainment from "../models/entertainment.js";
import Platforms from "../models/platforms.js"
import Genres from "../models/genres.js";
import Avalability from "../models/avalability.js"
import ApiCalled from "../models/apiCalled.js";
import {STATUS_CODES, API_WAIT_TIMES, APIS_CALLS, DEFUALT_VALUES} from '../config/constants.js';
import { WATCHMODE_API_KEY } from '../config/config.js';
import apiCalled from "../models/apiCalled.js";
import entertainment from "../models/entertainment.js";

export const healthCheck = async(req, res) => {
    res.status(STATUS_CODES.SUCCESS).json({status: 'ok'})
}

export const findMoviesOnFilter = async(req , res) => {
    try{
        const filter = {};
        // we will not add the filter unless it exist. This is because setting it to null would still count as a value and would be searched for.
        if(req.query.title) filter.title = req.query.title;
        if(req.query.type) filter.entertainmentType = req.query.type;
        if(req.query.releaseYear) filter.releaseYear = req.query.releaseYear;
        
        /*if (req.query.genre?.length > 0) {
            const genres = await Genres.find( { name: { $in: req.query.genre } } ).exec();
            filter.genre = { $in: genres.map(g => g._id) }; // We create and add $in operation as this will be included in the filter object
        };*/
        console.log("Filter being used: ", filter);
        const entertainment = await Entertainment.find(filter)
            .limit(30)  // Set a limit, otherwise the avalability filtering will be exessive
            //.sort(asc)
            .lean()
            .exec();    // this provides a higher level of error message descriptions.
        
        console.log("Entertainment found: ", entertainment);
        // Get the avalability status of each movie found within the filter.
        const availabilityFilter = {}
        if(req.query.region) availabilityFilter.regions = req.query.region;

        if(req.query.platform?.length > 0){
            const platforms = await Platforms.find({ name: {$in : requestAnimationFrame.body.platform}}).exec();
            availabilityFilter.platform = {$in : platforms.map(p => p._id)};
        }

        availabilityFilter.entertainmentId = {$in: entertainment.map(e => e._id)};

        const avalabilities = await Avalability.find(availabilityFilter);
        
        res.status(STATUS_CODES.SUCCESS).json([entertainment, avalabilities]);
    }catch(err){
        res.status(STATUS_CODES.NOT_FOUND).json({error: err.message})
    };
}

export const uppdateEntertainemntData = async(req, res) => {
    try{
        // Check the database when the last api call was made for this platform
        const currentTime = new Date();
        const latestUpdate = await ApiCalled.findOne({
            apiName: APIS_CALLS.WATCHMODE_PLATFORM_REGION_UPDATE + `_${req.query.platform}_${req.query.region}`
        }).lean();

        const lastCall = latestUpdate?.lastCalled || 0; //Catch If the region and platform combination hasn't been made before

        if(currentTime -  new Date(lastCall) < API_WAIT_TIMES.WATCHMODE_PLATFORM_COLLECTION_UPDATE){
            res.status(STATUS_CODES.API_WAIT_CALL_TIME).json({message: "The api call for watchmode platforms data was done resently."});
            return;
        }

        // Find the source ID for the platform that is desire to be updated.
        const platformData = await Platforms.findOne({name: {$in: req.query.platform.toLowerCase()}}).lean();
        if((await platformData).length === 0){
            res.status(STATUS_CODES.NOT_FOUND).json({message: "Platform not found"})
            return;
        };
        
        // Set your API key here
        const apiKey = WATCHMODE_API_KEY;
        const sourceIds = platformData?.watchModePlatformId;
        const region = req.query.region || DEFUALT_VALUES.REGION;
        
        const url = `https://api.watchmode.com/v1/list-titles/?apiKey=${apiKey}&source_ids=${sourceIds}&regions=${region}`; // TODO add different regions, so repeate for multiple regions

        const response = await fetch(url);
        const jsonResponse = await response.json();
        // do something with myJson
        const filteredData = await jsonResponse.titles.map(entertainment => ({
            updateOne:{
                filter: { 
                    watchMongodEntertainemntID: entertainment.id//todo add form of id 
                },
                update: {
                    $set: {
                        title: entertainment.title.toLowerCase(),
                        entertainmentType: entertainment.type.toLowerCase(),
                        releaseYear: entertainment.year, 
                        watchMongodEntertainemntID: entertainment.id
                    }
                },
                upsert: true    
            }
        }));

        await Entertainment.bulkWrite(filteredData)
        const createdEntertainmentData = await Entertainment.find({
            watchMongodEntertainemntID: { $in: jsonResponse.titles.map(entertainment => entertainment.id) }
        }).lean();

        // Get get the ids for the specific filttered data above.
        const filteredAvailability = await createdEntertainmentData.map(entertainment => ({
            updateOne: {
                filter: {
                    $and: [
                        {entertainmentId: entertainment._id},
                        {platformId: platformData._id},
                        {region: region}
                    ]
                },
                update: {
                    $set: {
                        entertainmentId: entertainment._id,
                        platformId: platformData._id,
                        region: region,
                        available: true
                    }
                },
                upsert: true
            }
        }))
        await Avalability.bulkWrite(filteredAvailability)

        await ApiCalled.updateOne(
            {apiName: APIS_CALLS.WATCHMODE_SOURCE_UPDATE}, // Filter to find the name
            {$set: {    // If the name is found, update the last called time
                lastCalled: currentTime
            }},
            { upsert: true } // If the name isn't found, upsert tells updateOne to create new entry.
        );
        res.status(STATUS_CODES.SUCCESS).json({message: "Entertainemnt data updated successfully. For @platform: " + req.query.platform + " and region: " + region});
    }catch(err){
        res.status(STATUS_CODES.SERVER_ERROR).json({error: err.message})
    }
}

export const getPlatformIdsFromWatchmodeApi = async(req, res) => {
    try{
        const currentTime = new Date();
        const lastCalledEntry = await ApiCalled.findOne({apiName: APIS_CALLS.WATCHMODE_SOURCE_UPDATE});
        
        const lastCall = lastCalledEntry?.lastCalled || 0; //Catch If the region and platform combination hasn't been made before

        if(currentTime -  new Date(lastCall) < API_WAIT_TIMES.WATCHMODE_SOURCE_UPDATE){
            res.status(STATUS_CODES.API_WAIT_CALL_TIME).json({message: "The api call for watchmode sources was done resently."});
            return;
        };

        // Set your API key here
        const apiKey = WATCHMODE_API_KEY;

        const url = `https://api.watchmode.com/v1/sources/?apiKey=${apiKey}`;
        
        const response = await fetch(url);
        const jsonBody = await response.json();

        // Process and upsert the data into the Platforms collection
        const filteredDatas = jsonBody.map(item => ({
            updateOne: {
                filter: {
                     $or: [
                        { watchModePlatformId: item.id }, // match existing by ID
                        { name: item.name.toLowerCase(), watchModePlatformId: {$ne: item.id}}             // or match existing by name
                    ]
                },
                update: {
                    $set:  {
                        name: item.name.toLowerCase(), 
                        watchModePlatformId: item.id
                    }
                },
                upsert: true
            }
        }));
        
        await Platforms.bulkWrite(filteredDatas);
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
    getPlatformIdsFromWatchmodeApi
};