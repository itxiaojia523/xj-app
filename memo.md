git 配置ssh
https://blog.csdn.net/weixin_42310154/article/details/118340458


# 文档系统
每个文档是一个独立资源：id + title + content + sortIndex
Sidebar 的拖拽排序通过 sortIndex 实现
Markdown 编辑器内容的保存通过 PUT / PATCH 接口

数据模型设计
| 字段          | 类型                | 说明                   |
| ----------- | ----------------- | -------------------- |
| `id`        | string (UUID)     | 文档唯一标识，例如 `doc-123`  |
| `title`     | string            | 文档标题，显示在 Sidebar     |
| `content`   | string (Markdown) | 文档内容，Markdown 格式     |
| `sortIndex` | number            | 用于排序的权重，数字越小越靠前      |
| `createdAt` | string (ISO 时间)   | 创建时间                 |
| `updatedAt` | string (ISO 时间)   | 最后修改时间               |
| `createdBy` | string            | 创建者 ID（可选，扩展多人协作时使用） |
加一个deleteflag

RESTful 接口设计

2.1 获取所有文档（Sidebar 列表）

GET /api/docs
用于显示 Sidebar 文档列表，默认按照 sortIndex 排序。
注意：
这里只返回列表所需字段，不返回 content，节省流量。

请求
GET /api/docs

```
[
  {
    "id": "doc-intro",
    "title": "项目说明",
    "sortIndex": 1,
    "updatedAt": "2025-09-18T09:30:00Z"
  },
  {
    "id": "doc-ts-course",
    "title": "TypeScript 课件",
    "sortIndex": 2,
    "updatedAt": "2025-09-18T09:35:00Z"
  }
]

```
获取单个文档详情
GET /api/docs/:id

根据文档 ID 获取完整内容。
请求
GET /api/docs/doc-intro

响应
{
  "id": "doc-intro",
  "title": "项目说明",
  "content": "# 项目说明\n\n这里写项目的基本信息",
  "sortIndex": 1,
  "createdAt": "2025-09-18T09:00:00Z",
  "updatedAt": "2025-09-18T09:30:00Z",
  "createdBy": "user-001"
}

创建新文档
在 Sidebar 里点击“新建文档”时使用。

请求
POST /api/docs
Content-Type: application/json

{
  "title": "新建文档",
  "content": "# 新建文档",
  "sortIndex": 9999
}

响应
{
  "id": "doc-xyz123",
  "title": "新建文档",
  "content": "# 新建文档",
  "sortIndex": 9999,
  "createdAt": "2025-09-18T09:40:00Z",
  "updatedAt": "2025-09-18T09:40:00Z",
  "createdBy": "user-001"
}

更新文档内容（Markdown 编辑器保存）
PUT /api/docs/:id

当用户在 Markdown 编辑器中编辑完成后，保存时调用。

请求
PUT /api/docs/doc-intro
Content-Type: application/json

{
  "title": "项目说明（更新后）",
  "content": "# 项目说明\n\n更新后的内容"
}

响应
{
  "id": "doc-intro",
  "title": "项目说明（更新后）",
  "content": "# 项目说明\n\n更新后的内容",
  "updatedAt": "2025-09-18T09:45:00Z"
}


注意：
只要更新内容或标题时使用 PUT，并更新 updatedAt。

2.5 删除文档

DELETE /api/docs/:id

请求
DELETE /api/docs/doc-intro

响应
{
  "message": "Document deleted successfully",
  "id": "doc-intro"
}

2.6 调整 Sidebar 顺序

PATCH /api/docs/reorder

在 Sidebar 中拖拽完成后，把新的排序顺序传给后端。

请求
PATCH /api/docs/reorder
Content-Type: application/json

{
  "order": ["doc-todo", "doc-intro", "doc-ts-course"]
}

响应
{
  "message": "Order updated successfully"
}


后端逻辑：

按照数组顺序更新每个文档的 sortIndex

例如 doc-todo → sortIndex=1，doc-intro → sortIndex=2，doc-ts-course → sortIndex=3

3. API 总览
功能	方法	路径	请求体
获取文档列表	GET	/api/docs	无
获取单个文档	GET	/api/docs/:id	无
创建文档	POST	/api/docs	{ title, content, sortIndex }
更新文档内容	PUT	/api/docs/:id	{ title, content }
删除文档	DELETE	/api/docs/:id	无
更新排序	PATCH	/api/docs/reorder	{ order: [id1, id2...] }