MySQL 建表 SQL
CREATE TABLE `documents` (
  `id` CHAR(36) NOT NULL COMMENT '文档唯一ID，UUID格式',
  `title` VARCHAR(255) NOT NULL COMMENT '文档标题',
  `content` LONGTEXT NULL COMMENT 'Markdown文档内容',
  `sort_index` INT UNSIGNED NOT NULL DEFAULT 9999 COMMENT '排序值，数字越小越靠前',
  `created_by` VARCHAR(64) DEFAULT NULL COMMENT '创建者用户ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_sort_index` (`sort_index`),
  KEY `idx_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Markdown文档表';

3. 示例数据
INSERT INTO `documents` (`id`, `title`, `content`, `sort_index`, `created_by`)
VALUES
('doc-intro', '项目说明', '# 项目说明\n\n这里写项目概览、目录结构、约定…', 1, 'user-001'),
('doc-ts-course', 'TypeScript 课件', '# TypeScript 课件\n\n- 基本类型\n- 泛型与工具类型', 2, 'user-001'),
('doc-todo', '待办清单', '# 待办清单\n\n- [ ] 需求梳理\n- [ ] 组件拆分\n- [ ] 接口联调', 3, 'user-001');

4. 配套查询语句
4.1 获取 Sidebar 列表（只要 ID + Title + Sort）
SELECT id, title, sort_index, updated_at
FROM documents
ORDER BY sort_index ASC, updated_at DESC;

4.2 获取文档详情
SELECT id, title, content, sort_index, created_by, created_at, updated_at
FROM documents
WHERE id = 'doc-intro';

4.3 更新文档内容
UPDATE documents
SET title = '项目说明（更新后）',
    content = '# 项目说明\n\n更新后的内容'
WHERE id = 'doc-intro';

4.4 删除文档
DELETE FROM documents WHERE id = 'doc-intro';

4.5 更新排序（批量更新）

假设 Sidebar 拖拽后得到新顺序：doc-todo, doc-intro, doc-ts-course

UPDATE documents SET sort_index = 1 WHERE id = 'doc-todo';
UPDATE documents SET sort_index = 2 WHERE id = 'doc-intro';
UPDATE documents SET sort_index = 3 WHERE id = 'doc-ts-course';


也可以在后端使用事务一次性提交。

5. 接口与表字段映射
接口字段	MySQL 字段	说明
id	id	主键
title	title	文档标题
content	content	Markdown 内容
sortIndex	sort_index	排序
createdBy	created_by	创建者 ID
createdAt	created_at	创建时间
updatedAt	updated_at	更新时间
6. 后续扩展
功能	扩展字段/表
文档分类	新增 categories 表，并在 documents 表中加 category_id 外键
文档协作	增加 collaborators 关联表：doc_id + user_id + role
历史版本	增加 document_versions 表，保存每次更新前的旧内容
搜索优化	title + content 建全文索引，支持 FULLTEXT 搜索
7. 最终效果

通过这张 documents 表：

可以完成 Markdown 文档的创建、编辑、删除、拖拽排序

结构清晰，便于扩展团队协作、搜索、分类等功能

前端 Sidebar 与 Markdown 编辑器可直接对接 RESTful API，无需额外映射逻辑。