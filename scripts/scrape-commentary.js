import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://croquetscores.com';
const COMMENTARY_URL = `${BASE_URL}/2022/ac/macrobertson-shield/commentaries`;
const OUTPUT_DIR = path.join(__dirname, '../rag/commentary');

async function scrapeCommentaries() {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set longer timeout and enable request interception
    page.setDefaultNavigationTimeout(120000);
    page.setDefaultTimeout(120000);

    try {
        console.log('Fetching main commentary page...');
        await page.goto(COMMENTARY_URL, { waitUntil: 'networkidle0' });
        console.log('Main page loaded, looking for links...');

        // Extract individual commentary links
        const commentaryLinks = await page.evaluate(() => {
            const links = [];
            document.querySelectorAll('a').forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.includes('commentaries') && !href.includes('create') && !href.includes('#')) {
                    links.push(href);
                }
            });
            return links;
        });

        const uniqueLinks = [...new Set(commentaryLinks)].map(link => 
            link.startsWith('http') ? link : `${BASE_URL}${link}`
        );

        console.log(`Found ${uniqueLinks.length} unique commentary links`);
        console.log('Links:', uniqueLinks);

        // Process each commentary
        for (const link of uniqueLinks) {
            console.log(`\nProcessing: ${link}`);
            try {
                const commentaryData = await scrapeCommentaryPage(page, link);
                if (commentaryData && commentaryData.content && commentaryData.content.trim()) {
                    // Save to JSON file
                    const filename = `commentary-${Date.now()}.json`;
                    fs.writeFileSync(
                        path.join(OUTPUT_DIR, filename),
                        JSON.stringify(commentaryData, null, 2)
                    );
                    console.log(`Saved commentary: ${filename}`);
                    console.log(`Content length: ${commentaryData.content.length} characters`);
                } else {
                    console.log(`No content found for: ${link}`);
                }
                // Add a longer delay between requests
                console.log('Waiting 5 seconds before next request...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            } catch (error) {
                console.error(`Error processing ${link}:`, error.message);
                // Add a longer delay after errors
                console.log('Error occurred, waiting 10 seconds before continuing...');
                await new Promise(resolve => setTimeout(resolve, 10000));
                continue;
            }
        }

    } catch (error) {
        console.error('Error scraping commentaries:', error);
    } finally {
        await browser.close();
    }
}

async function scrapeCommentaryPage(page, url) {
    try {
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle0' });
        console.log('Page loaded, extracting content...');

        const data = await page.evaluate(() => {
            console.log('Starting page evaluation...');
            
            // Get the title
            const title = document.querySelector('.page-header h1')?.textContent.trim() || 
                         document.querySelector('h1')?.textContent.trim() || '';
            console.log('Title:', title);
            
            // Extract author from title
            const titleMatch = title.match(/Commentary by (.+)$/);
            const author = titleMatch ? titleMatch[1] : '';
            console.log('Author:', author);
            
            // Get all paragraphs from the main content area
            const paragraphs = Array.from(document.querySelectorAll('p'))
                .map(p => p.textContent.trim())
                .filter(text => text.length > 0);
            
            console.log(`Found ${paragraphs.length} paragraphs`);
            
            const content = paragraphs.join('\n\n');

            return {
                title,
                author,
                content,
                paragraphCount: paragraphs.length
            };
        });

        console.log('Content extracted successfully');
        return {
            ...data,
            url,
            metadata: {
                tournament: 'MacRobertson Shield',
                year: '2022',
                format: 'Association Croquet'
            }
        };
    } catch (error) {
        console.error(`Error scraping commentary page ${url}:`, error);
        return null;
    }
}

// Run the scraper
scrapeCommentaries(); 