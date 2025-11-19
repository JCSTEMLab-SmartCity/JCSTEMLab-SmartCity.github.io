/**
 * Team Members Loader
 * 动态从 JSON 文件加载团队成员数据并渲染到页面
 */

document.addEventListener('DOMContentLoaded', function() {
    loadTeamMembers();
    
    // 设置版权年份
    document.getElementById('copyright-year').textContent = new Date().getFullYear();
    
    // 处理导航栏水平滚动
    handleNavScrolling();
});

/**
 * 加载团队成员数据并渲染到页面
 */
function loadTeamMembers() {
    fetch('../data/team-members.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Unable to load team members data: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            renderTeamStructure(data);
        })
        .catch(error => {
            console.error('Error loading team members data:', error);
            document.querySelector('main').innerHTML = `
                <div class="container text-center" style="padding: 50px 20px;">
                    <h2>Error loading team members data</h2>
                    <p>${error.message}</p>
                    <a href="../index.html" class="btn btn-primary">Back to Homepage</a>
                </div>
            `;
        });
}

/**
 * 渲染整个团队结构
 * @param {Object} data - 团队成员数据
 */
function renderTeamStructure(data) {
    const mainContainer = document.querySelector('main');
    mainContainer.innerHTML = ''; // 清空现有内容
    
    // 创建主容器
    const sectionElement = document.createElement('section');
    sectionElement.className = 'section';
    
    const containerElement = document.createElement('div');
    containerElement.className = 'container';
    
    // 遍历主要类别
    data.categories.forEach(category => {
        // 如果是主要类别，不添加分隔标题
        
            containerElement.innerHTML += `<h2 class="section-title">${category.name}</h2>`;
        
        
        // 创建团队容器
        const teamContainer = document.createElement('div');
        teamContainer.className = 'team-container';
        
        // 渲染子类别
        category.subcategories.forEach(subcategory => {
            const subcategoryElement = document.createElement('div');
            subcategoryElement.className = 'team-category';
            
            subcategoryElement.innerHTML = `<h3>${subcategory.name}</h3>`;
            
            const membersContainer = document.createElement('div');
            membersContainer.className = 'team-members';
            
            // 检查是否有成员
            if (subcategory.members && subcategory.members.length > 0) {
                // 渲染成员卡片
                subcategory.members.forEach(member => {
                    membersContainer.appendChild(createMemberCard(member));
                });
            } else {
                // 显示空类别提示
                const emptyNote = getEmptyNoteForCategory(subcategory.name);
                membersContainer.innerHTML = `<p class="empty-category-note">${emptyNote}</p>`;
            }
            
            subcategoryElement.appendChild(membersContainer);
            teamContainer.appendChild(subcategoryElement);
        });
        
        containerElement.appendChild(teamContainer);
    });
    
    // 添加返回首页按钮
    containerElement.innerHTML += `
        <div class="back-to-home">
            <a href="../index.html" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Back to Homepage</a>
        </div>
    `;
    
    sectionElement.appendChild(containerElement);
    mainContainer.appendChild(sectionElement);
}

/**
 * 创建成员卡片
 * @param {Object} member - 成员数据
 * @returns {HTMLElement} 成员卡片元素
 */
function createMemberCard(member) {
    const memberCard = document.createElement('div');
    memberCard.className = 'team-member';
    
    // 头像
    const avatar = document.createElement('img');
    avatar.src = `../${member.avatar}`;
    avatar.alt = member.title;
    memberCard.appendChild(avatar);
    
    // 创建内容容器
    const contentContainer = document.createElement('div');
    contentContainer.className = 'team-member-content';

    // 姓名和链接
    const nameElement = document.createElement('h4');
    const processedTitle = processChinese(member.title);
    nameElement.innerHTML = `<a href="../data/people/profile.html?id=${member.id}">${processedTitle}</a>`;
    contentContainer.appendChild(nameElement);

    // 角色信息
    if (member.role && member.role.length > 0) {
        member.role.forEach((roleItem, index) => {
            const roleElement = document.createElement('p');

            // 判断是否为Prof. Fang的第一个角色项
            const isProfFangLabDirector = member.id === 'prof-fang' && index === 0;

            const processedRoleText = processChinese(roleItem.text);

            if (roleItem.highlighted) {
                // 高亮项始终加粗
                if (isProfFangLabDirector) {
                    // 仅Prof. Fang的第一个角色项保持蓝色高亮
                    roleElement.innerHTML = `<b style="color:#1565C0;">${processedRoleText}</b>`;
                } else {
                    // 其他成员的高亮项加粗但无特殊颜色
                    roleElement.innerHTML = `<b>${processedRoleText}</b>`;
                }
            } else {
                // 非高亮项不加粗
                roleElement.innerHTML = processedRoleText;
            }

            contentContainer.appendChild(roleElement);
        });
    }

    // 社交链接
    if (member.socialLinks && member.socialLinks.length > 0) {
        const linksContainer = document.createElement('div');
        linksContainer.className = 'member-links';

        member.socialLinks.forEach(link => {
            const linkElement = document.createElement('a');
            linkElement.href = link.url;
            linkElement.title = link.title;
            linkElement.innerHTML = `<i class="${link.icon}"></i>`;

            if (link.url.startsWith('http')) {
                linkElement.target = '_blank';
            }

            linksContainer.appendChild(linkElement);
        });

        contentContainer.appendChild(linksContainer);
    }

    // 将内容容器添加到卡片
    memberCard.appendChild(contentContainer);
    
    return memberCard;
}

/**
 * 根据类别名称获取空类别提示信息
 * @param {string} categoryName - 类别名称
 * @returns {string} 提示信息
 */
function getEmptyNoteForCategory(categoryName) {
    const messages = {
        "Postdoctoral Researchers": "Currently no postdoctoral researchers in the team.",
        "Visiting Students": "Currently no visiting students in the team.",
        "Former Visiting Students": "No former visiting students data available.",
        "Graduated PhD Students": "Graduated PhD students data will be added soon.",
        "Graduated Master Students": "Graduated Master students data will be added soon.",
        "Former Postdoctoral Researchers": "Former postdoctoral researchers data will be added soon.",
        "Former Visiting Scholars": "Former visiting scholars data will be added soon."
    };
    
    return messages[categoryName] || `No ${categoryName.toLowerCase()} available.`;
}

/**
 * 处理导航栏水平滚动
 */
function handleNavScrolling() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        // 检查是否可滚动
        const checkScrollable = () => {
            const isScrollable = navLinks.scrollWidth > navLinks.clientWidth;
            document.querySelector('nav .container').classList.toggle('has-scroll', isScrollable);
        };
        
        // 加载时和调整大小时检查
        checkScrollable();
        window.addEventListener('resize', checkScrollable);
        
        // 滚动到活动链接
        const activeLink = navLinks.querySelector('a.active');
        if (activeLink) {
            const activeLi = activeLink.closest('li');
            if (activeLi) {
                setTimeout(() => {
                    // 将活动链接居中
                    const scrollPos = activeLi.offsetLeft - (navLinks.clientWidth / 2) + (activeLi.offsetWidth / 2);
                    navLinks.scrollLeft = Math.max(0, scrollPos);
                }, 100);
            }
        }
    }
}

/**
 * 检测文本中是否包含中文
 * @param {string} text - 要检查的文本
 * @returns {boolean} 是否包含中文
 */
function containsChinese(text) {
    if (!text) return false;
    const pattern = /[\u4e00-\u9fa5]+/; // 匹配中文字符
    return pattern.test(text);
}

/**
 * 处理文本，将中文部分用span包裹
 * @param {string} text - 要处理的文本
 * @returns {string} 处理后的HTML
 */
function processChinese(text) {
    if (!text || !containsChinese(text)) return text;
    
    // 使用正则表达式匹配连续的中文字符
    return text.replace(/([\u4e00-\u9fa5]+)/g, '<span class="chinese-text">$1</span>');
} 