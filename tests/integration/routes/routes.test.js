import mockingoose from "mockingoose";
import app from "../../../src/app.js"
import entertainment from "../../../src/models/entertainment.js";
import apiCalled from "../../../src/models/apiCalled";
import avalability from "../../../src/models/avalability";
import platforms from "../../../src/models/platforms.js";
import bcrypt from "bcryptjs";
import request from "supertest";

describe("Entertainment routes tests", async => {
    beforeEach(() => {
        mockingoose.resetAll();
    });

    it("GET /health should return status of service", () => {

    })

    it("GET /search should aquire a movies/tv_series following specific filtered input paramaters.",() => {

    });

    it("POST /updatePlatformForRegion should add entertainment types into entertainment database.",() => {

    });

    it("GET /updatePlatformIds should aquire and add platforms and corresponding watchmode id to the database.",() => {

    });    
})