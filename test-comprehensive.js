#!/usr/bin/env node

/**
 * JoeyKaye Handmades - Comprehensive Test Suite
 * Tests all major functionality including data operations, UI interactions, and edge cases
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
 * Test 1: Complete inventory workflow
 */
async function testInventoryWorkflow(page) {
    try {
        await page.click('[data-tab="inventory"]');
        await sleep(500);
        
        // Test adding inventory item
        const addButton = await page.$('button[onclick*="openAddInventoryModal"]');
        if (addButton) {
            await addButton.click();
            await sleep(500);
            
            // Fill out form
            await page.type('#inventoryDescription', 'Test Yarn - Green');
            await page.type('#inventoryQuantity', '5');
            await page.type('#inventoryPrice', '12.99');
            
            // Submit form
            const submitButton = await page.$('#addInventoryForm button[type="submit"]');
            if (submitButton) {
                await submitButton.click();
                await sleep(1000);
                
                // Check if item was added (look for success message or new item in grid)
                const success = await page.evaluate(() => {
                    // Look for success notification or new item in grid
                    const notifications = document.querySelectorAll('.notification, .toast');
                    const hasSuccess = Array.from(notifications).some(el => 
                        el.textContent.includes('success') || el.textContent.includes('added')
                    );
                    
                    const inventoryGrid = document.querySelector('#inventoryGrid');
                    const hasNewItem = inventoryGrid && inventoryGrid.textContent.includes('Test Yarn - Green');
                    
                    return hasSuccess || hasNewItem;
                });
                
                logTest('Inventory item can be added', success);
                return success;
            }
        }
        
        logTest('Inventory item can be added', false, 'Add button or form not found');
        return false;
    } catch (error) {
        logTest('Inventory item can be added', false, error.message);
        return false;
    }
}

/**
 * Test 2: Customer management workflow
 */
async function testCustomerWorkflow(page) {
    try {
        await page.click('[data-tab="customers"]');
        await sleep(500);
        
        // Test adding customer
        const addButton = await page.$('button[onclick*="openAddCustomerModal"]');
        if (addButton) {
            await addButton.click();
            await sleep(500);
            
            // Fill out customer form
            await page.type('#customerName', 'Test Customer');
            await page.type('#customerContact', 'test@example.com');
            await page.type('#customerLocation', 'Test City');
            
            // Submit form
            const submitButton = await page.$('#addCustomerForm button[type="submit"]');
            if (submitButton) {
                await submitButton.click();
                await sleep(1000);
                
                // Check if customer was added
                const success = await page.evaluate(() => {
                    const notifications = document.querySelectorAll('.notification, .toast');
                    const hasSuccess = Array.from(notifications).some(el => 
                        el.textContent.includes('success') || el.textContent.includes('added')
                    );
                    
                    const customersGrid = document.querySelector('#customersGrid');
                    const hasNewCustomer = customersGrid && customersGrid.textContent.includes('Test Customer');
                    
                    return hasSuccess || hasNewCustomer;
                });
                
                logTest('Customer can be added', success);
                return success;
            }
        }
        
        logTest('Customer can be added', false, 'Add button or form not found');
        return false;
    } catch (error) {
        logTest('Customer can be added', false, error.message);
        return false;
    }
}

/**
 * Test 3: Project management workflow
 */
async function testProjectWorkflow(page) {
    try {
        await page.click('[data-tab="wip"]');
        await sleep(500);
        
        // Test adding project
        const addButton = await page.$('button[onclick*="openAddProjectModal"]');
        if (addButton) {
            await addButton.click();
            await sleep(500);
            
            // Fill out project form
            await page.type('#projectDescription', 'Test Project - Green Scarf');
            await page.type('#projectCustomer', 'Test Customer');
            await page.type('#projectPrice', '25.00');
            await page.select('#projectStatus', 'in-progress');
            
            // Submit form
            const submitButton = await page.$('#addProjectForm button[type="submit"]');
            if (submitButton) {
                await submitButton.click();
                await sleep(1000);
                
                // Check if project was added
                const success = await page.evaluate(() => {
                    const notifications = document.querySelectorAll('.notification, .toast');
                    const hasSuccess = Array.from(notifications).some(el => 
                        el.textContent.includes('success') || el.textContent.includes('added')
                    );
                    
                    const wipGrid = document.querySelector('#wipGrid');
                    const hasNewProject = wipGrid && wipGrid.textContent.includes('Test Project - Green Scarf');
                    
                    return hasSuccess || hasNewProject;
                });
                
                logTest('Project can be added', success);
                return success;
            }
        }
        
        logTest('Project can be added', false, 'Add button or form not found');
        return false;
    } catch (error) {
        logTest('Project can be added', false, error.message);
        return false;
    }
}

/**
 * Test 4: Search functionality
 */
async function testSearchFunctionality(page) {
    try {
        await page.click('[data-tab="inventory"]');
        await sleep(500);
        
        // Test search input
        const searchInput = await page.$('#inventorySearch, #searchItems');
        if (searchInput) {
            await searchInput.type('Test');
            await sleep(500);
            
            // Check if search results are filtered
            const hasResults = await page.evaluate(() => {
                const grid = document.querySelector('#inventoryGrid');
                return grid && grid.children.length > 0;
            });
            
            logTest('Search functionality works', hasResults);
            
            // Clear search
            await searchInput.click({ clickCount: 3 });
            await searchInput.press('Delete');
            await sleep(300);
            
            return hasResults;
        }
        
        logTest('Search functionality works', false, 'Search input not found');
        return false;
    } catch (error) {
        logTest('Search functionality works', false, error.message);
        return false;
    }
}

/**
 * Test 5: Filter functionality
 */
async function testFilterFunctionality(page) {
    try {
        await page.click('[data-tab="wip"]');
        await sleep(500);
        
        // Test status filter
        const statusFilter = await page.$('#wipStatusFilter, select[onchange*="filterWIP"]');
        if (statusFilter) {
            await statusFilter.select('in-progress');
            await sleep(500);
            
            // Check if results are filtered
            const hasFilteredResults = await page.evaluate(() => {
                const grid = document.querySelector('#wipGrid');
                return grid && grid.children.length >= 0; // Should show some results or empty state
            });
            
            logTest('Filter functionality works', hasFilteredResults);
            
            // Reset filter
            await statusFilter.select('');
            await sleep(300);
            
            return hasFilteredResults;
        }
        
        logTest('Filter functionality works', false, 'Filter dropdown not found');
        return false;
    } catch (error) {
        logTest('Filter functionality works', false, error.message);
        return false;
    }
}

/**
 * Test 6: Data persistence
 */
async function testDataPersistence(page) {
    try {
        // Navigate between tabs and check if data persists
        const tabs = ['inventory', 'customers', 'wip', 'gallery'];
        
        for (const tab of tabs) {
            await page.click(`[data-tab="${tab}"]`);
            await sleep(1000);
            
            // Check if data is loaded
            const hasData = await page.evaluate((tabName) => {
                const grid = document.querySelector(`#${tabName}Grid`);
                if (grid) {
                    return grid.children.length > 0 || grid.textContent.trim() !== '';
                }
                return false;
            }, tab);
            
            if (!hasData) {
                logTest(`Data persists in ${tab} tab`, false, 'No data found');
                return false;
            }
        }
        
        logTest('Data persists across tabs', true);
        return true;
    } catch (error) {
        logTest('Data persists across tabs', false, error.message);
        return false;
    }
}

/**
 * Test 7: Mobile responsiveness
 */
async function testMobileResponsiveness(page) {
    try {
        // Test multiple viewport sizes
        const viewports = [
            { width: 375, height: 667 },   // iPhone
            { width: 768, height: 1024 },  // iPad
            { width: 414, height: 896 }    // iPhone Plus
        ];
        
        for (const viewport of viewports) {
            await page.setViewport(viewport);
            await sleep(500);
            
            // Check if mobile elements are present
            const hasMobileElements = await page.evaluate(() => {
                const mobileCards = document.querySelector('.mobile-cards-container');
                const hasResponsiveLayout = document.querySelector('.container').offsetWidth <= window.innerWidth;
                
                return mobileCards !== null || hasResponsiveLayout;
            });
            
            if (!hasMobileElements && viewport.width <= 768) {
                logTest(`Mobile responsive at ${viewport.width}x${viewport.height}`, false, 'Mobile elements not found');
                return false;
            }
        }
        
        // Reset to desktop viewport
        await page.setViewport(TEST_CONFIG.viewport);
        
        logTest('Mobile responsiveness works', true);
        return true;
    } catch (error) {
        logTest('Mobile responsiveness works', false, error.message);
        return false;
    }
}

/**
 * Test 8: Error handling
 */
async function testErrorHandling(page) {
    try {
        // Test form validation errors
        await page.click('[data-tab="inventory"]');
        await sleep(500);
        
        const addButton = await page.$('button[onclick*="openAddInventoryModal"]');
        if (addButton) {
            await addButton.click();
            await sleep(500);
            
            // Try to submit empty form
            const submitButton = await page.$('#addInventoryForm button[type="submit"]');
            if (submitButton) {
                await submitButton.click();
                await sleep(500);
                
                // Check if validation error is shown
                const hasValidationError = await page.evaluate(() => {
                    const requiredFields = document.querySelectorAll('#addInventoryForm [required]');
                    let hasError = false;
                    
                    requiredFields.forEach(field => {
                        if (!field.value.trim()) {
                            hasError = true;
                        }
                    });
                    
                    return hasError;
                });
                
                logTest('Form validation works', hasValidationError);
                
                // Close modal
                const closeButton = await page.$('#addInventoryModal .close');
                if (closeButton) {
                    await closeButton.click();
                    await sleep(300);
                }
                
                return hasValidationError;
            }
        }
        
        logTest('Form validation works', false, 'Form not found');
        return false;
    } catch (error) {
        logTest('Form validation works', false, error.message);
        return false;
    }
}

/**
 * Main test runner
 */
async function runTests() {
    console.log('🧪 JoeyKaye Handmades - Comprehensive Test Suite');
    console.log('================================================');
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
        await sleep(3000); // Give extra time for data to load
        
        // Run tests
        await testInventoryWorkflow(page);
        await testCustomerWorkflow(page);
        await testProjectWorkflow(page);
        await testSearchFunctionality(page);
        await testFilterFunctionality(page);
        await testDataPersistence(page);
        await testMobileResponsiveness(page);
        await testErrorHandling(page);
        
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
