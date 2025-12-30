# 极简日记应用 - 使用说明

## 📁 文件说明

这个日记应用包含3个文件，必须放在同一个文件夹内：

- **index.html** - 网页结构文件
- **style.css** - 样式文件（控制界面外观）
- **script.js** - 功能文件（控制应用逻辑）

## 🚀 如何使用

1. 确保3个文件都在同一个文件夹中
2. 双击 `index.html` 文件，会在浏览器中打开
3. 开始使用即可！

## 📝 在 Cursor 中保存文件的详细步骤

### 方法一：直接在 Cursor 中创建新文件（推荐）

1. **打开 Cursor 编辑器**

2. **创建文件夹（可选但推荐）**
   - 在 Cursor 左侧的文件资源管理器中，右键点击空白处
   - 选择 "New Folder"（新建文件夹）
   - 命名为 `diary-app` 或任何你喜欢的名字

3. **创建 index.html 文件**
   - 在左侧文件资源管理器中，右键点击你刚创建的文件夹（或根目录）
   - 选择 "New File"（新建文件）
   - 输入文件名：`index.html`（注意：文件名必须完全一致，包括大小写）
   - 按回车确认
   - 文件会在编辑器中打开，是空白的

4. **复制代码到 index.html**
   - 回到聊天窗口，找到上面我提供的 `index.html` 代码
   - 用鼠标选中全部代码（从 `<!DOCTYPE html>` 到最后一行）
   - 按 `Ctrl + C`（Windows）或 `Cmd + C`（Mac）复制
   - 点击 Cursor 中打开的 `index.html` 文件
   - 按 `Ctrl + V`（Windows）或 `Cmd + V`（Mac）粘贴
   - 按 `Ctrl + S`（Windows）或 `Cmd + S`（Mac）保存

5. **创建 style.css 文件**
   - 重复步骤3，但这次文件名输入：`style.css`
   - 复制粘贴 `style.css` 的代码
   - 保存文件

6. **创建 script.js 文件**
   - 重复步骤3，但这次文件名输入：`script.js`
   - 复制粘贴 `script.js` 的代码
   - 保存文件

7. **完成！**
   - 现在你应该有3个文件在同一个文件夹中
   - 双击 `index.html` 就可以在浏览器中使用了

### 方法二：使用命令快速创建文件

如果你熟悉命令行，也可以在 Cursor 的终端中操作：

1. **打开终端**
   - 在 Cursor 中按 `` Ctrl + ` `` （反引号键，通常在数字1键左边）
   - 或者点击顶部菜单：Terminal → New Terminal

2. **创建文件夹（如果还没有）**
   ```
   mkdir diary-app
   cd diary-app
   ```

3. **创建文件**
   ```
   type nul > index.html
   type nul > style.css
   type nul > script.js
   ```
   注意：在 Mac/Linux 上使用 `touch index.html style.css script.js`

4. **然后在 Cursor 中打开这些文件，复制粘贴对应的代码并保存**

## ⚠️ 注意事项

- **文件名必须准确**：文件名必须是 `index.html`、`style.css`、`script.js`（注意大小写和扩展名）
- **文件必须在同一文件夹**：3个文件必须放在同一个文件夹中，否则网页无法正常工作
- **保存位置**：建议保存到一个容易找到的位置，比如桌面或文档文件夹

## 🎯 文件结构示例

保存后，你的文件夹应该像这样：

```
diary-app/
  ├── index.html
  ├── style.css
  └── script.js
```

## ❓ 常见问题

**Q: 打开 index.html 后页面是空白的？**
A: 检查浏览器控制台（按 F12），看看是否有错误。最常见的原因是文件路径不对，确保3个文件在同一文件夹。

**Q: 样式没有生效？**
A: 确保 `index.html` 中的 `<link rel="stylesheet" href="style.css">` 这一行存在，且文件名正确。

**Q: 功能不工作？**
A: 确保 `index.html` 中的 `<script src="script.js"></script>` 这一行存在，且文件名正确。
