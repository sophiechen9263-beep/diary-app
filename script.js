// ============================================
// LeanCloud初始化
// ============================================

// 初始化LeanCloud
AV.init({
    appId: 'sHqsZe5SLpsUUkxhLe98uuWj-gzGzoHsz',
    appKey: 'd216NCZfm8wRHS6bKibBl4lg',
    serverURL: 'https://shqsze5s.lc-cn-n1-shared.com'
});

// ============================================
// 数据存储相关函数
// ============================================

/**
 * 从LeanCloud获取所有日记数据
 * @returns {Promise<Array>} 日记数组
 */
async function getAllDiaries() {
    try {
        const query = new AV.Query('Diary');
        query.descending('createdAt');
        const results = await query.find();
        
        // 将LeanCloud对象转换为普通对象
        return results.map(obj => ({
            id: obj.id,
            date: obj.get('date'),
            title: obj.get('title'),
            content: obj.get('content'),
            tags: obj.get('tags') || [],
            createdAt: obj.get('createdAt') ? obj.get('createdAt').toISOString() : new Date().toISOString(),
            updatedAt: obj.get('updatedAt') ? obj.get('updatedAt').toISOString() : new Date().toISOString()
        }));
    } catch (error) {
        console.error('获取日记失败:', error);
        alert('获取日记失败: ' + error.message);
        return [];
    }
}

/**
 * 保存单个日记到LeanCloud
 * @param {Object} diary - 日记对象
 * @returns {Promise} 保存结果
 */
async function saveDiaryToCloud(diary) {
    try {
        let diaryObj;
        
        // LeanCloud的objectId通常是24位字符串（包含字母和数字）
        // 如果id存在且看起来像LeanCloud的objectId（长度在20-24之间，只包含字母和数字），则更新
        const isObjectId = diary.id && /^[a-zA-Z0-9]{20,24}$/.test(diary.id);
        
        if (isObjectId) {
            // 更新现有日记
            diaryObj = AV.Object.createWithoutData('Diary', diary.id);
            diaryObj.set('date', diary.date);
            diaryObj.set('title', diary.title);
            diaryObj.set('content', diary.content);
            diaryObj.set('tags', diary.tags || []);
            await diaryObj.save();
        } else {
            // 创建新日记
            diaryObj = new AV.Object('Diary');
            diaryObj.set('date', diary.date);
            diaryObj.set('title', diary.title);
            diaryObj.set('content', diary.content);
            diaryObj.set('tags', diary.tags || []);
            await diaryObj.save();
        }
        
        return diaryObj;
    } catch (error) {
        console.error('保存日记失败:', error);
        throw error;
    }
}

/**
 * 从LeanCloud删除日记
 * @param {string} objectId - LeanCloud对象ID
 * @returns {Promise} 删除结果
 */
async function deleteDiaryFromCloud(objectId) {
    try {
        const diaryObj = AV.Object.createWithoutData('Diary', objectId);
        await diaryObj.destroy();
    } catch (error) {
        console.error('删除日记失败:', error);
        throw error;
    }
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
async function renderDiaryList(diaries = null) {
    const diaryList = document.getElementById('diaryList');
    
    // 显示加载状态
    diaryList.innerHTML = '<div class="empty-state"><div>加载中...</div></div>';
    
    let allDiaries;
    if (diaries) {
        allDiaries = diaries;
    } else {
        allDiaries = await getAllDiaries();
    }
    
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
                        <button class="btn btn-danger btn-small" onclick="deleteDiary('${diary.id}')">删除</button>
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
async function editDiary(id) {
    const diaries = await getAllDiaries();
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
async function saveDiary(event) {
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

    const editId = document.getElementById('diaryForm').dataset.editId;

    try {
        const diaryData = {
            id: editId || null, // 如果有editId则使用，否则为null让LeanCloud自动生成
            date,
            title,
            content,
            tags,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // 保存到LeanCloud
        await saveDiaryToCloud(diaryData);

        // 隐藏编辑区域并刷新列表
        hideEditor();
        await renderDiaryList();
        
        // 清除编辑ID标记
        delete document.getElementById('diaryForm').dataset.editId;
        
        alert('保存成功！');
    } catch (error) {
        alert('保存失败: ' + error.message);
        console.error('保存日记错误:', error);
    }
}

/**
 * 删除日记
 * @param {string} id - 日记ID（LeanCloud的objectId）
 */
async function deleteDiary(id) {
    // 确认删除
    if (!confirm('确定要删除这篇日记吗？此操作无法撤销。')) {
        return;
    }

    try {
        // 从LeanCloud删除
        await deleteDiaryFromCloud(id);

        // 刷新列表
        await renderDiaryList();
        
        alert('删除成功！');
    } catch (error) {
        alert('删除失败: ' + error.message);
        console.error('删除日记错误:', error);
    }
}

// ============================================
// 搜索功能
// ============================================

/**
 * 搜索日记
 */
async function searchDiaries() {
    const searchInput = document.getElementById('searchInput');
    const keyword = searchInput.value.trim().toLowerCase();

    // 如果没有搜索关键词，显示所有日记
    if (!keyword) {
        await renderDiaryList();
        return;
    }

    // 获取所有日记并过滤
    const allDiaries = await getAllDiaries();
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
    await renderDiaryList(filteredDiaries);
}

// ============================================
// 导出/导入功能
// ============================================

/**
 * 导出数据为JSON文件
 */
async function exportData() {
    const diaries = await getAllDiaries();
    
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
async function handleFileImport(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }

    // 读取文件内容
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            // 解析JSON
            const importData = JSON.parse(e.target.result);
            
            // 验证数据格式
            if (!importData.diaries || !Array.isArray(importData.diaries)) {
                throw new Error('文件格式不正确');
            }

            // 确认导入（会添加到现有数据）
            if (!confirm(`将导入 ${importData.diaries.length} 篇日记到云端。确定要继续吗？`)) {
                event.target.value = ''; // 清空文件选择
                return;
            }

            // 保存导入的数据到LeanCloud
            let successCount = 0;
            let failCount = 0;
            
            for (const diary of importData.diaries) {
                try {
                    // 移除原有的id，让LeanCloud生成新的objectId
                    const diaryToSave = { ...diary };
                    delete diaryToSave.id;
                    await saveDiaryToCloud(diaryToSave);
                    successCount++;
                } catch (error) {
                    console.error('导入单条日记失败:', error);
                    failCount++;
                }
            }

            // 刷新列表
            await renderDiaryList();

            alert(`导入完成！成功: ${successCount} 条，失败: ${failCount} 条`);
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
async function init() {
    // 渲染日记列表
    await renderDiaryList();

    // 绑定搜索框输入事件
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', searchDiaries);

    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('diaryDate').value = today;
}

// 页面加载完成后执行初始化
window.addEventListener('DOMContentLoaded', init);

// ============================================
// 额外的按钮绑定逻辑（基于指定的 ID）
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    console.log('[Init] 绑定 newDiaryBtn / saveDiaryBtn / delete 按钮');

    const newDiaryBtn = document.getElementById('newDiaryBtn');
    const saveDiaryBtn = document.getElementById('saveDiaryBtn');
    const diaryContentInput = document.getElementById('diaryContent');
    const diaryListEl = document.getElementById('diaryList');

    // 1. newDiaryBtn：显示输入框和保存按钮，清空内容
    if (newDiaryBtn) {
        newDiaryBtn.addEventListener('click', () => {
            console.log('[Click] newDiaryBtn');

            // 显示编辑区域（原有逻辑）
            if (typeof showEditor === 'function') {
                showEditor();
            }

            // 清空内容输入框
            if (diaryContentInput) {
                diaryContentInput.value = '';
            }

            alert('开始新建日记');
        });
    } else {
        console.warn('[Init] 未找到 newDiaryBtn 按钮');
    }

    // 2. saveDiaryBtn：保存内容到 LeanCloud，并刷新列表
    if (saveDiaryBtn) {
        saveDiaryBtn.addEventListener('click', async (event) => {
            console.log('[Click] saveDiaryBtn');

            try {
                // 复用原有 saveDiary 逻辑（内部已调用 LeanCloud 并刷新列表）
                if (typeof saveDiary === 'function') {
                    await saveDiary(event);
                } else {
                    event.preventDefault();
                    console.error('saveDiary 函数不存在');
                    alert('保存失败：未找到保存逻辑');
                }
            } catch (error) {
                console.error('通过 saveDiaryBtn 保存日记失败:', error);
                alert('保存失败：' + error.message);
            }
        });
    } else {
        console.warn('[Init] 未找到 saveDiaryBtn 按钮');
    }

    // 3. delete 按钮：使用事件委托，复用原有 deleteDiary 逻辑
    if (diaryListEl) {
        diaryListEl.addEventListener('click', (event) => {
            const target = event.target;

            // 当前删除按钮使用 .btn-danger 样式，且文本为“删除”
            if (target.classList.contains('btn-danger') || target.textContent.trim() === '删除') {
                console.log('[Click] deleteBtn');
                // 不阻止现有 inline onclick="deleteDiary(id)"，由原逻辑完成云端删除和刷新列表
                alert('正在删除日记...');
            }
        });
    } else {
        console.warn('[Init] 未找到日记列表容器 diaryList');
    }

    // 4. 再次确认初始化时加载 LeanCloud 日记列表（双保险）
    (async () => {
        try {
            console.log('[Init] 再次加载 LeanCloud 日记列表');
            await renderDiaryList();
        } catch (error) {
            console.error('初始化加载日记列表失败:', error);
            alert('加载日记列表失败：' + error.message);
        }
    })();
});


