import mockingoose from "mockingoose";
import app from "../../../src/app.js"
import Entertainment from "../../../src/models/entertainment.js";
import apiCalled from "../../../src/models/apiCalled";
import Avalability from "../../../src/models/avalability";
import platforms from "../../../src/models/platforms.js";
import bcrypt from "bcryptjs";
import request from "supertest";
import mongoose from "mongoose";
import {STATUS_MESSAGES, ENTERTAINMENT_TYPES, MODEL_TYPES} from "../../../src/config/constants.js"

describe("Entertainment routes tests", async => {
    beforeEach(() => {
        mockingoose.resetAll();
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
/*
    it("POST /updatePlatformForRegion should add entertainment types into entertainment database.",() => {
        //Arrange

        //Act
        
        //Assert
    });

    it("GET /updatePlatformIds should aquire and add platforms and corresponding watchmode id to the database.",() => {
        //Arrange

        //Act
        
        //Assert
    });    */
})