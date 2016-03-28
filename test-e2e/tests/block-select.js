var homepageRegister = require('../fixtures/homepage-register');
var signout = require('../fixtures/signout');
var signin = require('../fixtures/signin');
var dragFromTo = require('../fixtures/dragfromto');
var newProject = require('../fixtures/newproject');
var newConstruct = require('../fixtures/newconstruct');
var clickNthBlock = require('../fixtures/click-nth-block-bounds');

module.exports = {
  'Test that you can multi-select blocks with the shift key' : function (browser) {

    // maximize for graphical tests
    browser.windowSize('current', 1200, 900);

    // register via fixture
    var credentials = homepageRegister(browser);

    // now we can go to the project page
    browser
      .url('http://localhost:3000/project/test')
      // wait for inventory and inspector to be present
      .waitForElementPresent('.SidePanel.Inventory', 5000, 'Expected Inventory Groups')
      .waitForElementPresent('.SidePanel.Inspector', 5000, 'Expected Inspector')
      // open inventory
      .click('.Inventory-trigger')
      .waitForElementPresent('.SidePanel.Inventory.visible', 5000, 'Expected inventory to be visible')
      // click the second inventory group 'EGF Parts' to open it
      .click('.InventoryGroup:nth-of-type(2) .InventoryGroup-heading');

    // start with a fresh project
    newProject(browser);

    // double check there are no construct viewers present
    browser.assert.countelements('.construct-viewer', 0);

    // create a new construct with a single block
    dragFromTo(browser, '.InventoryItem:nth-of-type(1)', 10, 10, '.ProjectPage-constructs', 100, 100);

    browser
      // expect two construct views with one block each
      .assert.countelements('.construct-viewer', 1)
      .assert.countelements('.sbol-glyph', 1);

    // drag some other blocks into the construct
    // drag an item from the inventory

    for(var i = 1; i < 10; i += 1) {
      dragFromTo(
          browser,
          '.InventoryItem:nth-of-type(' + i + ')', 10, 10,
          '.construct-viewer:nth-of-type(1) .sceneGraph .sbol-glyph:nth-of-type(1)', 30, 10);
    }

    // should have 10 blocks total
    browser.assert.countelements('.sbol-glyph', 10);
    var blockBounds = clickNthBlock(browser, '.sceneGraph', 0);

    // expect 1 selection block
    browser
      .waitForElementPresent(".scenegraph-userinterface-selection", 5000, 'expected a selection block')
      .assert.countelements(".scenegraph-userinterface-selection", 1);

    // shift click all 10 blocks and expect to see 10 selection blocks
    browser.execute(function() {
      window.__shifty = true;
    }, [], function() {});

    for(var i = 0; i < 10; i += 1) {
      var blockBounds = clickNthBlock(browser, '.sceneGraph', i);
    }

    browser.execute(function() {
      window.__shifty = false;
    }, [], function() {});

    // expect all 10 elements to be selected
    browser.assert.countelements(".scenegraph-userinterface-selection", 10);

    // all done
    browser.end();
  }
};