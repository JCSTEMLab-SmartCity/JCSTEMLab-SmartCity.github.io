// Hero Slider Logic
let heroIndex = 0;
let heroInterval;
const jsonCache = new Map();

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

function ensureHeroVideoLoaded(video) {
    if (video && video.dataset.src && !video.getAttribute('src')) {
        video.src = video.dataset.src;
        video.load();
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
        const videos = document.querySelectorAll('.hero-bg-video');
        videos.forEach(v => v.pause());

        const video = activeSlide.querySelector('.hero-bg-video');
        if (video) {
            ensureHeroVideoLoaded(video);
            video.currentTime = 0;
            video.play().catch(e => console.log('Autoplay prevented', e));
            video.muted = true; // Force mute initially for policy
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
    const intervalMs = Number(current?.dataset.autoplayMs) || 6000;
    heroInterval = setInterval(() => moveHero(1), intervalMs);
}

function stopHeroAuto() {
    clearInterval(heroInterval);
}

document.addEventListener('DOMContentLoaded', function () {
    // Initialize slideshow
    // Initialize Hero
    initHero();

    // Load profile info
    loadProfileInfo();

    // Homepage sections are loaded lazily to avoid blocking first paint.
    if (document.getElementById('news-container') || document.getElementById('publications-container')) {
        setupDeferredHomepageLoading();
    }

    // All news page specific
    if (document.getElementById('all-news-container')) {
        loadAllNews();
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

function fetchJsonCached(path) {
    if (!jsonCache.has(path)) {
        jsonCache.set(path, fetch(path).then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${path}: ${response.status}`);
            }
            return response.json();
        }));
    }

    return jsonCache.get(path);
}

function resolveDataPath(fileName) {
    return window.location.pathname.includes('/pages/') ? `../data/${fileName}` : `data/${fileName}`;
}

function scheduleIdleTask(callback, timeout = 1200) {
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(callback, { timeout });
        return;
    }

    window.setTimeout(callback, timeout);
}

function setupDeferredHomepageLoading() {
    const jobs = [
        {
            key: 'publications',
            element: document.getElementById('publications'),
            loader: loadHomepagePublications
        },
        {
            key: 'news',
            element: document.getElementById('latest-news'),
            loader: loadLatestNews
        }
    ];

    const loaded = new Set();
    const runJob = job => {
        if (!job || loaded.has(job.key)) return;
        loaded.add(job.key);
        job.loader();
    };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const job = jobs.find(item => item.element === entry.target);
                if (job) {
                    runJob(job);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '600px 0px',
            threshold: 0.01
        });

        jobs.forEach(job => {
            if (job.element) {
                observer.observe(job.element);
            }
        });
    } else {
        jobs.forEach((job, index) => {
            scheduleIdleTask(() => runJob(job), 600 + index * 250);
        });
    }

    jobs.forEach((job, index) => {
        scheduleIdleTask(() => runJob(job), 900 + index * 350);
    });
}

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

function loadLatestNews() {
    fetchJsonCached(resolveDataPath('news.json'))
        .then(data => {
            renderNewsItems(data, 'news-container', 12);
        })
        .catch(error => {
            console.error('Error loading news:', error);
            const container = document.getElementById('news-container');
            if (container) {
                container.innerHTML = '<p class="no-publications">Unable to load the latest news right now.</p>';
            }
        });
}

function loadAllNews() {
    fetchJsonCached(resolveDataPath('news.json'))
        .then(data => {
            setupNewsFilters(data);
            renderNewsItems(data, 'all-news-container', Infinity);
        })
        .catch(error => console.error('Error loading all news:', error));
}

const NEWS_CATEGORY_ORDER = ['Career', 'Awards', 'Events', 'Service', 'Visits', 'Media', 'Research', 'Others'];

function setupNewsFilters(newsData) {
    const filtersContainer = document.getElementById('news-filters');
    if (!filtersContainer) return;

    const categories = Array.from(new Set(newsData.map(item => item.category || 'Others')));
    const orderedCategories = NEWS_CATEGORY_ORDER
        .filter(category => categories.includes(category))
        .concat(categories.filter(category => !NEWS_CATEGORY_ORDER.includes(category)).sort());

    filtersContainer.innerHTML = '';

    const createFilterButton = (label, category) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'filter-btn';
        button.dataset.category = category;
        button.textContent = label;

        button.addEventListener('click', () => {
            filtersContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filteredNews = category === 'all'
                ? newsData
                : newsData.filter(item => (item.category || 'Others') === category);
            renderNewsItems(filteredNews, 'all-news-container', Infinity);
        });

        filtersContainer.appendChild(button);
    };

    createFilterButton('All', 'all');
    orderedCategories.forEach(category => createFilterButton(category, category));

    const allButton = filtersContainer.querySelector('[data-category="all"]');
    if (allButton) allButton.classList.add('active');
}

function loadHomepagePublications() {
    const container = document.getElementById('publications-container');
    if (!container) return;

    fetchJsonCached(resolveDataPath('publications.json'))
        .then(publications => {
            const currentYear = parseInt(new Date().getFullYear(), 10);
            const lastYear = currentYear - 1;
            const recentPublications = publications.filter(pub => {
                const pubYear = parseInt(pub.year, 10);
                return pubYear === currentYear || pubYear === lastYear;
            });

            const pubsByYear = {};
            recentPublications.forEach(pub => {
                const year = pub.year;
                if (!pubsByYear[year]) {
                    pubsByYear[year] = [];
                }
                pubsByYear[year].push(pub);
            });

            const years = Object.keys(pubsByYear).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
            container.innerHTML = '';

            if (!years.length) {
                container.innerHTML = '<p class="no-publications">No publications available for the recent years.</p>';
                return;
            }

            const fragment = document.createDocumentFragment();

            years.forEach(year => {
                const yearSection = document.createElement('div');
                const yearTitle = document.createElement('h3');
                yearTitle.className = 'year-divider';
                yearTitle.textContent = `Accepted Papers in ${year}`;

                const publicationsList = document.createElement('div');
                publicationsList.className = 'publications-list';
                publicationsList.id = `publications-${year}`;

                yearSection.appendChild(yearTitle);
                yearSection.appendChild(publicationsList);
                fragment.appendChild(yearSection);
            });

            container.appendChild(fragment);

            years.forEach(year => {
                const publicationsList = document.getElementById(`publications-${year}`);
                renderPublications(pubsByYear[year], publicationsList);
            });
        })
        .catch(error => {
            console.error('Error loading publications data:', error);
            container.innerHTML = '<p class="no-publications">Unable to load recent publications right now.</p>';
        });
}

// Function to load publications from JSON
function loadPublications() {
    const publicationsJsonPath = resolveDataPath('publications.json');
    const publicationsList = document.querySelector('.publications-list');
    if (!publicationsList) return;

    fetchJsonCached(publicationsJsonPath)
        .then(publications => {
            renderPublications(publications, publicationsList);
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
    const fragment = document.createDocumentFragment();

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
            const venueTag = (pub.tags || []).find(tag => tag.class === 'venue-tag');
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

        (pub.tags || []).forEach(tag => {
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
        fragment.appendChild(pubElement);
    });

    container.appendChild(fragment);
}

// Function to generate gallery HTML
function generateGalleryHTML(images) {
    if (!images || images.length === 0) return '';

    const imageWidth = 280; // Fixed image width in pixels
    const totalWidth = images.length * imageWidth;
    const gaps = images.length - 1; // Number of gaps between images

    const galleryClass = images.length === 1 ? 'news-gallery single' : 'news-gallery';
    let galleryHtml = `<div class="${galleryClass}">`;

    images.forEach((imgSrc, index) => {
        // Calculate z-index: first image has highest z-index, last image has lowest
        // z-index decreases from images.length (first) to 1 (last)
        const zIndex = images.length - index;

        // First image doesn't need margin-left
        if (index === 0) {
            galleryHtml += `
                <a href="${imgSrc}" target="_blank" class="news-gallery-item" style="z-index: ${zIndex};">
                    <img src="${imgSrc}" alt="News Photo" class="news-gallery-img" loading="lazy" decoding="async">
                </a>
            `;
        } else {
            // Dynamic margin calculation: min(-60px, calc((100% - totalWidth) / gaps))
            // This ensures images don't overflow while maintaining overlap on wider screens
            const dynamicMargin = `min(-60px, calc((100% - ${totalWidth}px) / ${gaps}))`;
            galleryHtml += `
                <a href="${imgSrc}" target="_blank" class="news-gallery-item" style="margin-left: ${dynamicMargin}; z-index: ${zIndex};">
                    <img src="${imgSrc}" alt="News Photo" class="news-gallery-img" loading="lazy" decoding="async">
                </a>
            `;
        }
    });

    galleryHtml += '</div>';
    return galleryHtml;
}

function setupDeferredGalleryLoading(container) {
    if (!container) return;

    const placeholders = Array.from(container.querySelectorAll('.news-gallery-placeholder[data-images]'));
    if (!placeholders.length) return;

    const hydrateGallery = placeholder => {
        if (!placeholder || placeholder.dataset.loaded === 'true') return;
        placeholder.dataset.loaded = 'true';

        try {
            const images = JSON.parse(placeholder.dataset.images || '[]');
            placeholder.innerHTML = generateGalleryHTML(images);
        } catch (error) {
            console.error('Error hydrating news gallery:', error);
        }
    };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                hydrateGallery(entry.target);
                observer.unobserve(entry.target);
            });
        }, {
            rootMargin: '250px 0px',
            threshold: 0.01
        });

        placeholders.forEach(placeholder => observer.observe(placeholder));
        return;
    }

    placeholders.forEach(placeholder => hydrateGallery(placeholder));
}

// Function to render news items
function renderNewsItems(newsData, containerId, limit = 8) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';
    const items = newsData.slice(0, limit);
    const deferGalleries = containerId === 'news-container';
    const batchSize = containerId === 'news-container' ? 4 : 10;
    let index = 0;

    const appendBatch = () => {
        const fragment = document.createDocumentFragment();

        items.slice(index, index + batchSize).forEach(newsItem => {
            const newsElement = document.createElement('div');
            newsElement.className = 'news-item';

            const dateElement = document.createElement('div');
            dateElement.className = 'news-date';

            const dateHighlight = document.createElement('span');
            dateHighlight.className = 'year-highlight';
            dateHighlight.textContent = newsItem.date;
            dateElement.appendChild(dateHighlight);

            const contentElement = document.createElement('div');
            contentElement.className = 'news-content';

            const titleElement = document.createElement('h3');
            const categoryElement = document.createElement('span');
            categoryElement.className = 'news-category';
            categoryElement.textContent = `${newsItem.category || 'Others'} | `;
            titleElement.appendChild(categoryElement);

            if (newsItem.title && newsItem.title.includes('<a href=')) {
                titleElement.insertAdjacentHTML('beforeend', newsItem.title);
            } else {
                titleElement.appendChild(document.createTextNode(newsItem.title));
            }
            contentElement.appendChild(titleElement);

            const paragraphElement = document.createElement('p');
            let contentHtml = newsItem.content;
            if (window.location.pathname.includes('/pages/')) {
                contentHtml = contentHtml.replace(/href="pages\//g, 'href="');
                contentHtml = contentHtml.replace(/src="assets\//g, 'src="../assets/');
                contentHtml = contentHtml.replace(/href="assets\//g, 'href="../assets/');
            }

            paragraphElement.innerHTML = contentHtml;

            if (newsItem.links && newsItem.links.length > 0) {
                newsItem.links.forEach(link => {
                    paragraphElement.appendChild(document.createTextNode(' '));
                    const linkElement = document.createElement('a');
                    linkElement.href = link.url;
                    linkElement.textContent = link.text;
                    linkElement.target = "_blank";
                    linkElement.rel = "noopener noreferrer";
                    paragraphElement.appendChild(linkElement);
                });
            }

            if (newsItem.link && newsItem.linkText) {
                paragraphElement.appendChild(document.createTextNode(' '));
                const linkElement = document.createElement('a');
                linkElement.href = newsItem.link;
                linkElement.textContent = newsItem.linkText;
                linkElement.target = "_blank";
                linkElement.rel = "noopener noreferrer";
                paragraphElement.appendChild(linkElement);
            }

            contentElement.appendChild(paragraphElement);

            if (newsItem.images && newsItem.images.length > 0) {
                const galleryContainer = document.createElement('div');

                if (deferGalleries) {
                    galleryContainer.className = 'news-gallery-placeholder';
                    galleryContainer.dataset.images = JSON.stringify(newsItem.images);
                } else {
                    galleryContainer.innerHTML = generateGalleryHTML(newsItem.images);
                }

                contentElement.appendChild(galleryContainer);
            }

            newsElement.appendChild(dateElement);
            newsElement.appendChild(contentElement);
            fragment.appendChild(newsElement);
        });

        container.appendChild(fragment);
        if (deferGalleries) {
            setupDeferredGalleryLoading(container);
        }

        index += batchSize;
        if (index < items.length) {
            window.requestAnimationFrame(appendBatch);
        }
    };

    appendBatch();
} 
