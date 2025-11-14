//todo move the content of the routes to this file, as the routes is but a connection between the models and the controllers.
// Use this website for referense https://medium.com/@gecno/node-js-express-mongodb-and-mongoose-understanding-the-mvc-model-678952631ea3
// difference between the routes and the controllers is that the controllers is the logistics that occur when calling the api.
// 
import Entertainment from "../models/entertainment.js";
import Platforms from "../models/platforms.js"
import Genres from "../models/genres.js";
import Avalability from "../models/avalability.js"
import ApiCalled from "../models/apiCalled.js";
import {STATUS_CODES, API_WAIT_TIMES, APIS_CALLS, DEFUALT_VALUES, STATUS_MESSAGES} from '../config/constants.js';
import { WATCHMODE_API_KEY } from '../config/config.js';
import apiCalled from "../models/apiCalled.js";
import entertainment from "../models/entertainment.js";

export const healthCheck = async(req, res) => {
    res.status(STATUS_CODES.SUCCESS).json({status: STATUS_MESSAGES.OK})
}

export const findMoviesOnFilter = async(req , res) => {
    try{
        const filter = {};
        // we will not add the filter unless it exist. This is because setting it to null would still count as a value and would be searched for.
        if(req.query.title) filter.title = req.query.title;
        if(req.query.type) filter.entertainmentType = req.query.type;
        if(req.query.releaseYear) filter.releaseYear = Number(req.query.releaseYear);
        
        /*if (req.query.genre?.length > 0) {
            const genres = await Genres.find( { name: { $in: req.query.genre } } ).exec();
            filter.genre = { $in: genres.map(g => g._id) }; // We create and add $in operation as this will be included in the filter object
        };*/
        const entertainment = await Entertainment.find(filter)
            .limit(30)  // Set a limit, otherwise the avalability filtering will be exessive
            //.sort(asc)
            .lean()
            .exec();    // this provides a higher level of error message descriptions.
        
        // Get the avalability status of each movie found within the filter.
        const availabilityFilter = {}
        if(req.query.region) availabilityFilter.region = req.query.region;
        
        //Match the platform ids to the platform names and change id to platform name
        // Use the input platforms used for the search action, to add a filter to only find those that match given platforms.
        if(req.query.platform?.length > 0){
            const platforms = await Platforms.find({ name: {$in : requestAnimationFrame.body.platform}}).exec();
            availabilityFilter.platform = {$in : platforms.map(p => p._id)};
        }

        //We could find more availablefilter data than we need, so this filters so we only find those that share entertainment ids with the previously found once
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
        const filter = {};

        if(req.query.platform) {
            filter.platform = req.query.platform;
        }else {
            filter.platform = DEFUALT_VALUES.PLATFORM;
        }
        if(req.query.region){
            filter.region = req.query.region;
        }else {
            filter.region = DEFUALT_VALUES.REGION;
        }

        const latestUpdate = await ApiCalled.findOne({
            apiName: APIS_CALLS.WATCHMODE_PLATFORM_REGION_UPDATE + `_${filter.platform}_${filter.region}`
        }).lean();


        const lastCall = latestUpdate?.lastCalled || 0; //Catch If the region and platform combination hasn't been made before

        if(currentTime -  new Date(lastCall) < API_WAIT_TIMES.WATCHMODE_PLATFORM_COLLECTION_UPDATE){
            res.status(STATUS_CODES.API_WAIT_CALL_TIME).json({message: STATUS_MESSAGES.ERROR_ENTERTAINMENT_UPDATE_RECENTLY_CALLED});
            return;
        }

        // Find the source ID for the platform that is desire to be updated.
        const platformData = await Platforms.findOne({name: {$in: filter.platform.toLowerCase()}}).lean();
        if((await platformData).length === 0){
            res.status(STATUS_CODES.NOT_FOUND).json({message: STATUS_MESSAGES.PLATFORM_NOT_FOUND});
            return;
        };

        // Set your API key here
        const apiKey = WATCHMODE_API_KEY;
        const sourceIds = platformData?.watchModePlatformId;
        
        const url = `https://api.watchmode.com/v1/list-titles/?apiKey=${apiKey}&source_ids=${sourceIds}&regions=${filter.region}`; // TODO add different regions, so repeate for multiple regions

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

        // Get the created entertainment data to create the availability data.
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
                        {region: filter.region}
                    ]
                },
                update: {
                    $set: {
                        entertainmentId: entertainment._id,
                        platformId: platformData._id,
                        region: filter.region,
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
        res.status(STATUS_CODES.SUCCESS).json({message: "Entertainemnt data updated successfully. For platform: " + filter.platform + " and region: " + filter.region});
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