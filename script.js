// 幻灯片功能
let slideIndex = 1;
let slideInterval;

// 显示指定索引的幻灯片
function showSlides(n) {
    const slides = document.getElementsByClassName("mySlides");
    const dots = document.getElementsByClassName("dot");
    
    if (!slides.length || !dots.length) return;
    
    // 处理索引边界情况
    if (n > slides.length) {
        slideIndex = 1;
    }
    if (n < 1) {
        slideIndex = slides.length;
    }
    
    // 隐藏所有幻灯片
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
        // Reset animation by removing and re-adding the active class
        slides[i].classList.remove("active");
        
        // 暂停视频播放
        const video = slides[i].querySelector('video');
        if (video) {
            video.pause();
        }
    }
    
    // 移除所有导航点的激活类
    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active-dot", "");
    }
    
    // 显示当前幻灯片
    slides[slideIndex-1].style.display = "block";
    // Add active class after a small delay to trigger animations
    setTimeout(() => {
        slides[slideIndex-1].classList.add("active");
    }, 10);
    
    // 播放当前幻灯片的视频
    const currentVideo = slides[slideIndex-1].querySelector('video');
    if (currentVideo) {
        currentVideo.play().catch(e => {
            // 处理自动播放失败的情况
            console.log('Video autoplay failed:', e);
        });
        
        // 移除之前的事件监听器（如果存在）
        if (currentVideo.videoEndHandler) {
            currentVideo.removeEventListener('ended', currentVideo.videoEndHandler);
        }
        
        // 添加新的视频结束事件监听器
        currentVideo.videoEndHandler = function() {
            // 视频播放完成后自动跳到下一张幻灯片
            setTimeout(() => {
                plusSlides(1);
            }, 1000); // 延迟1秒后跳转
        };
        
        currentVideo.addEventListener('ended', currentVideo.videoEndHandler);
    }
    
    dots[slideIndex-1].className += " active-dot";
}

// 切换到下一张或上一张幻灯片
function plusSlides(n) {
    showSlides(slideIndex += n);
}

// 切换到指定幻灯片
function currentSlide(n) {
    showSlides(slideIndex = n);
}

// 自动切换到下一张幻灯片
function autoSlide() {
    plusSlides(1);
}

// 重置自动切换计时器
function resetAutoSlide() {
    // 清除现有计时器
    clearInterval(slideInterval);
    
    // 检查当前幻灯片是否包含视频
    const slides = document.getElementsByClassName("mySlides");
    const currentSlide = slides[slideIndex-1];
    const hasVideo = currentSlide && currentSlide.querySelector('video');
    
    // 如果当前幻灯片没有视频，则设置自动切换
    if (!hasVideo) {
        slideInterval = setInterval(autoSlide, 5000);
    }
}

// 初始化幻灯片
function initSlideshow() {
    showSlides(slideIndex);
    resetAutoSlide();
    
    // 添加鼠标悬停事件
    const container = document.querySelector(".slideshow-container");
    if (container) {
        container.addEventListener("mouseenter", function() {
            clearInterval(slideInterval);
        });
        
        container.addEventListener("mouseleave", function() {
            resetAutoSlide();
        });
    }
    
    // 添加视频点击事件
    const clickableVideos = document.querySelectorAll('.clickable-video');
    clickableVideos.forEach(video => {
        video.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 跳转到视频播放页面
            window.location.href = 'pages/video-player.html';
        });
        
        // 添加鼠标悬停效果
        video.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        video.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // 添加触摸滑动支持
    let touchStartX = 0;
    let touchEndX = 0;
    
    if (container) {
        container.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        container.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
    }
    
    function handleSwipe() {
        if (touchEndX < touchStartX) {
            // 向左滑动 - 下一张
            plusSlides(1);
        } else if (touchEndX > touchStartX) {
            // 向右滑动 - 上一张
            plusSlides(-1);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize slideshow
    initSlideshow();
    
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

            // Get the 8 most recent publications
            const recentPublications = publications.slice(0, 8);

            // Group the recent publications by year
            const pubsByYear = {};
            recentPublications.forEach(pub => {
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
        
        // Add date and content to the news item
        newsElement.appendChild(dateElement);
        newsElement.appendChild(contentElement);
        
        // Add the news item to the container
        container.appendChild(newsElement);
    });
} 