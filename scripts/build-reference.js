const fs = require('fs');
const path = require('path');

// Import the historical data
const { historicalData, theoristCategories } = require('../fix-duplicate-answers.js');

// HTML template
const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Critical Theory Historical Reference</title>
    <style>
        :root {
            --primary-color: #7D6EFF;
            --secondary-color: #FF61D8;
            --text-color: #2A2A2A;
            --bg-color: #F5F5F7;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background: var(--bg-color);
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }

        header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--bg-color);
        }

        h1 {
            background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .meta-info {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 20px;
        }

        .theorist-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .theorist-card {
            background: white;
            border: 1px solid #eee;
            border-radius: 8px;
            padding: 20px;
            transition: transform 0.2s ease;
        }

        .theorist-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .theorist-name {
            color: var(--primary-color);
            font-size: 1.2em;
            margin: 0 0 10px 0;
        }

        .active-period {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 10px;
        }

        .major-works {
            margin-top: 15px;
        }

        .work-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 0.9em;
            padding: 5px 0;
            border-bottom: 1px solid #f5f5f5;
        }

        .work-year {
            color: var(--secondary-color);
            font-weight: 500;
            margin-left: 15px;
        }

        .category-section {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid var(--bg-color);
        }

        .category-title {
            color: var(--primary-color);
            margin-bottom: 20px;
            text-align: center;
        }

        .category-card {
            background: white;
            border: 1px solid #eee;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
        }

        .category-card h3 {
            color: var(--secondary-color);
            margin: 0 0 10px 0;
            font-size: 1.1em;
        }

        .category-card p {
            margin: 0;
            font-size: 0.9em;
            color: #666;
        }

        footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid var(--bg-color);
            color: #666;
            font-size: 0.9em;
        }

        .search-section {
            margin: 20px 0;
            text-align: center;
        }

        #search {
            width: 100%;
            max-width: 500px;
            padding: 12px 20px;
            border: 2px solid var(--bg-color);
            border-radius: 25px;
            font-size: 16px;
            transition: all 0.3s ease;
        }

        #search:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(125, 110, 255, 0.1);
        }

        .filter-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 20px 0;
            justify-content: center;
        }

        .filter-tag {
            background: var(--bg-color);
            border: none;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .filter-tag:hover {
            background: var(--primary-color);
            color: white;
        }

        .filter-tag.active {
            background: var(--primary-color);
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Critical Theory Historical Reference</h1>
            <div class="meta-info">
                Compiled by Claude 3.5 Sonnet (anthropic-ai/claude-3-sonnet@20240229)<br>
                Last Updated: March 2024
            </div>
            <p>A comprehensive reference of critical theorists, their active periods, and major works.</p>
        </header>

        <div class="search-section">
            <input type="text" id="search" placeholder="Search theorists, works, or concepts...">
            <div class="filter-tags">
                <button class="filter-tag active" data-period="all">All</button>
                <button class="filter-tag" data-period="1900-1950">1900-1950</button>
                <button class="filter-tag" data-period="1950-1980">1950-1980</button>
                <button class="filter-tag" data-period="1980-2000">1980-2000</button>
                <button class="filter-tag" data-period="2000-present">2000-Present</button>
            </div>
        </div>

        <div class="theorist-grid">
            ${Object.entries(historicalData)
              .map(([name, data]) => `
                <div class="theorist-card">
                    <h3 class="theorist-name">${name}</h3>
                    <div class="active-period">
                        Active: ${data.active[0]} - ${data.active[1] || 'Present'}
                    </div>
                    <div class="major-works">
                        ${Object.entries(data.major_works)
                          .map(([work, year]) => `
                            <div class="work-item">
                                <span>${work}</span>
                                <span class="work-year">${year}</span>
                            </div>
                          `).join('')}
                    </div>
                </div>
              `).join('')}
        </div>

        <div class="category-section">
            <h2 class="category-title">Theoretical Categories</h2>
            ${Object.entries(theoristCategories)
              .map(([category, theorists]) => `
                <div class="category-card">
                    <h3>${category.replace('_', ' ').toUpperCase()}</h3>
                    <p>${theorists.join(', ')}</p>
                </div>
              `).join('')}
        </div>

        <footer>
            <p>Part of the Art Theory Quiz project</p>
            <p>Data curated for historical accuracy and educational purposes</p>
        </footer>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const search = document.getElementById('search');
            const cards = document.querySelectorAll('.theorist-card');
            const tags = document.querySelectorAll('.filter-tag');
            
            search.addEventListener('input', filterCards);
            tags.forEach(tag => tag.addEventListener('click', handleTagClick));
            
            function filterCards() {
                const searchTerm = search.value.toLowerCase();
                const activePeriod = document.querySelector('.filter-tag.active').dataset.period;
                
                cards.forEach(card => {
                    const text = card.textContent.toLowerCase();
                    const year = parseInt(card.querySelector('.active-period').textContent.match(/\\d+/)[0]);
                    
                    const matchesSearch = text.includes(searchTerm);
                    const matchesPeriod = activePeriod === 'all' || matchesTimePeriod(year, activePeriod);
                    
                    card.style.display = matchesSearch && matchesPeriod ? 'block' : 'none';
                });
            }
            
            function handleTagClick(e) {
                tags.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                filterCards();
            }
            
            function matchesTimePeriod(year, period) {
                const [start, end] = period.split('-').map(p => p === 'present' ? 2024 : parseInt(p));
                return year >= start && year <= end;
            }
        });
    </script>
</body>
</html>
`;

// Write the file
const outputPath = path.join(__dirname, '../public/critical-theory-reference.html');
fs.writeFileSync(outputPath, template);
console.log('Reference page built successfully!'); 