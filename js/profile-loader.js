/**
 * Profile Loader
 * 用于动态加载团队成员档案页面
 */

// 主函数
document.addEventListener('DOMContentLoaded', function() {
    loadMemberProfile();
});

/**
 * 从URL获取成员ID
 * @returns {string|null} 成员ID或null（如果未找到）
 */
function getMemberIdFromUrl() {
    // 从URL获取查询参数
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * 加载成员档案
 */
function loadMemberProfile() {
    const memberId = getMemberIdFromUrl();
    
    if (!memberId) {
        showError('No member ID specified. Please go back to the team page and select a member.');
        return;
    }
    
    // 加载团队数据
    fetch('../../data/team-members.json')
        .then(response => response.json())
        .then(data => {
            const member = findMemberById(data, memberId);
            
            if (member) {
                renderMemberProfile(member);
            } else {
                showError(`Member with ID "${memberId}" not found.`);
            }
        })
        .catch(error => {
            console.error('Error loading team data:', error);
            showError('Failed to load member data. Please try again later.');
        });
}

/**
 * 在团队数据中查找成员
 * @param {Object} data - 团队数据
 * @param {string} memberId - 成员ID
 * @returns {Object|null} 成员对象或null（如果未找到）
 */
function findMemberById(data, memberId) {
    // 遍历所有类别和子类别
    for (const category of data.categories) {
        for (const subcategory of category.subcategories) {
            const member = subcategory.members.find(m => m.id === memberId);
            if (member) {
                return member;
            }
        }
    }
    
    return null;
}

/**
 * 渲染成员档案
 * @param {Object} member - 成员数据
 */
function renderMemberProfile(member) {
    // 隐藏加载动画
    document.getElementById('loading').style.display = 'none';
    
    // 显示内容容器
    const contentContainer = document.getElementById('profile-content');
    contentContainer.style.display = 'block';
    
    // 更新页面标题
    document.title = `${member.title} - JC STEM Lab of Smart City`;
    
    // 更新导航菜单
    document.getElementById('member-nav-name').textContent = member.title.split(',')[0];
    
    // 处理标题，检测是否包含中文
    let titleDisplay = member.title;
    if (containsChinese(member.title)) {
        titleDisplay = `<span class="chinese-text">${member.title}</span>`;
    }
    
    // 创建档案内容
    let html = `
        <div class="profile-header">
            <img src="../../${member.avatar}" alt="${member.title}" class="profile-avatar">
            <div class="profile-info">
                <h1>${processChinese(member.title)}</h1>
                <div class="profile-role">
                    ${renderRoles(member.role, member.id)}
                </div>
                ${renderSocialLinks(member.socialLinks)}
            </div>
        </div>
    `;
    
    // 研究兴趣
    if (member.interests && member.interests.length > 0) {
        html += `
            <div class="profile-section">
                <h2 class="section-title">Research Interests</h2>
                <div class="interests-list">
                    ${member.interests.map(interest => {
                        if (containsChinese(interest)) {
                            return `<span class="interest-tag chinese-text">${interest}</span>`;
                        } else {
                            return `<span class="interest-tag">${interest}</span>`;
                        }
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // 教育经历
    if (member.education && member.education.length > 0) {
        html += `
            <div class="profile-section">
                <h2 class="section-title">Education</h2>
                <div class="education-list">
                    ${renderEducation(member.education)}
                </div>
            </div>
        `;
    }
    
    // 个人简历
    if (member.biography) {
        html += `
            <div class="profile-section">
                <h2 class="section-title">Biography</h2>
                ${formatBiography(member.biography)}
            </div>
        `;
    }
    
    // 返回按钮
    html += `
        <div class="text-center mt-5">
            <a href="../../pages/team.html" class="btn btn-primary">
                <i class="fas fa-users"></i> Back to Team
            </a>
        </div>
    `;
    
    // 设置HTML内容
    contentContainer.innerHTML = html;
}

/**
 * 渲染角色信息
 * @param {Array} roles - 角色数组
 * @param {string} memberId - 成员ID
 * @returns {string} HTML字符串
 */
function renderRoles(roles, memberId) {
    if (!roles || roles.length === 0) return '';
    
    let html = '';
    
    roles.forEach((role, index) => {
        const processedText = processChinese(role.text);
        
        if (role.highlighted) {
            // 只有 Prof. Fang 的第一个高亮项（实验室主任）显示为蓝色
            if ((memberId === 'prof-fang' || memberId === 'michael-fang') && index === 0) {
                html += `<p><b style="color:#1565C0;">${processedText}</b></p>`;
            } else {
                // 其他人的高亮项仅加粗
                html += `<p><b>${processedText}</b></p>`;
            }
        } else {
            // 非高亮项正常显示
            html += `<p>${processedText}</p>`;
        }
    });
    
    return html;
}

/**
 * 渲染社交链接
 * @param {Array} links - 链接数组
 * @returns {string} HTML字符串
 */
function renderSocialLinks(links) {
    if (!links || links.length === 0) return '';
    
    let html = '<div class="profile-contacts">';
    
    links.forEach(link => {
        let href = link.url;
        let target = href.startsWith('http') ? ' target="_blank"' : '';
        
        html += `<a href="${href}" title="${link.title}"${target}><i class="${link.icon}"></i></a>`;
    });
    
    html += '</div>';
    
    return html;
}

/**
 * 渲染教育经历
 * @param {Array} education - 教育经历数组
 * @returns {string} HTML字符串
 */
function renderEducation(education) {
    let html = '';
    
    education.forEach(edu => {
        // 检测学位、学校名称是否包含中文
        let degreeDisplay = edu.degree;
        let institutionDisplay = edu.institution;
        let yearDisplay = edu.year;
        
        if (containsChinese(edu.degree)) {
            degreeDisplay = `<span class="chinese-text">${edu.degree}</span>`;
        }
        
        if (containsChinese(edu.institution)) {
            institutionDisplay = `<span class="chinese-text">${edu.institution}</span>`;
        }
        
        if (containsChinese(edu.year)) {
            yearDisplay = `<span class="chinese-text">${edu.year}</span>`;
        }
        
        html += `
            <div class="education-item">
                <h3>${degreeDisplay}</h3>
                <p>${institutionDisplay}</p>
                <p>${yearDisplay}</p>
            </div>
        `;
    });
    
    return html;
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

/**
 * 格式化传记文本，处理Markdown格式并转换为HTML
 * @param {string} biography - 传记文本(Markdown格式)
 * @returns {string} 格式化的HTML
 */
function formatBiography(biography) {
    if (!biography) return '';
    
    // 处理段落
    let html = biography.split(/\n\n|\n/).filter(p => p.trim().length > 0)
        .map(p => `<p>${processChinese(p.trim())}</p>`)
        .join('\n');
    
    // 处理Markdown链接格式: [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // 处理HTML链接格式: <a href="...">text</a>
    // 这种格式已经是HTML，所以不需要转换，但我们确保链接在新窗口中打开
    html = html.replace(/<a\s+href="([^"]+)"([^>]*)>(.*?)<\/a>/g, function(match, url, attrs, text) {
        // 检查是否已经有target属性
        if (attrs.indexOf('target=') === -1) {
            return `<a href="${url}" target="_blank"${attrs}>${text}</a>`;
        }
        return match; // 已有target属性，保持不变
    });
    
    // 处理强调 (** ** 或 __ __)
    html = html.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
    
    // 处理斜体 (* * 或 _ _)
    html = html.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
    
    return html;
}

/**
 * 显示错误信息
 * @param {string} message - 错误消息
 */
function showError(message) {
    // 隐藏加载动画
    document.getElementById('loading').style.display = 'none';
    
    // 显示内容容器
    const contentContainer = document.getElementById('profile-content');
    contentContainer.style.display = 'block';
    
    // 显示错误消息
    contentContainer.innerHTML = `
        <div class="error-message">
            <h2>Error</h2>
            <p>${message}</p>
            <a href="../../pages/team.html" class="back-link"><i class="fas fa-users"></i> Back to Team</a>
        </div>
    `;
} 