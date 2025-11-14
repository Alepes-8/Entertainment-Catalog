import mockingoose from "mockingoose";
import mongoose from "mongoose";
import Avalability from "../../../src/models/avalability.js";

describe("Unit test for Avalability model", async => {
    beforeEach(() => {
        mockingoose.resetAll();
    }); 

    it("Create a test availability", async() => {
        //Arrange
        const avaliabilityData = {
            entertainmentId: new mongoose.Types.ObjectId,
            platformId: [new mongoose.Types.ObjectId],
            region: "CA",
            available: true
        }
        mockingoose(Avalability).toReturn(avaliabilityData, "save");

        //Act
        const avalability = new Avalability(avaliabilityData);
        const savedAvalability = await avalability.save();

        //Assert
        expect(savedAvalability.entertainmentId).toBe(avaliabilityData.entertainmentId);
        expect(savedAvalability.platformId).toStrictEqual(avaliabilityData.platformId);
        expect(savedAvalability.region).toBe(avaliabilityData.region);
        expect(savedAvalability.available).toBe(avaliabilityData.available);
    }); 
});