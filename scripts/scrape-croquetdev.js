import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://croquetdev.com';
const OUTPUT_DIR = path.join(__dirname, '../rag/croquetdev');

// Categories to scrape
const CATEGORIES = [
    {
        name: 'beginner',
        sections: [
            'intro',
            'technique',
            'shots',
            'breaks'
        ]
    },
    {
        name: 'experienced',
        sections: [
            'openings',
            'leaves',
            'peeling',
            'detailed'
        ]
    },
    {
        name: 'general',
        sections: [
            'mallets',
            'interactive',
            'faq'
        ]
    }
];

async function scrapeCroquetDev() {
    console.log('Starting CroquetDev scraper...');
    console.log(`Output directory: ${OUTPUT_DIR}`);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        console.log('Creating output directory...');
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Enable JavaScript console logging
    page.on('console', msg => console.log('Browser console:', msg.text()));
    
    // Set longer timeout
    page.setDefaultNavigationTimeout(120000);
    page.setDefaultTimeout(120000);

    try {
        // First scrape the main articles page
        console.log('\n=== Scraping Main Articles Page ===');
        console.log(`URL: ${BASE_URL}/articles.html`);
        
        // Navigate and wait for content
        await page.goto(`${BASE_URL}/articles.html`, { 
            waitUntil: ['networkidle0', 'domcontentloaded']
        });
        
        // Wait for any dynamic content
        await page.waitForTimeout(5000);
        
        console.log('Page loaded successfully');
        
        // Debug: Log the page content
        const pageContent = await page.content();
        console.log('\nPage structure:');
        console.log(await page.evaluate(() => {
            return {
                title: document.title,
                links: document.querySelectorAll('a').length,
                sections: document.querySelectorAll('section').length,
                text: document.body.textContent.substring(0, 200) + '...'
            };
        }));

        // Get all article links with more detailed logging
        console.log('\nExtracting article links...');
        const articleLinks = await page.evaluate(() => {
            const links = [];
            const allLinks = document.querySelectorAll('a');
            console.log(`Found ${allLinks.length} total links`);
            
            allLinks.forEach(a => {
                console.log(`Link: ${a.href} - Text: ${a.textContent.trim()}`);
                if (a.href.includes('/articles/') || a.href.includes('/coaching/')) {
                    links.push({
                        url: a.href,
                        title: a.textContent.trim(),
                        category: a.closest('section')?.id || 
                                a.closest('[class*="category"]')?.id ||
                                'uncategorized'
                    });
                }
            });
            return links;
        });
        console.log(`Found ${articleLinks.length} article links`);
        
        if (articleLinks.length === 0) {
            console.log('\nNo article links found. Trying alternative approach...');
            // Try direct URLs based on categories
            for (const category of CATEGORIES) {
                for (const section of category.sections) {
                    const sectionUrl = `${BASE_URL}/articles/${section}/`;
                    console.log(`Trying section URL: ${sectionUrl}`);
                    try {
                        await page.goto(sectionUrl, { waitUntil: 'networkidle0' });
                        const sectionLinks = await page.evaluate(() => {
                            return Array.from(document.querySelectorAll('a'))
                                .filter(a => a.href.includes('/articles/') || a.href.includes('/coaching/'))
                                .map(a => ({
                                    url: a.href,
                                    title: a.textContent.trim(),
                                    category: a.closest('section')?.id || 'uncategorized'
                                }));
                        });
                        articleLinks.push(...sectionLinks);
                        console.log(`Found ${sectionLinks.length} links in ${section}`);
                        await page.waitForTimeout(3000);
                    } catch (error) {
                        console.log(`Could not access ${sectionUrl}: ${error.message}`);
                    }
                }
            }
        }

        // Process each category
        for (const category of CATEGORIES) {
            console.log(`\n=== Processing Category: ${category.name.toUpperCase()} ===`);
            const categoryDir = path.join(OUTPUT_DIR, category.name);
            
            if (!fs.existsSync(categoryDir)) {
                console.log(`Creating directory: ${category.name}/`);
                fs.mkdirSync(categoryDir, { recursive: true });
            }

            // Process each section in the category
            for (const section of category.sections) {
                console.log(`\n--- Processing Section: ${section} ---`);
                const sectionDir = path.join(categoryDir, section);
                
                if (!fs.existsSync(sectionDir)) {
                    console.log(`Creating directory: ${category.name}/${section}/`);
                    fs.mkdirSync(sectionDir, { recursive: true });
                }

                // Find articles for this section
                const sectionArticles = articleLinks.filter(link => 
                    link.url.toLowerCase().includes(`/${section}/`) ||
                    link.category === section
                );
                console.log(`Found ${sectionArticles.length} articles for ${section}`);

                // Process each article
                for (const article of sectionArticles) {
                    const articleFileName = path.basename(article.url, '.html') + '.json';
                    const articlePath = path.join(sectionDir, articleFileName);

                    if (!fs.existsSync(articlePath)) {
                        console.log(`\nArticle: ${article.title}`);
                        console.log(`URL: ${article.url}`);
                        try {
                            console.log('Loading page...');
                            await page.goto(article.url, { waitUntil: 'networkidle0' });
                            console.log('Extracting content...');
                            const content = await extractArticleContent(page);
                            
                            if (content) {
                                console.log(`Writing to: ${articleFileName}`);
                                fs.writeFileSync(articlePath, JSON.stringify(content, null, 2));
                                console.log('Content saved successfully');
                                console.log('Waiting 10 seconds before next article...');
                                await new Promise(resolve => setTimeout(resolve, 10000));
                            }
                        } catch (error) {
                            console.error(`Error scraping article ${article.url}:`, error);
                        }
                    } else {
                        console.log(`Skipping existing article: ${articleFileName}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error scraping CroquetDev:', error);
    } finally {
        console.log('\nClosing browser...');
        await browser.close();
        console.log('Scraping completed');
    }
}

async function extractArticleContent(page) {
    console.log('Extracting page content...');
    const content = await page.evaluate(() => {
        const article = document.querySelector('article') || document.querySelector('main') || document.body;
        
        // Get all images with context
        console.log('Processing images...');
        const images = Array.from(document.querySelectorAll('img')).map(img => {
            const parent = img.closest('p, div, figure');
            return {
                src: img.src,
                alt: img.alt,
                title: img.title,
                caption: img.closest('figure')?.querySelector('figcaption')?.textContent.trim(),
                context: parent?.textContent.trim()
            };
        });

        // Get all sections/headings
        console.log('Processing sections...');
        const sections = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
            level: parseInt(h.tagName[1]),
            title: h.textContent.trim(),
            content: getNextContent(h)
        }));

        // Helper function to get content following a heading
        function getNextContent(element) {
            const content = [];
            let next = element.nextElementSibling;
            while (next && !next.matches('h1, h2, h3, h4, h5, h6')) {
                if (next.textContent.trim()) {
                    content.push({
                        type: next.tagName.toLowerCase(),
                        text: next.textContent.trim(),
                        hasImage: next.querySelector('img') !== null
                    });
                }
                next = next.nextElementSibling;
            }
            return content;
        }

        return {
            title: document.title,
            url: window.location.href,
            content: article.textContent.trim(),
            structure: {
                sections,
                images
            },
            metadata: {
                hasImages: images.length > 0,
                timestamp: new Date().toISOString()
            }
        };
    });
    console.log('Content extraction complete');
    return content;
}

// Run the scraper
console.log('=== CroquetDev Scraper ===');
console.log('Starting scraper...\n');
scrapeCroquetDev(); 