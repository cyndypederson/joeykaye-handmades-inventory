#!/usr/bin/env node

/**
 * JoeyKaye Handmades - Smoke Test Suite
 * Tests basic functionality to ensure the app is working correctly
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

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
 * Test 1: Basic page load
 */
async function testPageLoad(page) {
    try {
        await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle0', timeout: TEST_CONFIG.timeout });
        
        // Check if page title contains expected text
        const title = await page.title();
        const titleOk = title.includes('JoeyKaye Handmades');
        
        // Check if main content is loaded
        const mainContent = await waitForElement(page, '.container');
        
        logTest('Page loads successfully', titleOk && mainContent);
        
        return titleOk && mainContent;
    } catch (error) {
        logTest('Page loads successfully', false, error.message);
        return false;
    }
}

/**
 * Test 2: Navigation works
 */
async function testNavigation(page) {
    try {
        // Test clicking on different tabs
        const navButtons = await page.$$('.nav-btn');
        
        if (navButtons.length === 0) {
            logTest('Navigation buttons exist', false, 'No navigation buttons found');
            return false;
        }
        
        // Test clicking on first few navigation buttons
        for (let i = 0; i < Math.min(3, navButtons.length); i++) {
            await navButtons[i].click();
            await page.waitFor(500); // Wait for tab switch
        }
        
        logTest('Navigation works', true);
        return true;
    } catch (error) {
        logTest('Navigation works', false, error.message);
        return false;
    }
}

/**
 * Test 3: Add item functionality (without authentication)
 */
async function testAddItem(page) {
    try {
        // Click on the main inventory tab
        await page.click('[data-tab="inventory"]');
        await page.waitFor(1000);
        
        // Look for add button
        const addButton = await page.$('button[onclick*="openAddInventoryModal"]');
        if (!addButton) {
            logTest('Add item button exists', false, 'Add button not found');
            return false;
        }
        
        // Click add button
        await addButton.click();
        await page.waitFor(500);
        
        // Check if modal opens
        const modalVisible = await waitForElement(page, '#addInventoryModal');
        
        logTest('Add item modal opens', modalVisible);
        
        // Close modal if it opened
        if (modalVisible) {
            const closeButton = await page.$('#addInventoryModal .close');
            if (closeButton) {
                await closeButton.click();
                await page.waitFor(300);
            }
        }
        
        return modalVisible;
    } catch (error) {
        logTest('Add item modal opens', false, error.message);
        return false;
    }
}

/**
 * Test 4: Data persistence (check if data loads)
 */
async function testDataLoading(page) {
    try {
        // Wait for data to load
        await page.waitFor(2000);
        
        // Check if any data containers exist and are populated
        const dataContainers = [
            '#inventoryGrid',
            '#customersGrid', 
            '#salesGrid',
            '#galleryGrid'
        ];
        
        let dataLoaded = false;
        for (const container of dataContainers) {
            const element = await page.$(container);
            if (element) {
                const content = await element.evaluate(el => el.innerHTML.trim());
                if (content && !content.includes('Loading') && !content.includes('No data')) {
                    dataLoaded = true;
                    break;
                }
            }
        }
        
        logTest('Data loads correctly', dataLoaded);
        return dataLoaded;
    } catch (error) {
        logTest('Data loads correctly', false, error.message);
        return false;
    }
}

/**
 * Test 5: Responsive design (mobile viewport)
 */
async function testResponsiveDesign(page) {
    try {
        // Test mobile viewport
        await page.setViewport({ width: 375, height: 667 }); // iPhone size
        await page.waitFor(500);
        
        // Check if mobile-specific elements are visible
        const mobileCards = await page.$('.mobile-cards-container');
        const isMobileFriendly = mobileCards !== null;
        
        // Reset to desktop viewport
        await page.setViewport(TEST_CONFIG.viewport);
        
        logTest('Responsive design works', isMobileFriendly);
        return isMobileFriendly;
    } catch (error) {
        logTest('Responsive design works', false, error.message);
        return false;
    }
}

/**
 * Test 6: Authentication system (should be disabled)
 */
async function testAuthenticationDisabled(page) {
    try {
        // Try to access a protected action
        await page.click('[data-tab="inventory"]');
        await page.waitFor(500);
        
        const addButton = await page.$('button[onclick*="openAddInventoryModal"]');
        if (addButton) {
            await addButton.click();
            await page.waitFor(500);
            
            // Check if auth modal appears (it shouldn't)
            const authModal = await page.$('#authModal');
            const authModalVisible = authModal && await authModal.evaluate(el => 
                window.getComputedStyle(el).display !== 'none'
            );
            
            logTest('Authentication is disabled', !authModalVisible);
            return !authModalVisible;
        }
        
        logTest('Authentication is disabled', false, 'Add button not found');
        return false;
    } catch (error) {
        logTest('Authentication is disabled', false, error.message);
        return false;
    }
}

/**
 * Main test runner
 */
async function runTests() {
    console.log('🧪 JoeyKaye Handmades - Smoke Test Suite');
    console.log('==========================================');
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
        
        // Run tests
        await testPageLoad(page);
        await testNavigation(page);
        await testAddItem(page);
        await testDataLoading(page);
        await testResponsiveDesign(page);
        await testAuthenticationDisabled(page);
        
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
