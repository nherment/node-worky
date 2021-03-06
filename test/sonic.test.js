
var assert = require('assert')

var Sonic = require('../Sonic.js')


var flow = [
  {
    "action": "sc-fork",
    "forks": [
      [
        {
          "action": "sc-filter",
          "name": "error only",
          "attributes": {
            "error": true
          }
        },
        {
          "action": "reject-with-error",
          "name": "reject-with-error"
        }
      ],
      [
        {
          "action": "sc-filter",
          "name": "new only",
          "attributes": {
            "status": "new"
          }
        },
        {
          "action": "sc-set",
          "name": "filter1",
          "set": {
            "filter": 1
          }
        }
      ],
      [
        {
          "action": "sc-filter",
          "name": "open only",
          "attributes": {
            "status": "open"
          }
        },
        {
          "action": "sc-set",
          "name": "filter2",
          "set": {
            "filter": 2
          }
        }
      ],
      [
        {
          "action": "sc-filter",
          "name": "entity3, secondPass",
          "attributes": {
            "name": "entity3",
            "secondPass": true,
            "success": null
          }
        },
        {
          "action": "sc-set",
          "name": "entity3, success",
          "set": {
            "success": true
          }
        },
        {
          "action": "sc-bind",
          "name": "injection of entity4 to modify entity3",
          "bindings": {
            "name": "entity4",
            "entity3": "{.}"
          }
        }
      ],
      [
        {
          "action": "sc-filter",
          "name": "entity3, firstPass",
          "attributes": {
            "name": "entity3",
            "secondPass": null
          }
        },
        {
          "action": "sc-set",
          "name": "entity3, set secondPass",
          "set": {
            "secondPass": true
          }
        }
      ],
      [
        {
          "action": "sc-filter",
          "name": "injection, modifies entity3",
          "attributes": {
            "name": "entity4",
            "injected": null
          }
        },
        {
          "action": "sc-set",
          "name": "entity3, set injected",
          "set": {
            "injected": true,
            "entity3.injected": true
          }
        }
      ]
    ]
  }
]


describe('basic flow', function() {

  it('fork1', function(done) {
    var sonic = new Sonic(flow)
    var entity = {name: "entity1", status: "new"}
    sonic.run(entity, function(err) {
      assert.ok(!err)
      assert.equal(entity.filter, 1)
      done()
    })
  })

  it('fork2', function(done) {
    var sonic = new Sonic(flow)
    var entity = {name: "entity2", status: "open"}
    sonic.run(entity, function(err) {
      assert.ok(!err)
      assert.equal(entity.filter, 2)
      done()
    })
  })

  it('modified objects are re-processed', function(done) {
    var sonic = new Sonic(flow)
    var entity = {name: "entity3"}
    sonic.run(entity, function(err) {
      assert.ok(!err)
      assert.ok(entity.secondPass, "JSON 'null' value should do be falsy match")
      assert.ok(entity.success, "the entity was not re-processed")
      assert.ok(entity.injected, "the injection did not work")
      done()
    })
  })

  it('reject with error should stop the flow and report an error', function(done) {
    var sonic = new Sonic(flow)
    sonic.register('reject-with-error', function(data, options) {
      this.reject(new Error('foobar'))
    })
    var entity = {name: "entity3", error: true}
    sonic.run(entity, function(err) {
      assert.ok(err)
      assert.equal(err.message, 'foobar')
      assert.ok(!entity.secondPass, "should not have gone through second pass")
      done()
    })
  })




})
