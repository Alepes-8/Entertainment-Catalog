import mockingoose from "mockingoose";
import Platforms from "../../../src/models/platforms.js";

describe("Unit test for Platforms model", () => {
    beforeEach(() => {
        mockingoose.resetAll();
    }); 
    
    it("Create a platform", async() => {
        //Arrange
        const platformData = {
            name: "testData", 
            watchModePlatformId: 232,
        }

        mockingoose(Platforms).toReturn(platformData, "save");
        
        //Act
        const platforms = new Platforms(platformData);
        const savedPlatform = await platforms.save();

        //Assert
        expect(savedPlatform.name).toBe(platformData.name);
        expect(savedPlatform.watchModePlatformId).toBe(platformData.watchModePlatformId);
    });
});