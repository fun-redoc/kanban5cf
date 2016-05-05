var chai = require("chai");
var expect = chai.expect;

var queryParams = require("../src/queryParams.js");

console.log("queryParams", queryParams );

describe("queryParams.js", function() {

  it("Status eq \'Completed\'", function() {
    expect(queryParams.parse("Status eq \'Completed\'"))
      .to.deep.equal({'Status':'Completed'});
  });

  it("Status eq \'New\' and IsAssigned eq false", function() {
    expect(queryParams.parse("Status eq \'New\' and IsAssigned eq false"))
      .to.deep.equal({'Status':'New', 'IsAssigned':false});
  });

  it("Status eq \'New\' and IsAssigned eq false", function() {
    expect({'Status':'New', 'IsAssigned':false})
      .to.deep.equal({'Status':'New', 'IsAssigned':false});
  });
});
