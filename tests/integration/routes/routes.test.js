import mockingoose from "mockingoose";
import app from "../../../src/app.js"
import Entertainment from "../../../src/models/entertainment.js";
import ApiCalled from "../../../src/models/apiCalled";
import Avalability from "../../../src/models/avalability";
import Platforms from "../../../src/models/platforms.js";
import bcrypt from "bcryptjs";
import request from "supertest";
import mongoose from "mongoose";
import {STATUS_MESSAGES, ENTERTAINMENT_TYPES, APIS_CALLS, DEFUALT_VALUES} from "../../../src/config/constants.js"
import avalability from "../../../src/models/avalability";
import { fn } from 'jest-mock';

describe("Entertainment routes tests", async => {
    beforeEach(() => {
        mockingoose.resetAll();
        global.fetch = fn();  // global fetch response to the external API call
    });

    it("GET /health should return status of service", async () => {
        //Arrange
        const returnMessage = STATUS_MESSAGES.OK;

        //Act
        const res = await request(app).get("/entertainment/health");

        //Assert
        expect(res.body.status).toBe(returnMessage)
    })

    it("GET /search should aquire a movies/tv_series following specific filtered input paramaters.",async() => {
        //Arrange
        const currentDate = new Date();
        const entertainmentId1 = new mongoose.Types.ObjectId();
        const entertainmentId2 = new mongoose.Types.ObjectId();
        const platformId = new mongoose.Types.ObjectId();

        const entertainments = [
            {
            _id: entertainmentId1,
            title: "topGun", 
            entertainmentType: ENTERTAINMENT_TYPES.MOVIE,
            genre: [],
            releaseYear: 1986,
            lastUpdate: currentDate,
            watchMongodEntertainemntID: 1
            },
            {
            _id: entertainmentId2,
            title: "Independence Day", 
            entertainmentType: ENTERTAINMENT_TYPES.MOVIE,
            genre: [],
            releaseYear: 1996,
            lastUpdate: currentDate,
            watchMongodEntertainemntID: 2
            }
        ]


        const availability = [
            {
                entertainmentId: entertainmentId1,
                platformId: [platformId],
                region: "SE",
                available: true
            },
            {
                entertainmentId: entertainmentId2,
                platformId: [platformId],
                region: "SE",
                available: true
            },
            {
                entertainmentId: entertainmentId1,
                platformId: [platformId],
                region: "ENG",
                available: true
            },
            {
                entertainmentId: entertainmentId2,
                platformId: [platformId],
                region: "ENG",
                available: true
            }
        ];

        // Create a resonse in which the different mongodb models will return when called throught he code.
        mockingoose(Entertainment).toReturn(entertainments, "find");
        mockingoose(Avalability).toReturn(availability, "find");

        //Act
        const res = await request(app).get("/entertainment/search");

        // Assert
        expect(res.statusCode).toBe(200);
        const expectedEntertainment = JSON.parse(JSON.stringify(entertainments));
        expect(res.body[0]).toEqual(expectedEntertainment);

        expect(res.statusCode).toBe(200);
        expect(res.body[1].length).toBe(availability.length);
        expect(res.body[1][0].entertainmentId).toEqual(entertainmentId1.toString());
        expect(res.body[1][0].platformId).toEqual([platformId.toString()]);
        expect(res.body[1][0].region).toEqual(availability[0].region);
        expect(res.body[1][0].available).toEqual(availability[0].available);
    });

    it("POST /updatePlatformForRegion stop as the update was done moments ago according to the apiCalled", async () => {
        //Arrange
        const currentDate = new Date();

        const apiCalled = 
        {
            apiName: APIS_CALLS.WATCHMODE_PLATFORM_REGION_UPDATE + `_${DEFUALT_VALUES.PLATFORM}_${DEFUALT_VALUES.REGION}`,
            lastCalled: currentDate
        };

        mockingoose(ApiCalled).toReturn(apiCalled, "findOne");

        //Act
        const res = await request(app).post("/entertainment/updatePlatformForRegion");

        //Assert
        expect(res.body.message).toBe(STATUS_MESSAGES.ERROR_ENTERTAINMENT_UPDATE_RECENTLY_CALLED);
    });
/*
    it("POST /updatePlatformForRegion input platform does not exist", async () => {
        //Arrange
        const currentDate = new Date();
        const platform = "netflix";
        const region = "SE";
        const apiCalled = [
            {
                apiName: APIS_CALLS.WATCHMODE_PLATFORM_REGION_UPDATE,
                lastCalled: currentDate
            }
        ];

        const platforms = [
            {
                name: "HBO Max", 
                watchModePlatformId: 2
            }
        ];

        mockingoose(ApiCalled).toReturn(apiCalled, "find");
        mockingoose(Platforms).toReturn(platforms, "find");

        //Act
        const res = await request(app).post(`/entertainment/updatePlatformForRegion?platform=${platform}&region=${region}`); //TODO add aditional setting into the get.

        //Assert
        expect(res.body.message).toBe(STATUS_MESSAGES.PLATFORM_NOT_FOUND);
    });

    it("POST /updatePlatformForRegion should add entertainment types into entertainment database.", async () => {
        //Arrange
        const currentDate = new Date();
        const mockData = {
            title: "Test Movie", 
            type: "movie",
            year: 2024,
            id: 12345
        };

        // Mock the fetch response
        global.fetch.mockResolvedValue({
            json: fn().mockResolvedValue(mockData)
        });

        const apiCalled = [
            {
                apiName: "test",
                lastCalled: currentDate
            }
        ]

        const platforms = {
            name: {type: String, required: true, unique: true}, 
            watchModePlatformId: {type: Number, requred: true, unique: true}
        }

        const entertainment = {
            title: {type: String, required: true}, 
            entertainmentType: {type: String, enum: [ENTERTAINMENT_TYPES.MOVIE, ENTERTAINMENT_TYPES.SERIES], required: true},
            genre: [{type: mongoose.Schema.Types.ObjectId, ref: MODEL_TYPES.GENRE}], 
            releaseYear: {type: Number},
            lastUpdate: { type: Date, default: Date.now },
            watchMongodEntertainemntID: {type: Number, unique: true, required: true}
        }

        const Avalability = {
            entertainmentId: {type: mongoose.Schema.Types.ObjectId, ref: MODEL_TYPES.ENTERTAINEMNT, required: true },
            platformId: [{type: mongoose.Schema.Types.ObjectId, ref: MODEL_TYPES.PLATFORM, required: true }],
            region: {type: String, required: true, match: /^[A-Z]{2}$/},
            available: Boolean
        }

        const entertainmentresponse = {
            title: {type: String, required: true}, 
            entertainmentType: {type: String, enum: [ENTERTAINMENT_TYPES.MOVIE, ENTERTAINMENT_TYPES.SERIES], required: true},
            genre: [{type: mongoose.Schema.Types.ObjectId, ref: MODEL_TYPES.GENRE}], 
            releaseYear: {type: Number},
            lastUpdate: { type: Date, default: Date.now },
            watchMongodEntertainemntID: {type: Number, unique: true, required: true}
        }

        mockingoose(ApiCalled).toReturn(apiCalled, "find");
        mockingoose(Platforms).toReturn(platforms, "find");
        mockingoose(Entertainment).toReturn(entertainment, "find");
        mockingoose(Avalability).toReturn(avalability, "find");
        mockingoose(entertainment).toReturn(entertainmentresponse, "find");

        //Act
        const res = await request(app).get("/entertainment/updatePlatformForRegion");

        //Assert
    });
    */
/*
    it("GET /updatePlatformIds should aquire and add platforms and corresponding watchmode id to the database.",() => {
        //Arrange

        //Act
        
        //Assert
    });    */
})