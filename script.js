// Hero Slider Logic
let heroIndex = 0;
let heroInterval;

function initHero() {
    const slides = document.querySelectorAll('.hero-item');
    const dotsContainer = document.querySelector('.hero-dots');

    if (!slides.length) return;

    // Create dots if container exists and is empty (or just rebuild)
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = i === 0 ? 'dot active' : 'dot';
            dot.onclick = () => setHero(i);
            dotsContainer.appendChild(dot);
        });
    }

    // Controls listeners
    const prevBtn = document.querySelector('.hero-btn.prev');
    const nextBtn = document.querySelector('.hero-btn.next');
    if (prevBtn) prevBtn.onclick = () => moveHero(-1);
    if (nextBtn) nextBtn.onclick = () => moveHero(1);

    showHero(heroIndex);
    startHeroAuto();

    const slider = document.querySelector('.hero-slider');
    if (slider) {
        slider.addEventListener('mouseenter', stopHeroAuto);
        slider.addEventListener('mouseleave', startHeroAuto);

        // Touch events
        let touchStartX = 0;
        let touchEndX = 0;
        slider.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, false);
        slider.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 50) moveHero(1);
            if (touchEndX > touchStartX + 50) moveHero(-1);
        }, false);
    }
}

function showHero(n) {
    const slides = document.querySelectorAll('.hero-item');
    const dots = document.querySelectorAll('.hero-dots .dot');

    if (!slides.length) return;

    if (n >= slides.length) heroIndex = 0;
    if (n < 0) heroIndex = slides.length - 1;

    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    slides[heroIndex].classList.add('active');
    if (dots[heroIndex]) dots[heroIndex].classList.add('active');

    // Video handling
    const activeSlide = slides[heroIndex];
    if (activeSlide) {
        const videos = document.querySelectorAll('video');
        videos.forEach(v => v.pause());

        const video = activeSlide.querySelector('video');
        if (video) {
            video.currentTime = 0;
            video.play().catch(e => console.log('Autoplay prevented', e));
            video.muted = true; // Force mute initially for policy
            // Optional: Unmute on click handled by specific listener logic if adding one, 
            // but for now simple autoplay loop
        }
    }
}

function moveHero(n) {
    heroIndex += n;
    showHero(heroIndex);
    startHeroAuto(); // Reset timer
}

function setHero(n) {
    heroIndex = n;
    showHero(heroIndex);
    startHeroAuto();
}

function startHeroAuto() {
    stopHeroAuto();
    const slides = document.querySelectorAll('.hero-item');
    if (!slides.length) return;

    const current = slides[heroIndex];
    if (current && current.classList.contains('video-slide')) {
        const video = current.querySelector('video');
        if (video && !video.paused) {
            video.onended = () => moveHero(1);
            return;
        }
    }
    heroInterval = setInterval(() => moveHero(1), 6000);
}

function stopHeroAuto() {
    clearInterval(heroInterval);
    const slides = document.querySelectorAll('.hero-item');
    if (slides.length && slides[heroIndex]) {
        const video = slides[heroIndex].querySelector('video');
        if (video) video.onended = null;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Initialize slideshow
    // Initialize Hero
    initHero();

    // Load profile info
    loadProfileInfo();

    // Load publications
    loadPublications();

    // Load news items
    if (document.getElementById('news-container')) {
        fetch('data/news.json')
            .then(response => response.json())
            .then(data => {
                renderNewsItems(data, 'news-container', 8); // Show the most recent 8 news items
            })
            .catch(error => console.error('Error loading news:', error));
    }

    // All news page specific
    if (document.getElementById('all-news-container')) {
        fetch('../data/news.json')
            .then(response => response.json())
            .then(data => {
                renderNewsItems(data, 'all-news-container', Infinity); // Show ALL news items, no limit
            })
            .catch(error => console.error('Error loading all news:', error));
    }

    // Navigation active link handling
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');

    // Don't setup scroll spy for external pages
    const nav = document.querySelector('nav');

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        window.addEventListener('scroll', () => {
            let current = '';

            // Find the current section
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            // Activate the corresponding nav link
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}` ||
                    (current === 'slideshow' && link.getAttribute('href') === '#about')) {
                    link.classList.add('active');
                }

                // Skip external page links (like team.html)
                if (!link.getAttribute('href').startsWith('#')) {
                    link.classList.remove('active');
                }
            });
        });
    }
});

// Function to load profile information
function loadProfileInfo() {
    let profileJsonPath = 'data/profile-info.json';
    let isSubpage = window.location.pathname.includes('/pages/');
    if (isSubpage) {
        profileJsonPath = '../data/profile-info.json';
    }

    // Get profile-info container
    const profileInfoContainer = document.querySelector('.profile-info');
    if (!profileInfoContainer) return;

    fetch(profileJsonPath)
        .then(response => response.json())
        .then(data => {
            // Clear existing content
            profileInfoContainer.innerHTML = '';

            // Add name
            const nameElement = document.createElement('h1');
            nameElement.textContent = data.name;
            profileInfoContainer.appendChild(nameElement);

            // Add subtitle
            const subtitleElement = document.createElement('p');
            subtitleElement.className = 'subtitle';
            subtitleElement.innerHTML = processChinese(data.subtitle);
            profileInfoContainer.appendChild(subtitleElement);

            // Add social links container
            const contactInfo = document.createElement('div');
            contactInfo.className = 'contact-info';

            // Add each social link
            data.socialLinks.forEach(link => {
                const linkContainer = document.createElement('p');
                const anchor = document.createElement('a');
                // Adjust URL paths for subpages
                if (isSubpage && link.url.startsWith('assets/')) {
                    anchor.href = '../' + link.url;
                } else {
                    anchor.href = link.url;
                }

                if (link.target) {
                    anchor.target = link.target;
                }

                // Fix SVG icon paths for subpages
                let iconHtml = link.icon;
                if (isSubpage && link.type === 'dblp') {
                    iconHtml = iconHtml.replace('src="assets/', 'src="../assets/');
                }

                anchor.innerHTML = iconHtml;
                linkContainer.appendChild(anchor);
                contactInfo.appendChild(linkContainer);
            });

            profileInfoContainer.appendChild(contactInfo);

            // Update profile image if there's a profile-image container
            const profileImageContainer = document.querySelector('.profile-image img');
            if (profileImageContainer && data.profileImage) {
                profileImageContainer.src = isSubpage ?
                    '../' + data.profileImage : data.profileImage;
                profileImageContainer.alt = data.name;
            }
        })
        .catch(error => {
            console.error('Error loading profile information:', error);
        });
}

// Helper: Wrap Chinese characters in a span for font styling
function processChinese(text) {
    if (!text) return text;
    return text.replace(/([\u4e00-\u9fa5]+)/g, '<span class="chinese-text">$1</span>');
}

// Function to load publications from JSON
function loadPublications() {
    let publicationsJsonPath = 'data/publications.json';
    if (window.location.pathname.includes('/pages/')) {
        publicationsJsonPath = '../data/publications.json';
    }

    // Check if we're on the homepage or publications page
    const isHomepage = !window.location.pathname.includes('/pages/publications.html');

    fetch(publicationsJsonPath)
        .then(response => response.json())
        .then(publications => {
            // If on publications page, handle like before
            if (!isHomepage) {
                const publicationsList = document.querySelector('.publications-list');
                if (publicationsList) {
                    renderPublications(publications, publicationsList);
                }
                return;
            }

            // Sort publications by year in descending order
            publications.sort((a, b) => {
                return parseInt(b.year) - parseInt(a.year);
            });

            // Filter publications for current year only (2025)
            const currentYear = new Date().getFullYear().toString();
            const currentYearPublications = publications.filter(pub => pub.year === currentYear);

            // Group the current year publications by year
            const pubsByYear = {};
            currentYearPublications.forEach(pub => {
                if (!pubsByYear[pub.year]) {
                    pubsByYear[pub.year] = [];
                }
                pubsByYear[pub.year].push(pub);
            });

            // Get years in descending order
            const years = Object.keys(pubsByYear).sort((a, b) => b - a);

            // Render publications for each year
            years.forEach(year => {
                const yearContainer = document.getElementById(`publications-${year}`);
                if (yearContainer) {
                    yearContainer.innerHTML = ''; // Clear existing content
                    renderPublications(pubsByYear[year], yearContainer);
                }
            });
        })
        .catch(error => {
            console.error('Error loading publications data:', error);
        });
}

// Helper function to render publications to a specific container
function renderPublications(publications, container) {
    if (!container) return;

    // Counter for auto-numbering publications
    let counter = 1;

    publications.forEach(pub => {
        const pubElement = document.createElement('div');
        const classes = ['publication', pub.type];
        if (pub.isFirstAuthor) classes.push('first-author');
        pubElement.className = classes.join(' ');

        // Create venue/type label for left side
        const venueElement = document.createElement('div');
        venueElement.className = 'pub-venue-label';

        // Determine what text to show in the left column
        let venueText = '';
        if (pub.type === 'preprint') {
            venueText = 'Preprint';
        } else if (pub.venue) {
            // Extract short venue name from the venue string or tags
            const venueTag = pub.tags.find(tag => tag.class === 'venue-tag');
            venueText = venueTag ? venueTag.text : pub.venue.split(',')[0].split(' ').pop();
        }

        // Create publication number
        const numberElement = document.createElement('span');
        numberElement.className = 'pub-number';
        numberElement.textContent = counter++;

        venueElement.appendChild(numberElement);

        // Add venue text below the number
        const venueTextElement = document.createElement('span');
        venueTextElement.className = 'venue-text';
        venueTextElement.textContent = venueText;
        venueElement.appendChild(venueTextElement);

        // Create publication content container
        const contentElement = document.createElement('div');
        contentElement.className = 'pub-content';

        // Add title
        const titleElement = document.createElement('h3');
        titleElement.textContent = pub.title;
        contentElement.appendChild(titleElement);

        // Add authors
        const authorsElement = document.createElement('p');
        authorsElement.className = 'authors';
        authorsElement.innerHTML = pub.authors;
        contentElement.appendChild(authorsElement);

        // Add full venue if it exists (for accepted papers)
        if (pub.venue) {
            const fullVenueElement = document.createElement('p');
            fullVenueElement.className = 'venue';
            fullVenueElement.textContent = pub.venue;
            contentElement.appendChild(fullVenueElement);
        }

        // Add tags
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'pub-tags';

        pub.tags.forEach(tag => {
            // Skip venue tag as we're now showing it on the left
            if (tag.class === 'venue-tag') return;

            if (tag.link) {
                const tagLink = document.createElement('a');
                tagLink.href = tag.link;
                tagLink.className = `tag ${tag.class}`;
                tagLink.textContent = tag.text;
                tagLink.target = "_blank";
                tagLink.rel = "noopener noreferrer";
                tagsContainer.appendChild(tagLink);
            } else {
                const tagSpan = document.createElement('span');
                tagSpan.className = `tag ${tag.class}`;
                tagSpan.textContent = tag.text;
                tagsContainer.appendChild(tagSpan);
            }
        });

        contentElement.appendChild(tagsContainer);

        // Combine elements and add to publications list
        pubElement.appendChild(venueElement);
        pubElement.appendChild(contentElement);
        container.appendChild(pubElement);
    });
}

// Function to generate gallery HTML
function generateGalleryHTML(images) {
    if (!images || images.length === 0) return '';

    const imageWidth = 280; // Fixed image width in pixels
    const totalWidth = images.length * imageWidth;
    const gaps = images.length - 1; // Number of gaps between images

    let galleryHtml = '<div class="news-gallery">';

    images.forEach((imgSrc, index) => {
        // Calculate z-index: first image has highest z-index, last image has lowest
        // z-index decreases from images.length (first) to 1 (last)
        const zIndex = images.length - index;

        // First image doesn't need margin-left
        if (index === 0) {
            galleryHtml += `
                <a href="${imgSrc}" target="_blank" class="news-gallery-item" style="z-index: ${zIndex};">
                    <img src="${imgSrc}" alt="News Photo" class="news-gallery-img">
                </a>
            `;
        } else {
            // Dynamic margin calculation: min(-60px, calc((100% - totalWidth) / gaps))
            // This ensures images don't overflow while maintaining overlap on wider screens
            const dynamicMargin = `min(-60px, calc((100% - ${totalWidth}px) / ${gaps}))`;
            galleryHtml += `
                <a href="${imgSrc}" target="_blank" class="news-gallery-item" style="margin-left: ${dynamicMargin}; z-index: ${zIndex};">
                    <img src="${imgSrc}" alt="News Photo" class="news-gallery-img">
                </a>
            `;
        }
    });

    galleryHtml += '</div>';
    return galleryHtml;
}

// Function to render news items
function renderNewsItems(newsData, containerId, limit = 8) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';

    // Add each news item to the container
    newsData.slice(0, limit).forEach(newsItem => {
        const newsElement = document.createElement('div');
        newsElement.className = 'news-item';

        // Create the date element
        const dateElement = document.createElement('div');
        dateElement.className = 'news-date';

        const dateHighlight = document.createElement('span');
        dateHighlight.className = 'year-highlight';
        dateHighlight.textContent = newsItem.date;
        dateElement.appendChild(dateHighlight);

        // Create the content element
        const contentElement = document.createElement('div');
        contentElement.className = 'news-content';

        // Create the title element
        const titleElement = document.createElement('h3');

        // Check if title contains HTML (like '<a href=')
        if (newsItem.title && newsItem.title.includes('<a href=')) {
            // Parse HTML in title
            titleElement.innerHTML = newsItem.title;
        } else {
            titleElement.textContent = newsItem.title;
        }

        contentElement.appendChild(titleElement);

        // Create the paragraph for content
        const paragraphElement = document.createElement('p');
        paragraphElement.innerHTML = newsItem.content;

        // Add links if provided in the links array format
        if (newsItem.links && newsItem.links.length > 0) {
            newsItem.links.forEach(link => {
                // Add a space if needed
                const space = document.createTextNode(' ');
                paragraphElement.appendChild(space);

                // Create link
                const linkElement = document.createElement('a');
                linkElement.href = link.url;
                linkElement.textContent = link.text;
                linkElement.target = "_blank";
                linkElement.rel = "noopener noreferrer";
                paragraphElement.appendChild(linkElement);
            });
        }

        // Check for old style link (backward compatibility)
        if (newsItem.link && newsItem.linkText) {
            const space = document.createTextNode(' ');
            paragraphElement.appendChild(space);

            const linkElement = document.createElement('a');
            linkElement.href = newsItem.link;
            linkElement.textContent = newsItem.linkText;
            linkElement.target = "_blank";
            linkElement.rel = "noopener noreferrer";
            paragraphElement.appendChild(linkElement);
        }

        contentElement.appendChild(paragraphElement);

        // Append Gallery if images exist
        if (newsItem.images && newsItem.images.length > 0) {
            const galleryContainer = document.createElement('div');
            galleryContainer.innerHTML = generateGalleryHTML(newsItem.images);
            contentElement.appendChild(galleryContainer);
        }

        // Add date and content to the news item
        newsElement.appendChild(dateElement);
        newsElement.appendChild(contentElement);

        // Add the news item to the container
        container.appendChild(newsElement);
    });
} 