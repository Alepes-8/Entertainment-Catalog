import mockingoose from "mockingoose";
import app from "../../../src/app.js"
import Entertainment from "../../../src/models/entertainment.js";
import ApiCalled from "../../../src/models/apiCalled";
import Avalability from "../../../src/models/avalability";
import Platforms from "../../../src/models/platforms.js";
import bcrypt from "bcryptjs";
import request from "supertest";
import mongoose from "mongoose";
import {STATUS_MESSAGES, STATUS_CODES, ENTERTAINMENT_TYPES, APIS_CALLS, DEFUALT_VALUES} from "../../../src/config/constants.js"
import avalability from "../../../src/models/avalability";
import { fn, spyOn} from 'jest-mock';

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
        expect(res.statusCode).toBe(STATUS_CODES.SUCCESS);
        const expectedEntertainment = JSON.parse(JSON.stringify(entertainments));
        expect(res.body[0]).toEqual(expectedEntertainment);

        expect(res.statusCode).toBe(STATUS_CODES.SUCCESS);
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
        expect(res.statusCode).toBe(STATUS_CODES.API_WAIT_CALL_TIME);
        expect(res.body.message).toBe(STATUS_MESSAGES.ERROR_ENTERTAINMENT_UPDATE_RECENTLY_CALLED);
    });

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

        const platforms = [];

        mockingoose(ApiCalled).toReturn(apiCalled, "findOne");
        mockingoose(Platforms).toReturn(platforms, "findOne");

        //Act
        const res = await request(app).post(`/entertainment/updatePlatformForRegion?platform=${platform}&region=${region}`); //TODO add aditional setting into the get.

        //Assert
        expect(res.statusCode).toBe(STATUS_CODES.NOT_FOUND);
        expect(res.body.message).toBe(STATUS_MESSAGES.PLATFORM_NOT_FOUND);
    });

    it("POST /updatePlatformForRegion should add entertainment types into entertainment database.", async () => {
        //Arrange
        const currentDate = new Date();
        const entertainmentId = new mongoose.Types.ObjectId();
        const platformId = new mongoose.Types.ObjectId();
        const testData = {
                title: "Test Movie", 
                type: "movie",
                year: 2024,
                movie_id: 12345,
                platform: DEFUALT_VALUES.PLATFORM,
                region: DEFUALT_VALUES.REGION,
                entertainmentType: ENTERTAINMENT_TYPES.MOVIE
        }
        const mockData = {"titles": [
            {
                "id": 3241768,
                "title": testData.title,
                "year": testData.year,
                "imdb_id": "tt27987047",
                "tmdb_id": 225647,
                "tmdb_type": "tv",
                "type": testData.entertainmentType,
            },
        ]};

        // Mock the fetch response
        global.fetch.mockResolvedValue({
            json: fn().mockResolvedValue(mockData)
        });

        const apiCalled = [
            {
                apiName: APIS_CALLS.WATCHMODE_PLATFORM_REGION_UPDATE,
                lastCalled: currentDate
            }
        ];

        const platforms = [
            {
                _id: platformId,
                name: testData.platform, 
                watchModePlatformId: 1
            }
        ];

        const entertainment = [{
            _id: entertainmentId,
            title: testData.title, 
            entertainmentType: testData.entertainmentType,
            releaseYear: testData.year,
            lastUpdate: currentDate,
            watchMongodEntertainemntID: mockData.titles[0].id
        }];
        
        const availability = [
            {
                entertainmentId: entertainmentId,
                platformId: [platformId],
                region: "SE",
                available: true
            },
            {
                entertainmentId: entertainmentId,
                platformId: [platformId],
                region: "US",
                available: true
            }
        ];


        mockingoose(ApiCalled).toReturn(apiCalled, "findOne");
        mockingoose(Platforms).toReturn(platforms, "findOne");
        mockingoose(Entertainment).toReturn(entertainment, "find");
        const mockResult = { acknowledged: true, modifiedCount: 1 };
        spyOn(Entertainment, 'bulkWrite').mockResolvedValue(mockResult);

        const mockResult2 = { acknowledged: true, modifiedCount: 1 };
        spyOn(Avalability, 'bulkWrite').mockResolvedValue(mockResult2);
        mockingoose(Avalability).toReturn(availability, "find");

        mockingoose(Avalability).toReturn("UpdateOne");

        //Act
        const res = await request(app).post("/entertainment/updatePlatformForRegion");

        //Assert
        expect(res.statusCode).toBe(STATUS_CODES.SUCCESS);
        expect(res.body.message).toBe("Entertainemnt data updated successfully. For platform: " + testData.platform + " and region: " + testData.region);
    });
    
    it("GET /updatePlatformIds should aquire and add platforms and corresponding watchmode id to the database.", async() => {
        //Arrange
        const currentDate = new Date();
        const platformId1 = new mongoose.Types.ObjectId();
        const platformId2 = new mongoose.Types.ObjectId();

        const mockData = [
            {
                "id": 1,
                "name": "Netflix",
                "type": "sub",
                "regions": [
                    "US"
                ]
            },
            {
                "id": 2,
                "name": "Hulu",
                "type": "sub",
                "regions": [
                    "US"
                ]
            }
        ];

        // Mock the fetch response
        global.fetch.mockResolvedValue({
            json: fn().mockResolvedValue(mockData)
        });

        const apiCalled = [
            {
                apiName: APIS_CALLS.WATCHMODE_SOURCE_UPDATE + "extra",
                lastCalled: currentDate
            }
        ];

        const platforms = [
            {
                _id: platformId1,
                name: mockData[0].name, 
                watchModePlatformId: mockData[0].id
            },
            {
                _id: platformId2,
                name: mockData[1].name, 
                watchModePlatformId: mockData[1].id
            }
        ];

        mockingoose(ApiCalled).toReturn(apiCalled, "findOne");
        const mockResult = { acknowledged: true, modifiedCount: 1 };
        spyOn(Platforms, 'bulkWrite').mockResolvedValue(mockResult);
        mockingoose(Platforms).toReturn(platforms, "find");

        //Act
        const res = await request(app).get("/entertainment/updatePlatformIds");

        //Assert
        expect(res.statusCode).toBe(STATUS_CODES.SUCCESS);
        const expectedPlatform = JSON.parse(JSON.stringify(platforms));
        expect(res.body).toStrictEqual(expectedPlatform);
    }); 
})