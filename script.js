// ============================================
// 数据存储相关函数
// ============================================

/**
 * 从localStorage获取所有日记数据
 * @returns {Array} 日记数组
 */
function getAllDiaries() {
    // 从localStorage中读取数据，如果不存在则返回空数组
    const data = localStorage.getItem('diaries');
    return data ? JSON.parse(data) : [];
}

/**
 * 保存所有日记数据到localStorage
 * @param {Array} diaries - 日记数组
 */
function saveAllDiaries(diaries) {
    // 将数据转换为JSON字符串并存储到localStorage
    localStorage.setItem('diaries', JSON.stringify(diaries));
}

/**
 * 生成唯一的ID（用于区分不同的日记）
 * @returns {string} 唯一ID
 */
function generateId() {
    // 使用时间戳和随机数生成唯一ID
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============================================
// 界面显示相关函数
// ============================================

/**
 * 渲染日记列表
 * @param {Array} diaries - 要显示的日记数组（可选，默认显示所有）
 */
function renderDiaryList(diaries = null) {
    const diaryList = document.getElementById('diaryList');
    const allDiaries = diaries || getAllDiaries();
    
    // 如果没有日记，显示空状态提示
    if (allDiaries.length === 0) {
        diaryList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div>还没有日记，点击"新建日记"开始记录吧！</div>
            </div>
        `;
        return;
    }

    // 按日期倒序排列（最新的在前面）
    const sortedDiaries = [...allDiaries].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    // 生成HTML内容
    diaryList.innerHTML = sortedDiaries.map(diary => {
        // 格式化日期显示
        const date = new Date(diary.date);
        const dateStr = date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // 处理标签显示
        const tagsHtml = diary.tags && diary.tags.length > 0
            ? `<div class="diary-item-tags">${diary.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>`
            : '';

        // 截取内容预览（前100个字符）
        const contentPreview = diary.content.length > 100
            ? diary.content.substring(0, 100) + '...'
            : diary.content;

        return `
            <div class="diary-item" onclick="viewDiary('${diary.id}')">
                <div class="diary-item-header">
                    <div class="diary-item-date">${dateStr}</div>
                    <div class="diary-item-actions" onclick="event.stopPropagation()">
                        <button class="btn btn-secondary btn-small" onclick="editDiary('${diary.id}')">编辑</button>
                        <button class="btn btn-secondary btn-small" onclick="deleteDiary('${diary.id}')">删除</button>
                    </div>
                </div>
                <div class="diary-item-title">${escapeHtml(diary.title)}</div>
                <div class="diary-item-content">${escapeHtml(contentPreview)}</div>
                ${tagsHtml}
            </div>
        `;
    }).join('');
}

/**
 * 转义HTML特殊字符，防止XSS攻击
 * @param {string} text - 要转义的文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 显示编辑区域
 */
function showEditor() {
    const editor = document.getElementById('editor');
    editor.classList.add('active');
    
    // 重置表单
    document.getElementById('diaryForm').reset();
    document.getElementById('editorTitle').textContent = '新建日记';
    
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('diaryDate').value = today;
    
    // 滚动到编辑区域
    editor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * 隐藏编辑区域
 */
function hideEditor() {
    const editor = document.getElementById('editor');
    editor.classList.remove('active');
    document.getElementById('diaryForm').reset();
}

/**
 * 查看日记详情（暂时只是编辑）
 * @param {string} id - 日记ID
 */
function viewDiary(id) {
    editDiary(id);
}

/**
 * 编辑日记
 * @param {string} id - 日记ID
 */
function editDiary(id) {
    const diaries = getAllDiaries();
    const diary = diaries.find(d => d.id === id);
    
    if (!diary) {
        alert('日记不存在');
        return;
    }

    // 显示编辑区域
    const editor = document.getElementById('editor');
    editor.classList.add('active');
    
    // 填充表单数据
    document.getElementById('diaryDate').value = diary.date;
    document.getElementById('diaryTitle').value = diary.title;
    document.getElementById('diaryContent').value = diary.content;
    document.getElementById('diaryTags').value = diary.tags ? diary.tags.join(', ') : '';
    document.getElementById('editorTitle').textContent = '编辑日记';
    
    // 保存当前编辑的ID到表单（用于判断是新建还是编辑）
    document.getElementById('diaryForm').dataset.editId = id;
    
    // 滚动到编辑区域
    editor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============================================
// 日记CRUD操作函数
// ============================================

/**
 * 保存日记（新建或更新）
 * @param {Event} event - 表单提交事件
 */
function saveDiary(event) {
    event.preventDefault(); // 阻止表单默认提交行为

    // 获取表单数据
    const date = document.getElementById('diaryDate').value;
    const title = document.getElementById('diaryTitle').value.trim();
    const content = document.getElementById('diaryContent').value.trim();
    const tagsInput = document.getElementById('diaryTags').value.trim();
    
    // 处理标签（按逗号分割，去除空白）
    const tags = tagsInput
        ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

    // 获取所有日记
    const diaries = getAllDiaries();
    const editId = document.getElementById('diaryForm').dataset.editId;

    if (editId) {
        // 编辑模式：更新现有日记
        const index = diaries.findIndex(d => d.id === editId);
        if (index !== -1) {
            diaries[index] = {
                ...diaries[index],
                date,
                title,
                content,
                tags,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // 新建模式：添加新日记
        const newDiary = {
            id: generateId(),
            date,
            title,
            content,
            tags,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        diaries.push(newDiary);
    }

    // 保存到localStorage
    saveAllDiaries(diaries);

    // 隐藏编辑区域并刷新列表
    hideEditor();
    renderDiaryList();
    
    // 清除编辑ID标记
    delete document.getElementById('diaryForm').dataset.editId;
}

/**
 * 删除日记
 * @param {string} id - 日记ID
 */
function deleteDiary(id) {
    // 确认删除
    if (!confirm('确定要删除这篇日记吗？此操作无法撤销。')) {
        return;
    }

    // 获取所有日记并过滤掉要删除的
    const diaries = getAllDiaries();
    const filteredDiaries = diaries.filter(d => d.id !== id);

    // 保存到localStorage
    saveAllDiaries(filteredDiaries);

    // 刷新列表
    renderDiaryList();
}

// ============================================
// 搜索功能
// ============================================

/**
 * 搜索日记
 */
function searchDiaries() {
    const searchInput = document.getElementById('searchInput');
    const keyword = searchInput.value.trim().toLowerCase();

    // 如果没有搜索关键词，显示所有日记
    if (!keyword) {
        renderDiaryList();
        return;
    }

    // 获取所有日记并过滤
    const allDiaries = getAllDiaries();
    const filteredDiaries = allDiaries.filter(diary => {
        // 搜索标题
        if (diary.title.toLowerCase().includes(keyword)) {
            return true;
        }
        // 搜索内容
        if (diary.content.toLowerCase().includes(keyword)) {
            return true;
        }
        // 搜索标签
        if (diary.tags && diary.tags.some(tag => tag.toLowerCase().includes(keyword))) {
            return true;
        }
        return false;
    });

    // 显示搜索结果
    renderDiaryList(filteredDiaries);
}

// ============================================
// 导出/导入功能
// ============================================

/**
 * 导出数据为JSON文件
 */
function exportData() {
    const diaries = getAllDiaries();
    
    if (diaries.length === 0) {
        alert('还没有日记可以导出');
        return;
    }

    // 创建导出数据对象（包含版本信息）
    const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        diaries: diaries
    };

    // 转换为JSON字符串
    const jsonStr = JSON.stringify(exportData, null, 2);
    
    // 创建Blob对象
    const blob = new Blob([jsonStr], { type: 'application/json' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diary-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    // 触发下载
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // 释放URL对象
    URL.revokeObjectURL(url);
    
    alert('导出成功！');
}

/**
 * 触发文件选择（用于导入）
 */
function importData() {
    document.getElementById('fileInput').click();
}

/**
 * 处理文件导入
 * @param {Event} event - 文件选择事件
 */
function handleFileImport(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }

    // 读取文件内容
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // 解析JSON
            const importData = JSON.parse(e.target.result);
            
            // 验证数据格式
            if (!importData.diaries || !Array.isArray(importData.diaries)) {
                throw new Error('文件格式不正确');
            }

            // 确认导入（会覆盖现有数据）
            if (!confirm(`将导入 ${importData.diaries.length} 篇日记，这会覆盖现有的所有数据。确定要继续吗？`)) {
                event.target.value = ''; // 清空文件选择
                return;
            }

            // 保存导入的数据
            saveAllDiaries(importData.diaries);

            // 刷新列表
            renderDiaryList();

            alert('导入成功！');
        } catch (error) {
            alert('导入失败：' + error.message);
            console.error('Import error:', error);
        }
        
        // 清空文件选择，以便可以重复导入同一个文件
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

// ============================================
// 初始化
// ============================================

/**
 * 页面加载完成后初始化
 */
function init() {
    // 渲染日记列表
    renderDiaryList();

    // 绑定搜索框输入事件
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', searchDiaries);

    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('diaryDate').value = today;
}

// 页面加载完成后执行初始化
window.addEventListener('DOMContentLoaded', init);

