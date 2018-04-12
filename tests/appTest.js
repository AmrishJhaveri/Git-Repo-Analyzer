const assert = require('assert');
const app = require('./../app/index');

describe("test this", function () {

    // it("Using setTimeout to simulate asynchronous code!", function (done) {
    //     setTimeout(function () {
    //         done();
    //     }, 200);
    // });
    // it("Using a Promise with async/await that resolves successfully with wrong expectation!", async function () {
    //     var testPromise = new Promise(function (resolve, reject) {
    //         setTimeout(function () {
    //             resolve("Hello World!");
    //         }, 200);
    //     });

    //     var result = await testPromise;

    //     assert.equal(result, "Hello World!");
    // });

    it("check the parameters to be passed to fetch the repos", function () {
        var expectedResult = {
            q: "language:java license:mit",
            sort: "stars",
            order: "desc",
            page: 1,
            per_page: 1
        }

        var actualResult = app.getParams(1);
        assert.deepStrictEqual(actualResult, expectedResult);
    });

    
})