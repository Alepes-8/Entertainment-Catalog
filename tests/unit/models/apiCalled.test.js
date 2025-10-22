import mockingoose from "mockingoose";
import ApiCalled from "../../../src/models/apiCalled.js";

describe("Unit test for ApiCalled model", async => {
    beforeEach(() => {
        mockingoose.resetAll();
    }); 

    it("Create a test apicall data", async() => {
        //Arrange
        const newDate = new Date();
        const apicalledData = {
            apiName: "testingCall",
            lastCalled: newDate
        }
        mockingoose(ApiCalled).toReturn(apicalledData, "save");

        //Act
        const apiCalled = new ApiCalled(apicalledData);
        const savedApiCalled = await apiCalled.save();

        //Assert
        expect(savedApiCalled.apiName).toBe(apicalledData.apiName);
        expect(savedApiCalled.lastCalled).toBe(apicalledData.lastCalled);
    }); 
});