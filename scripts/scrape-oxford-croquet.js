import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import https from 'https';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://www.oxfordcroquet.com';
const OUTPUT_DIR = path.join(__dirname, '../rag/wylie');

// Helper function to download images
async function downloadImage(url, outputPath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download image: ${response.statusCode}`));
                return;
            }

            const fileStream = fs.createWriteStream(outputPath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });

            fileStream.on('error', (err) => {
                fs.unlink(outputPath, () => reject(err));
            });
        }).on('error', reject);
    });
}

// Key sections to scrape
const SECTIONS = [
    {
        name: 'Expert Croquet Tactics',
        url: '/coach/ect/index.asp',
        subpages: [
            '/coach/ect/introduction.asp',
            '/coach/ect/article1.asp',  // Triple Peel
            '/coach/ect/article2.asp',  // Break Play
            '/coach/ect/article3.asp',  // Leaves
            '/coach/ect/article4.asp',  // Advanced Tactics
            '/coach/ect/article5.asp',  // Shot-making
            '/coach/ect/article6.asp',  // Openings
            '/coach/ect/article7.asp',  // Endings
            '/coach/ect/article8.asp',  // Tournament Play
            '/coach/ect/article9.asp',  // Practice
            '/coach/ect/article10.asp'  // Advanced Concepts
        ]
    }
];

// Add function to discover working URLs
async function discoverWorkingUrls(page) {
    console.log('\n=== Discovering Working URLs ===');
    const mainUrl = `${BASE_URL}/coach/index.asp`;
    console.log(`Checking main coaching page: ${mainUrl}`);
    
    try {
        await page.goto(mainUrl, { waitUntil: 'networkidle0' });
        console.log('Found coaching index page, extracting links...');
        
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a'))
                .map(a => ({
                    text: a.textContent.trim(),
                    href: a.href
                }))
                .filter(link => 
                    link.href.includes('/coach/') && 
                    !link.href.includes('index.asp')
                );
        });
        
        console.log(`Found ${links.length} potential coaching links:`);
        for (const link of links) {
            console.log(`- ${link.text}: ${link.href}`);
        }
        
        // Test each link
        for (const link of links) {
            try {
                console.log(`\nTesting: ${link.href}`);
                await page.goto(link.href, { waitUntil: 'networkidle0' });
                const title = await page.title();
                if (!title.includes('404')) {
                    console.log(`✓ Working: ${title}`);
                } else {
                    console.log(`✗ Not found`);
                }
            } catch (error) {
                console.log(`✗ Error: ${error.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    } catch (error) {
        console.error('Error discovering URLs:', error);
    }
}

async function scrapeOxfordCroquet() {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set longer timeout
    page.setDefaultNavigationTimeout(120000);
    page.setDefaultTimeout(120000);

    try {
        // First discover working URLs
        await discoverWorkingUrls(page);
        
        // Then scrape known working sections
        for (const section of SECTIONS) {
            console.log(`\nProcessing section: ${section.name}`);
            const sectionDir = path.join(OUTPUT_DIR, section.name.toLowerCase().replace(/\s+/g, '-'));
            
            if (!fs.existsSync(sectionDir)) {
                fs.mkdirSync(sectionDir, { recursive: true });
            }

            // Check and scrape main page if needed
            const indexPath = path.join(sectionDir, 'index.json');
            if (!fs.existsSync(indexPath)) {
                const mainUrl = `${BASE_URL}${section.url}`;
                console.log(`Scraping main page: ${mainUrl}`);
                let mainContent = null;
                let retries = 3;
                while (retries > 0 && !mainContent) {
                    try {
                        mainContent = await scrapePage(page, mainUrl);
                        if (mainContent) {
                            fs.writeFileSync(indexPath, JSON.stringify(mainContent, null, 2));
                            // Add longer delay after successful scrape
                            await new Promise(resolve => setTimeout(resolve, 15000));
                        }
                    } catch (error) {
                        console.error(`Error on attempt ${4-retries} for ${mainUrl}:`, error);
                        retries--;
                        if (retries > 0) {
                            console.log(`Retrying in 30 seconds...`);
                            await new Promise(resolve => setTimeout(resolve, 30000));
                        }
                    }
                }
            } else {
                console.log(`Skipping main page - already exists: ${indexPath}`);
            }

            // Check and scrape subpages if needed
            for (const subpage of section.subpages) {
                const filename = path.basename(subpage, '.asp') + '.json';
                const filePath = path.join(sectionDir, filename);
                
                if (!fs.existsSync(filePath)) {
                    const subUrl = `${BASE_URL}${subpage}`;
                    console.log(`Scraping subpage: ${subUrl}`);
                    let subContent = null;
                    let retries = 3;
                    while (retries > 0 && !subContent) {
                        try {
                            subContent = await scrapePage(page, subUrl);
                            if (subContent) {
                                fs.writeFileSync(filePath, JSON.stringify(subContent, null, 2));
                                // Add longer delay between pages
                                console.log(`Waiting 20 seconds before next request...`);
                                await new Promise(resolve => setTimeout(resolve, 20000));
                                break;
                            }
                        } catch (error) {
                            console.error(`Error on attempt ${4-retries} for ${subUrl}:`, error);
                            retries--;
                            if (retries > 0) {
                                console.log(`Retrying in 30 seconds...`);
                                await new Promise(resolve => setTimeout(resolve, 30000));
                            }
                        }
                    }
                    if (!subContent) {
                        console.error(`Failed to scrape ${subUrl} after 3 attempts`);
                    }
                } else {
                    console.log(`Skipping subpage - already exists: ${filename}`);
                }
            }
        }
    } catch (error) {
        console.error('Error scraping Oxford Croquet:', error);
    } finally {
        await browser.close();
    }
}

async function scrapePage(page, url) {
    try {
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle0' });
        console.log('Page loaded, extracting content...');

        // Create directory for images if it doesn't exist
        const urlPath = new URL(url).pathname;
        const articleName = path.basename(urlPath, '.asp');
        const imagesDir = path.join(OUTPUT_DIR, 'images', articleName);
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }

        const content = await page.evaluate((pageUrl) => {
            // Get main content
            const mainContent = document.querySelector('body');
            if (!mainContent) return null;

            // Extract text content, preserving structure
            const text = mainContent.innerText;
            
            // Get all images with their context
            const images = Array.from(document.querySelectorAll('img'))
                .map(img => {
                    // Get the parent paragraph or div for context
                    const parent = img.closest('p, div');
                    
                    // Get surrounding paragraphs for more context
                    const prevParagraph = parent?.previousElementSibling?.tagName === 'P' ? 
                        parent.previousElementSibling.textContent.trim() : '';
                    const nextParagraph = parent?.nextElementSibling?.tagName === 'P' ? 
                        parent.nextElementSibling.textContent.trim() : '';
                    
                    // Get nearest heading for section context
                    let nearestHeading = '';
                    let currentElement = parent;
                    while (currentElement && !nearestHeading) {
                        currentElement = currentElement.previousElementSibling;
                        if (currentElement?.tagName.match(/^H[1-6]$/)) {
                            nearestHeading = currentElement.textContent.trim();
                        }
                    }

                    const beforeText = parent ? 
                        Array.from(parent.childNodes)
                            .filter(node => node.nodeType === 3 && node.previousSibling === img)
                            .map(node => node.textContent.trim())
                            .join(' ') : '';
                    const afterText = parent ? 
                        Array.from(parent.childNodes)
                            .filter(node => node.nodeType === 3 && node.nextSibling === img)
                            .map(node => node.textContent.trim())
                            .join(' ') : '';
                    
                    // Get any figure or diagram number if present
                    const figureMatch = (beforeText + afterText).match(/(?:Figure|Diagram)\s+(\d+)/i);
                    const figureNumber = figureMatch ? figureMatch[1] : null;
                    
                    return {
                        src: img.src,
                        alt: img.alt,
                        title: img.title,
                        width: img.width,
                        height: img.height,
                        context: {
                            section: nearestHeading,
                            beforeText,
                            afterText,
                            prevParagraph,
                            nextParagraph,
                            caption: img.nextElementSibling?.tagName.toLowerCase() === 'figcaption' ? 
                                img.nextElementSibling.textContent.trim() : null,
                            figureNumber,
                            parentText: parent ? parent.textContent.trim() : ''
                        },
                        metadata: {
                            originalName: img.src.split('/').pop(),
                            isDigram: /(?:figure|diagram)/i.test(beforeText + afterText),
                            hasCaption: img.nextElementSibling?.tagName.toLowerCase() === 'figcaption',
                            inParagraph: parent?.tagName === 'P'
                        }
                    };
                });

            // Get all links
            const links = Array.from(document.querySelectorAll('a'))
                .map(a => ({
                    text: a.textContent.trim(),
                    href: a.href
                }))
                .filter(link => link.text && link.href);

            // Get all paragraphs with their hierarchy
            const paragraphs = Array.from(document.querySelectorAll('p'))
                .map(p => ({
                    text: p.textContent.trim(),
                    className: p.className,
                    id: p.id,
                    hasImage: p.querySelector('img') !== null
                }))
                .filter(p => p.text.length > 0);

            // Get all headers with proper hierarchy
            const headers = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
                .map(h => ({
                    level: parseInt(h.tagName[1]),
                    text: h.textContent.trim(),
                    id: h.id
                }))
                .filter(h => h.text.length > 0);

            return {
                url: pageUrl,
                title: document.title,
                content: text,
                structure: {
                    paragraphs,
                    headers,
                    images
                },
                links,
                timestamp: new Date().toISOString()
            };
        }, url);

        // Download images
        if (content && content.structure.images) {
            console.log(`Found ${content.structure.images.length} images`);
            for (const [index, image] of content.structure.images.entries()) {
                if (!image.src) continue;
                
                const imageUrl = new URL(image.src);
                const imageExt = path.extname(imageUrl.pathname) || '.jpg';
                const imagePath = path.join(imagesDir, `image_${index}${imageExt}`);
                
                try {
                    await downloadImage(image.src, imagePath);
                    // Update the image source in the content to be relative
                    image.localPath = path.relative(OUTPUT_DIR, imagePath);
                    console.log(`Downloaded image: ${imagePath}`);
                } catch (err) {
                    console.error(`Failed to download image ${image.src}:`, err);
                    image.downloadError = err.message;
                }
            }
        }

        console.log('Content extracted successfully');
        return content;
    } catch (error) {
        console.error(`Error scraping page ${url}:`, error);
        return null;
    }
}

// Run the scraper
scrapeOxfordCroquet(); 