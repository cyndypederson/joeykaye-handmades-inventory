#!/usr/bin/env node

/**
 * JoeyKaye Handmades - Modal Separation Test Suite
 * Tests that modals work correctly and don't interfere with each other
 */

const puppeteer = require('puppeteer');

// Test configuration
const TEST_CONFIG = {
    baseUrl: 'http://localhost:3003',
    timeout: 30000,
    headless: true,
    viewport: { width: 1280, height: 720 }
};

// Test results tracking
let testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    errors: []
};

/**
 * Log test results
 */
function logTest(testName, passed, error = null) {
    testResults.total++;
    if (passed) {
        testResults.passed++;
        console.log(`✅ ${testName}`);
    } else {
        testResults.failed++;
        testResults.errors.push({ test: testName, error });
        console.log(`❌ ${testName}: ${error}`);
    }
}

/**
 * Wait for element to be visible
 */
async function waitForElement(page, selector, timeout = 5000) {
    try {
        await page.waitForSelector(selector, { visible: true, timeout });
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Sleep helper function
 */
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if modal is visible
 */
async function isModalVisible(page, modalId) {
    try {
        const modal = await page.$(`#${modalId}`);
        if (!modal) return false;
        
        const isVisible = await modal.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden';
        });
        
        return isVisible;
    } catch (error) {
        return false;
    }
}

/**
 * Test 1: Add Inventory Modal
 */
async function testAddInventoryModal(page) {
    try {
        await page.click('[data-tab="inventory"]');
        await sleep(500);
        
        const addButton = await page.$('button[onclick*="openAddInventoryModal"]');
        if (!addButton) {
            logTest('Add Inventory Modal opens', false, 'Add button not found');
            return false;
        }
        
        await addButton.click();
        await sleep(500);
        
        const modalVisible = await isModalVisible(page, 'addInventoryModal');
        logTest('Add Inventory Modal opens', modalVisible);
        
        if (modalVisible) {
            // Test closing modal
            const closeButton = await page.$('#addInventoryModal .close');
            if (closeButton) {
                await closeButton.click();
                await sleep(300);
                const modalClosed = !(await isModalVisible(page, 'addInventoryModal'));
                logTest('Add Inventory Modal closes', modalClosed);
            }
        }
        
        return modalVisible;
    } catch (error) {
        logTest('Add Inventory Modal opens', false, error.message);
        return false;
    }
}

/**
 * Test 2: Add Project Modal
 */
async function testAddProjectModal(page) {
    try {
        await page.click('[data-tab="projects"]');
        await sleep(500);
        
        const addButton = await page.$('button[onclick*="openAddProjectModal"]');
        if (!addButton) {
            logTest('Add Project Modal opens', false, 'Add button not found');
            return false;
        }
        
        await addButton.click();
        await sleep(500);
        
        const modalVisible = await isModalVisible(page, 'addProjectModal');
        logTest('Add Project Modal opens', modalVisible);
        
        if (modalVisible) {
            // Test closing modal
            const closeButton = await page.$('#addProjectModal .close');
            if (closeButton) {
                await closeButton.click();
                await sleep(300);
                const modalClosed = !(await isModalVisible(page, 'addProjectModal'));
                logTest('Add Project Modal closes', modalClosed);
            }
        }
        
        return modalVisible;
    } catch (error) {
        logTest('Add Project Modal opens', false, error.message);
        return false;
    }
}

/**
 * Test 3: Add Customer Modal
 */
async function testAddCustomerModal(page) {
    try {
        await page.click('[data-tab="customers"]');
        await sleep(500);
        
        const addButton = await page.$('button[onclick*="openAddCustomerModal"]');
        if (!addButton) {
            logTest('Add Customer Modal opens', false, 'Add button not found');
            return false;
        }
        
        await addButton.click();
        await sleep(500);
        
        const modalVisible = await isModalVisible(page, 'addCustomerModal');
        logTest('Add Customer Modal opens', modalVisible);
        
        if (modalVisible) {
            // Test closing modal
            const closeButton = await page.$('#addCustomerModal .close');
            if (closeButton) {
                await closeButton.click();
                await sleep(300);
                const modalClosed = !(await isModalVisible(page, 'addCustomerModal'));
                logTest('Add Customer Modal closes', modalClosed);
            }
        }
        
        return modalVisible;
    } catch (error) {
        logTest('Add Customer Modal opens', false, error.message);
        return false;
    }
}

/**
 * Test 4: Modal isolation (only one modal open at a time)
 */
async function testModalIsolation(page) {
    try {
        // Open first modal
        await page.click('[data-tab="inventory"]');
        await sleep(500);
        
        const addInventoryButton = await page.$('button[onclick*="openAddInventoryModal"]');
        if (addInventoryButton) {
            await addInventoryButton.click();
            await sleep(500);
            
            const firstModalOpen = await isModalVisible(page, 'addInventoryModal');
            
            if (firstModalOpen) {
                // Try to open second modal while first is open
                // First switch tabs (this should close the first modal or prevent opening second)
                await page.click('[data-tab="projects"]');
                await sleep(1000); // Give time for tab switch
                
                const addProjectButton = await page.$('button[onclick*="openAddProjectModal"]');
                if (addProjectButton) {
                    try {
                        await addProjectButton.click({ timeout: 5000 });
                        await sleep(500);
                    } catch (e) {
                        // Button might not be clickable if modal is blocking
                    }
                    
                    const secondModalOpen = await isModalVisible(page, 'addProjectModal');
                    const firstModalStillOpen = await isModalVisible(page, 'addInventoryModal');
                    
                    // Only one modal should be open
                    const onlyOneModalOpen = (firstModalStillOpen && !secondModalOpen) || (!firstModalStillOpen && secondModalOpen);
                    
                    logTest('Modal isolation works', onlyOneModalOpen);
                    
                    // Clean up - close any open modals
                    const closeButtons = await page.$$('.modal .close');
                    for (const button of closeButtons) {
                        await button.click();
                        await sleep(200);
                    }
                    
                    return onlyOneModalOpen;
                }
            }
        }
        
        logTest('Modal isolation works', false, 'Could not test modal isolation');
        return false;
    } catch (error) {
        logTest('Modal isolation works', false, error.message);
        return false;
    }
}

/**
 * Test 5: Modal form validation
 */
async function testModalFormValidation(page) {
    try {
        // Make sure all modals are closed first
        await page.evaluate(() => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
        await sleep(500);
        
        await page.click('[data-tab="inventory"]');
        await sleep(1000);
        
        const addButton = await page.$('button[onclick*="openAddInventoryModal"]');
        if (!addButton) {
            logTest('Modal form validation', false, 'Add button not found');
            return false;
        }
        
        await addButton.click();
        await sleep(1000);
        
        const modalVisible = await isModalVisible(page, 'addInventoryModal');
        if (!modalVisible) {
            logTest('Modal form validation', false, 'Modal did not open');
            return false;
        }
        
        // Try to submit empty form
        const submitButton = await page.$('#addInventoryModal button[type="submit"]');
        if (submitButton) {
            await submitButton.click();
            await sleep(500);
            
            // Check if form validation prevents submission
            const modalStillOpen = await isModalVisible(page, 'addInventoryModal');
            logTest('Modal form validation works', modalStillOpen);
            
            // Close modal
            const closeButton = await page.$('#addInventoryModal .close');
            if (closeButton) {
                await closeButton.click();
                await sleep(300);
            }
            
            return modalStillOpen;
        }
        
        logTest('Modal form validation', false, 'Submit button not found');
        return false;
    } catch (error) {
        logTest('Modal form validation', false, error.message);
        return false;
    }
}

/**
 * Main test runner
 */
async function runTests() {
    console.log('🧪 JoeyKaye Handmades - Modal Separation Test Suite');
    console.log('===================================================');
    console.log(`Testing: ${TEST_CONFIG.baseUrl}`);
    console.log('');
    
    let browser;
    
    try {
        // Launch browser
        browser = await puppeteer.launch({
            headless: TEST_CONFIG.headless,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setViewport(TEST_CONFIG.viewport);
        
        // Navigate to the app
        await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'domcontentloaded', timeout: TEST_CONFIG.timeout });
        await sleep(2000);
        
        // Run tests
        await testAddInventoryModal(page);
        await testAddProjectModal(page);
        await testAddCustomerModal(page);
        await testModalIsolation(page);
        await testModalFormValidation(page);
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
        testResults.failed++;
        testResults.errors.push({ test: 'Test Suite', error: error.message });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    
    // Print results
    console.log('');
    console.log('📊 Test Results');
    console.log('===============');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${testResults.total > 0 ? Math.round((testResults.passed / testResults.total) * 100) : 0}%`);
    
    if (testResults.errors.length > 0) {
        console.log('');
        console.log('❌ Failed Tests:');
        testResults.errors.forEach(error => {
            console.log(`  • ${error.test}: ${error.error}`);
        });
    }
    
    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests if called directly
if (require.main === module) {
    runTests().catch(error => {
        console.error('💥 Test runner crashed:', error);
        process.exit(1);
    });
}

module.exports = { runTests, testResults };
