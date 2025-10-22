import mockingoose from "mockingoose";
import mongoose from "mongoose";
import Entertainment from "../../../src/models/entertainment.js";

describe("Unit test for Entertainment model", async => {
    beforeEach(() => {
        mockingoose.resetAll();
    }); 
    
    it("Create a entertainment movie", async() => {
        //Arrange
        const date = new Date();
        const entertainmentData = {
            title: "test entertainment", 
            entertainmentType: "movie",
            genre: [new mongoose.Types.ObjectId], 
            releaseYear: 2020,
            lastUpdate: date,
            watchMongodEntertainemntID: 23
        }
        mockingoose(Entertainment).toReturn(entertainmentData, "save");

        //Act
        const entertainment = new Entertainment(entertainmentData);
        const saveEntertainment = await entertainment.save()

        //Assert
        expect(saveEntertainment.title).toBe(entertainmentData.title); 
        expect(saveEntertainment.entertainmentType).toBe(entertainmentData.entertainmentType); 
        expect(saveEntertainment.genre).toStrictEqual(entertainmentData.genre); 
        expect(saveEntertainment.releaseYear).toBe(entertainmentData.releaseYear); 
        expect(saveEntertainment.lastUpdate).toBe(entertainmentData.lastUpdate); 
        expect(saveEntertainment.watchMongodEntertainemntID).toBe(entertainmentData.watchMongodEntertainemntID); 
    })
});