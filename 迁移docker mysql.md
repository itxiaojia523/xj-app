如果你在本地开发环境使用 Docker 容器运行 MySQL，当项目需要迁移到测试环境或生产环境时，可以按照下面步骤进行迁移，保证数据、配置、结构完整迁移。

我将分四个部分来讲：

数据库结构迁移（只迁移表结构，不带数据）

数据迁移（完整数据 + 结构）

Docker 容器迁移（迁移整个数据库卷或容器）

最佳实践与环境区分

1. 数据库结构迁移（Schema Only）

如果你只想迁移表结构（比如只同步 CREATE TABLE、视图、索引，不带数据）：

# 导出数据库结构
docker exec -i mysql-container \
  mysqldump -uroot -p123456 --no-data mydb > db_schema.sql


参数说明：

mysql-container：你的 MySQL 容器名或容器 ID

-uroot -p123456：MySQL 登录用户名和密码

--no-data：只导出结构，不导出数据

mydb：数据库名称

然后在目标环境导入：

mysql -h <target-host> -uroot -p123456 mydb < db_schema.sql

2. 完整数据迁移（结构 + 数据）

如果你需要迁移所有数据（包括表结构 + 数据内容）：

# 导出完整数据库
docker exec -i mysql-container \
  mysqldump -uroot -p123456 --databases mydb --single-transaction --quick --lock-tables=false > full_backup.sql


建议加上 --single-transaction 保证导出时不中断读写。

目标环境导入：

mysql -h <target-host> -uroot -p123456 < full_backup.sql

3. 迁移整个 Docker MySQL 容器

有时你不仅想迁移数据，还想把整个容器的数据库文件和配置一起迁移，比如直接复制到测试环境或生产环境。

3.1 检查 MySQL 数据存储位置

通常 MySQL 容器的数据保存在 Docker Volume 或本地目录中，查看容器挂载情况：

docker inspect mysql-container | grep Mounts -A 20


输出类似：

"Mounts": [
  {
    "Type": "volume",
    "Name": "mysql_data_volume",
    "Destination": "/var/lib/mysql"
  }
]


如果 Destination 是 /var/lib/mysql，那就是 MySQL 的核心数据目录。

3.2 停止容器，备份数据卷
docker stop mysql-container


导出数据卷为压缩包：

docker run --rm \
  -v mysql_data_volume:/volume \
  -v $(pwd):/backup \
  alpine tar czvf /backup/mysql_data_backup.tar.gz -C /volume .

3.3 在目标环境导入数据卷

把 mysql_data_backup.tar.gz 拷贝到目标环境

创建一个新的 volume：

docker volume create mysql_data_volume


解压数据到 volume：

docker run --rm \
  -v mysql_data_volume:/volume \
  -v $(pwd):/backup \
  alpine tar xzvf /backup/mysql_data_backup.tar.gz -C /volume


启动新 MySQL 容器，挂载刚才的 volume：

docker run -d \
  --name mysql-container \
  -v mysql_data_volume:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -p 3306:3306 \
  mysql:8.0


这样新的 MySQL 实例会完全继承旧环境的数据和配置。

4. 环境区分与迁移策略
场景	建议做法
本地开发 → 测试环境	只导出数据库结构或小量测试数据，避免污染测试环境
测试环境 → 生产环境	使用完整数据迁移（mysqldump 或 volume 备份）
生产环境 → 灾备或多机部署	使用 volume 备份 + binlog 复制
频繁同步开发和测试结构	用 db_schema.sql 做版本控制（Git 里管理 schema 变更）
5. Docker Compose 场景

如果你用 docker-compose.yml 管理 MySQL，可以把数据卷映射到项目目录，方便迁移。

version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: mysql-container
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: mydb
    volumes:
      - ./mysql_data:/var/lib/mysql   # 数据存放在项目目录
      - ./mysql_conf:/etc/mysql/conf.d  # 自定义配置文件

迁移时：

压缩 mysql_data 和 mysql_conf 文件夹

拷贝到目标机器

在目标机器上重新 docker-compose up -d 即可复原整个数据库。

6. 推荐备份/迁移方案对比
方法	特点	适用场景
mysqldump	结构化 SQL 文件，通用、易读	结构迁移、少量数据
Volume 备份	包含所有 MySQL 数据和配置，完整恢复	大量数据，完全克隆数据库
docker-compose 挂载目录	版本管理方便，迁移最简单	开发环境、团队协作
Binlog + 复制	增量同步，最实时	生产实时同步、热备
7. 常用迁移脚本示例
7.1 一键导出并压缩
docker exec -i mysql-container \
  mysqldump -uroot -p123456 --single-transaction --databases mydb \
  | gzip > backup_$(date +%F).sql.gz

7.2 导入压缩文件
gunzip < backup_2025-09-18.sql.gz | mysql -uroot -p123456

总结
目标	关键命令
只迁移表结构	mysqldump --no-data mydb > db_schema.sql
迁移完整数据	mysqldump --databases mydb > full_backup.sql
完整容器迁移	docker volume export/import 或目录挂载备份
生产环境实时同步	Binlog + 主从复制

最佳实践：

开发阶段：挂载目录到项目 → 团队共享

测试/生产：mysqldump + Git 管理 schema

日常备份：定期 cron 任务导出 gzip

数据安全：不同环境数据库使用不同 root 密码，避免误操作