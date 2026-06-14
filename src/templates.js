export const REVIEW_AGENT = `# 审核代理

只审核本次已暂存的变更。请按 BDR、默认规则、项目规则、DIY 规则的优先级进行检查，并基于 diff 给出可定位的证据。

输出给开发者阅读的标题、证据和修复建议必须使用中文；JSON 字段名、枚举值和配置字段保持英文。
`;

export const POLICY = `# 审核策略

\`\`\`yaml
softBlockScore: 60
hardBlockScore: 90
ciSoftBlockBehavior: fail
\`\`\`
`;

export const RULES_INDEX = `# 规则索引

## BDR

\`\`\`yaml
enabled: true
provider: bdr
path: ../vendor/bdr
priority: 10
weight: 1.0
mode: soft-by-default
hardBlockWhen:
  - obvious_bug
  - security_vulnerability
  - data_loss
  - auth_bypass
\`\`\`

## Default Rules

\`\`\`yaml
enabled: true
provider: markdown
priority: 20
weight: 1.0
files:
  - ../docs/default/java.md
  - ../docs/default/vue.md
  - ../docs/default/python.md
  - ../docs/default/mysql.md
  - ../docs/default/oracle.md
  - ../docs/default/postgresql.md
  - ../docs/default/oceanbase.md
  - ../docs/default/redis.md
  - ../docs/default/rabbitmq.md
  - ../docs/default/drools.md
  - ../docs/default/security.md
  - ../docs/default/workflow.md
  - ../docs/default/sqlfluff.md
\`\`\`

## Project Rules

\`\`\`yaml
enabled: true
provider: markdown
priority: 50
weight: 1.5
files:
  - ../docs/project/architecture.md
  - ../docs/project/api-contract.md
\`\`\`

## DIY Rules

\`\`\`yaml
enabled: true
provider: markdown
priority: 100
weight: 2.0
files:
  - ../docs/diy/auth.md
requiredRules: []
hardBlockOnViolation: true
\`\`\`
`;

export const REVIEW_MODEL = {
  provider: 'openai-compatible',
  baseUrl: 'https://api.example.com/v1',
  apiKey: '',
  apiKeyEnv: 'GITPUSHREVIEW_API_KEY',
  model: 'gpt-4.1',
  timeoutMs: 60000,
};

const javaPaths = ['**/*.java'];
const springWebPaths = ['**/*Controller.java', '**/*Resource.java', '**/*Security*.java', '**/*.java'];
const springServicePaths = ['**/*Service.java', '**/*Repository.java', '**/*Mapper.java', '**/*DAO.java', '**/*Dao.java', '**/*.java'];
const springConfigPaths = [
  '**/*.java',
  'src/main/resources/**/*.yml',
  'src/main/resources/**/*.yaml',
  'src/main/resources/**/*.properties',
  'src/main/resources/**/*.xml',
  'pom.xml',
  '**/pom.xml',
  'build.gradle*',
  '**/build.gradle*',
  '**/*.gradle',
  '**/*.gradle.kts',
];
const mybatisJavaPaths = [
  '**/*Mapper.java',
  '**/*DAO.java',
  '**/*Dao.java',
  '**/*Mapper*.xml',
  '**/*Dao*.xml',
  '**/*DAO*.xml',
  'src/main/resources/**/mapper/**/*.xml',
  'src/main/resources/**/mappers/**/*.xml',
  'src/main/resources/**/mybatis/**/*.xml',
  'src/main/resources/**/sqlmap/**/*.xml',
  '**/*.java',
];
const vuePaths = ['**/*.vue', '**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];
const pythonPaths = ['**/*.py', '**/*.pyw'];
const mysqlPaths = [
  'db/mysql/**',
  'database/mysql/**',
  'schema/mysql/**',
  'migrations/mysql/**',
  'mysql/**',
  '**/*.mysql.sql',
  '**/*mysql*.sql',
  '**/*Mapper*.xml',
  '**/*Mapper*.java',
  '**/*Repository*.java',
  '**/*DAO*.java',
  '**/*Dao*.java',
  '**/*Service*.java',
  '**/*Job*.java',
  '**/*Task*.java',
  '**/*Repository*',
  '**/*DAO*',
];
const oraclePaths = [
  'db/oracle/**',
  'database/oracle/**',
  'schema/oracle/**',
  'migrations/oracle/**',
  'oracle/**',
  '**/*.oracle.sql',
  '**/*oracle*.sql',
  '**/*.pks',
  '**/*.pkb',
  '**/*Mapper*.xml',
  '**/*Mapper*.java',
  '**/*Repository*.java',
  '**/*DAO*.java',
  '**/*Dao*.java',
  '**/*Service*.java',
  '**/*Job*.java',
  '**/*Task*.java',
  '**/*Oracle*.java',
  '**/*Repository*',
  '**/*DAO*',
];
const postgresqlPaths = [
  'db/postgresql/**',
  'db/postgres/**',
  'database/postgresql/**',
  'database/postgres/**',
  'schema/postgresql/**',
  'schema/postgres/**',
  'migrations/postgresql/**',
  'migrations/postgres/**',
  'postgresql/**',
  'postgres/**',
  '**/*.pgsql.sql',
  '**/*.postgres.sql',
  '**/*postgres*.sql',
  '**/*pgsql*.sql',
  '**/*Mapper*.xml',
  '**/*Mapper*.java',
  '**/*Repository*.java',
  '**/*DAO*.java',
  '**/*Dao*.java',
  '**/*Service*.java',
];
const oceanbasePaths = [
  'db/oceanbase/**',
  'database/oceanbase/**',
  'schema/oceanbase/**',
  'migrations/oceanbase/**',
  'oceanbase/**',
  '**/*.oceanbase.sql',
  '**/*oceanbase*.sql',
  '**/*Mapper*.xml',
  '**/*Mapper*.java',
  '**/*Repository*.java',
  '**/*DAO*.java',
  '**/*Dao*.java',
  '**/*Service*.java',
];
const redisPaths = [
  '**/*Redis*.java',
  '**/*Redis*.kt',
  '**/*Cache*.java',
  '**/*Cache*.kt',
  '**/*redis*.py',
  '**/*cache*.py',
  'src/main/resources/**/*redis*.yml',
  'src/main/resources/**/*redis*.yaml',
  'src/main/resources/**/*redis*.properties',
  'src/main/resources/**/redis/**/*.yml',
  'src/main/resources/**/redis/**/*.yaml',
  'src/main/resources/**/redis/**/*.properties',
  'config/**/*redis*',
  'redis/**',
];
const rabbitmqPaths = [
  '**/*Rabbit*.java',
  '**/*Rabbit*.kt',
  '**/*Amqp*.java',
  '**/*Amqp*.kt',
  '**/*Listener.java',
  '**/*Consumer.java',
  '**/*Producer.java',
  '**/*rabbit*.py',
  '**/*amqp*.py',
  'src/main/resources/**/*rabbit*.yml',
  'src/main/resources/**/*rabbit*.yaml',
  'src/main/resources/**/*rabbit*.properties',
  'src/main/resources/**/*amqp*.yml',
  'src/main/resources/**/*amqp*.yaml',
  'src/main/resources/**/*amqp*.properties',
  'src/main/resources/**/rabbitmq/**/*.yml',
  'src/main/resources/**/rabbitmq/**/*.yaml',
  'src/main/resources/**/rabbitmq/**/*.properties',
  'config/**/*rabbit*',
  'rabbitmq/**',
];
const sqlfluffPaths = [
  '.sqlfluff',
  'pyproject.toml',
  'setup.cfg',
  'tox.ini',
  '.github/workflows/*.yml',
  '.github/workflows/*.yaml',
  '.gitlab-ci.yml',
  'Jenkinsfile',
  '**/*.sql',
];
const springCloudPaths = [
  '**/*Client.java',
  '**/*Feign*.java',
  '**/*Controller.java',
  '**/*Interceptor.java',
  '**/*Filter.java',
  '**/*.java',
  'src/main/resources/**/*.yml',
  'src/main/resources/**/*.yaml',
  'src/main/resources/**/*.properties',
];
const seataPaths = [
  '**/*.java',
  '**/*Service.java',
  '**/*Repository.java',
  '**/*Mapper.java',
  '**/*DAO.java',
  '**/*Dao.java',
  'src/main/resources/**/*.yml',
  'src/main/resources/**/*.yaml',
  'src/main/resources/**/*.properties',
  '**/registry*.conf',
  '**/file.conf',
];
const droolsPaths = [
  '**/*.drl',
  '**/rules/**/*.drl',
  '**/drools/**/*.drl',
  '**/*Rule*.java',
  '**/*Rules*.java',
  '**/*Rule*.kt',
  '**/*Rules*.kt',
];
const securityPaths = [
  '**/*.java',
  '**/*.py',
  '**/*.pyw',
  '**/*.vue',
  '**/*.ts',
  '**/*.tsx',
  '**/*.js',
  '**/*.jsx',
  '**/*.html',
  '**/*.sql',
  '**/*.drl',
  'src/main/resources/**/*.yml',
  'src/main/resources/**/*.yaml',
  'src/main/resources/**/*.properties',
  '**/*.json',
  '**/*.conf',
  '**/*.sh',
  'Dockerfile',
  'docker-compose*.yml',
  'nginx/**/*.conf',
  '**/nginx*.conf',
  'k8s/**/*.yml',
  'k8s/**/*.yaml',
  'helm/**',
  '.env*',
];
const supplyChainPaths = [
  ...securityPaths,
  'package.json',
  'package-lock.json',
  'npm-shrinkwrap.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  '.npmrc',
  'pom.xml',
  '**/pom.xml',
  'build.gradle*',
  '**/build.gradle*',
  '**/*.gradle',
  '**/*.gradle.kts',
  'gradle.lockfile',
  '**/gradle.lockfile',
  'requirements*.txt',
  '**/requirements*.txt',
  'constraints*.txt',
  '**/constraints*.txt',
  'pyproject.toml',
  '**/pyproject.toml',
  'poetry.lock',
  '**/poetry.lock',
  'Pipfile',
  '**/Pipfile',
  'Pipfile.lock',
  '**/Pipfile.lock',
  'setup.py',
  '**/setup.py',
  'setup.cfg',
  '**/setup.cfg',
];
const workflowPaths = [
  '**/*.java',
  '**/*.py',
  '**/*.pyw',
  '**/*.vue',
  '**/*.ts',
  '**/*.js',
  '**/*.sql',
  '**/*.drl',
  'package.json',
  'package-lock.json',
  'npm-shrinkwrap.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  '.npmrc',
  'pom.xml',
  '**/pom.xml',
  'build.gradle*',
  '**/build.gradle*',
  '**/*.gradle',
  '**/*.gradle.kts',
  'gradle.lockfile',
  '**/gradle.lockfile',
  'requirements*.txt',
  '**/requirements*.txt',
  'constraints*.txt',
  '**/constraints*.txt',
  'pyproject.toml',
  '**/pyproject.toml',
  'poetry.lock',
  '**/poetry.lock',
  'Pipfile',
  '**/Pipfile',
  'Pipfile.lock',
  '**/Pipfile.lock',
  'setup.py',
  '**/setup.py',
  'setup.cfg',
  '**/setup.cfg',
  '.github/workflows/*.yml',
  '.github/workflows/*.yaml',
  '.gitlab-ci.yml',
  'Jenkinsfile',
  'Makefile',
  'scripts/**',
  'deploy/**',
  'k8s/**',
  'helm/**',
  'config/**',
  '.env*',
  'dist/**',
  'build/**',
  'target/**',
  'coverage/**',
  'node_modules/**',
  '*.tgz',
  '**/*.tgz',
  '*.zip',
  '**/*.zip',
  '*.jar',
  '**/*.jar',
  '*.war',
  '**/*.war',
  '**/*.map',
  'migrations/**',
  'src/test/**',
  'test/**',
];

function renderList(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

function inferCapabilities(rule) {
  const id = rule.id || '';
  if (id.includes('-MYSQL-')) return ['persistence.sql', 'persistence.sql.mysql'];
  if (id.includes('-ORACLE-')) return ['persistence.sql', 'persistence.sql.oracle'];
  if (id.includes('-POSTGRESQL-')) return ['persistence.sql', 'persistence.sql.postgresql'];
  if (id.includes('-OCEANBASE-')) return ['persistence.sql', 'persistence.sql.oceanbase'];
  if (id.includes('-REDIS-')) return ['middleware.redis'];
  if (id.includes('-RABBITMQ-')) return ['middleware.mq', 'middleware.mq.rabbitmq'];
  if (id.includes('-DROOLS-')) return ['rules.drools'];
  if (id.includes('-VUE-') || id.includes('-FE-')) return ['frontend.vue'];
  if (id.includes('-PY-') || id.includes('-PYTHON-')) return ['language.python'];
  if (id.includes('-JAVA-')) return ['language.java'];
  if (id.includes('-SQLFLUFF-')) return ['persistence.sql', 'workflow.db-migration'];
  if (id.includes('-SEC-')) return ['common.core', 'security.secrets'];
  if (id.includes('-WORKFLOW-')) return ['common.core'];
  return ['common.core'];
}

function renderRule(rule) {
  const paths = rule.paths.map((item) => `  - "${item}"`).join('\n');
  const capabilities = inferCapabilities(rule).map((item) => `  - ${item}`).join('\n');
  return `## ${rule.id} ${rule.title}

\`\`\`yaml
score: ${rule.score}
severity: ${rule.severity}
hardBlock: ${rule.hardBlock}
paths:
${paths}
capabilities:
${capabilities}
\`\`\`

**规则说明**：${rule.desc}

**检查要点**：
${renderList(rule.checks)}

**违规风险**：${rule.risk}

**修复建议**：
${renderList(rule.fixes)}

**参考来源**：${rule.refs}`;
}
function renderDoc(title, rules) {
  return `# ${title}\n\n${rules.map(renderRule).join('\n\n')}\n`;
}

function rule(id, title, score, severity, hardBlock, paths, desc, checks, risk, fixes, refs) {
  return { id, title, score, severity, hardBlock, paths, desc, checks, risk, fixes, refs };
}

const javaRules = [
  rule('DEFAULT-JAVA-SEC-001', '禁止提交密钥、Token、私钥和数据库密码', 95, 'critical', true, springConfigPaths, 'Java 代码、构建脚本和 Spring 配置中不得写入真实凭据。跨栈安全规则关注全局底线，本规则关注 Java/Spring 常见落点。', ['检查 application 配置、测试配置、构建脚本和常量类是否出现真实密码、Token 或私钥。', '检查凭据是否可以改由环境变量、配置中心或密钥服务注入。'], '凭据泄露会导致生产账号接管、数据库暴露或供应链入侵。', ['删除凭据并改为外部注入。', '立即轮换已经提交或可能泄露的凭据。'], 'OWASP Secrets Management Cheat Sheet；CWE-798；GitHub Secret Scanning。'),
  rule('DEFAULT-JAVA-SEC-002', '禁止拼接 SQL、JPQL、LDAP 或命令执行参数', 95, 'critical', true, javaPaths, '不得把用户输入、请求参数、外部配置或可变字段直接拼接进 SQL、JPQL、LDAP 查询或系统命令。', ['检查字符串拼接、String.format、模板表达式和 QueryBuilder 是否混入未绑定参数。', '检查 MyBatis `${}`、JPA 动态查询和 Runtime.exec/ProcessBuilder 参数是否有白名单或绑定。'], '注入漏洞可能造成越权读取、任意命令执行、数据篡改或服务接管。', ['改用参数化查询、绑定变量、命令参数数组和白名单映射。', '动态标识符必须通过固定枚举映射，不允许透传用户输入。'], 'OWASP SQL Injection Prevention Cheat Sheet；CWE-89；阿里巴巴 Java 开发手册。'),
  rule('DEFAULT-JAVA-SEC-003', '禁止反序列化不可信输入或缺少过滤', 90, 'critical', true, javaPaths, '不得对来自请求、消息队列、缓存、文件上传或外部系统的数据直接执行 Java 原生反序列化。', ['检查 ObjectInputStream、readObject、XMLDecoder、第三方反序列化入口是否处理不可信输入。', '检查是否配置 JEP 290 过滤、类型白名单或安全替代格式。'], '不可信反序列化可能触发 RCE、任意对象构造或权限绕过。', ['改用 JSON 等受控格式并做 schema 校验。', '必须保留反序列化时配置类型白名单和对象过滤器。'], 'OWASP Deserialization Cheat Sheet；Oracle Serialization Filtering。'),
  rule('DEFAULT-JAVA-SEC-004', 'Web 入口必须保持认证和授权边界', 95, 'critical', true, springWebPaths, 'Controller、Resource 和 Security 配置不得移除认证、授权、租户归属或角色校验。', ['检查新增路由是否继承已有安全策略。', '检查管理端、用户私有资源、订单、权限和数据导出接口是否校验操作者身份与资源归属。'], '授权边界破坏会造成未授权访问、水平越权或管理功能暴露。', ['恢复 Spring Security、方法级授权或显式归属校验。', '为越权场景补充回归测试。'], 'Spring Security Authorization 文档；OWASP API Security Top 10。'),
  rule('DEFAULT-JAVA-SEC-005', 'XML 解析必须禁用外部实体和不可信 DTD', 95, 'critical', true, javaPaths, '解析 XML、SVG、Office、SOAP 或上传文件时，不得在未加固的解析器上处理不可信输入。', ['检查 DocumentBuilderFactory、SAXParserFactory、XMLInputFactory、TransformerFactory、SAXReader 是否禁用 DOCTYPE、外部实体和外部 DTD。', '检查是否限制实体展开、文件访问、网络访问和解析大小。'], 'XXE 可能读取服务器文件、发起 SSRF、泄露凭据或造成拒绝服务。', ['禁用 DTD 和外部实体，并限制外部 schema、stylesheet、entity 访问。', '对上传 XML 增加大小、类型和 schema 校验。'], 'OWASP XML External Entity Prevention Cheat Sheet；CWE-611；JAXP Security Guide。'),
  rule('DEFAULT-JAVA-SEC-006', '安全令牌、验证码和密钥材料必须使用 SecureRandom', 90, 'critical', true, javaPaths, '密码重置令牌、验证码、会话标识、salt、nonce、签名随机数等安全材料不得使用 Math.random 或 java.util.Random。', ['检查 random、Math.random、UUID 错误用途是否用于安全令牌。', '检查 SecureRandom 是否复用合理且没有固定种子。'], '弱随机会让令牌可预测，导致账号接管、验证码绕过或签名伪造。', ['使用 SecureRandom 生成安全随机数。', '令牌应有足够熵、过期时间和一次性使用约束。'], 'OWASP Cryptographic Storage Cheat Sheet；JDK SecureRandom；阿里巴巴安全规约。'),
  rule('DEFAULT-JAVA-SEC-007', '禁止弱加密、弱摘要和 ECB 模式用于安全保护', 90, 'critical', true, javaPaths, '密码、Token、敏感字段、签名和传输保护不得使用 MD5、SHA1、DES、RC4、AES/ECB 等弱算法或模式。', ['检查 MessageDigest、Cipher、Mac、PasswordEncoder 的算法选择。', '检查密码存储是否使用可抗暴力破解的专用算法。'], '弱加密会导致密码被破解、密文模式泄露、完整性保护失效或合规风险。', ['密码使用 bcrypt、scrypt、Argon2 或 PBKDF2。', '对称加密使用认证加密模式并正确管理 IV、nonce 和密钥轮换。'], 'OWASP Cryptographic Storage Cheat Sheet；CWE-327；JDK Cryptography Architecture。'),
  rule('DEFAULT-JAVA-SEC-008', '文件路径必须归一化并限制在允许目录内', 90, 'critical', true, javaPaths, '下载、上传、导入导出、模板渲染和压缩包处理不得直接使用用户可控路径或文件名。', ['检查 File、Path、Resource、MultipartFile、ZipEntry 和静态资源读取是否接收外部路径。', '检查 normalize/realPath 后是否仍限制在允许的 base directory 内。'], '路径遍历会造成任意文件读取、覆盖、删除、压缩包逃逸或敏感配置泄露。', ['使用固定目录和安全文件名映射。', '解析真实路径后校验仍位于允许目录内，并拒绝绝对路径、.. 和特殊设备路径。'], 'OWASP Path Traversal；CWE-22；Java NIO Path。'),
  rule('DEFAULT-JAVA-SPR-001', '禁止明确删除或绕过关键输入校验', 85, 'high', true, springWebPaths, '不得明确移除认证、授权、持久化、金额、权限或数据破坏相关的 Bean Validation、手动校验和业务约束。', ['检查 @Valid、@Validated、NotNull、Size、Pattern、自定义 Validator 是否被删除。', '检查金额、状态流转、租户、权限和危险操作是否绕过校验。'], '关键校验被移除会导致脏数据入库、越权参数、数据破坏或业务约束失效。', ['恢复关键校验并把校验放在入口和领域边界。', '为被绕过的边界补充失败用例。'], 'Spring Validation；Bean Validation；阿里巴巴 Java 开发手册。'),
  rule('DEFAULT-JAVA-SPR-002', '禁止破坏事务一致性边界', 90, 'critical', true, springServicePaths, '多表、多资源或多步骤写入必须保持清晰事务边界，不得让关键写入半成功。', ['检查 @Transactional 是否被删除、传播级别是否改变、异常是否被吞掉。', '检查资金、库存、订单、权限、规则结果落库等路径是否保持原子性。'], '事务边界破坏会造成资金、库存、状态或审计数据不一致。', ['恢复事务注解或显式事务控制。', '异常应回滚、重新抛出或进入补偿流程。'], 'Spring Transaction 文档；MySQL InnoDB 事务；Oracle COMMIT/ROLLBACK。'),
  rule('DEFAULT-JAVA-SPR-003', '@Transactional 方法避免内部自调用导致事务失效', 60, 'high', false, springServicePaths, 'Spring AOP 代理下，同类内部调用事务方法通常不会触发事务增强。', ['检查 this.method() 调用被 @Transactional 标注的方法。', '检查事务入口是否通过代理、独立 service 或 TransactionTemplate 触发。'], '事务未生效会导致异常后提交、锁范围异常或数据部分更新。', ['把事务方法移到独立 Bean，或通过代理入口调用。', '必要时使用 TransactionTemplate 表达边界。'], 'Spring AOP；Spring Transaction rollback rules。'),
  rule('DEFAULT-JAVA-SPR-004', 'checked exception 与事务回滚策略必须明确', 60, 'high', false, springServicePaths, 'Spring 默认对 unchecked exception 回滚；checked exception 需要明确 rollbackFor 或显式处理。', ['检查事务方法是否捕获或抛出 checked exception。', '检查 rollbackFor/noRollbackFor 是否和业务语义一致。'], '异常类型与回滚策略不匹配会导致错误提交或过度回滚。', ['为 checked exception 配置 rollbackFor。', '在方法契约中说明哪些异常会提交、回滚或补偿。'], 'Spring Transaction rollback rules；阿里巴巴 Java 开发手册异常规约。'),
  rule('DEFAULT-JAVA-SPR-005', 'Spring Boot Actuator 和管理端点不得默认暴露敏感能力', 85, 'critical', false, springConfigPaths, '生产配置不得无鉴权暴露 env、beans、heapdump、threaddump、logfile、shutdown、prometheus 等敏感或高成本端点。', ['检查 management.endpoints.web.exposure.include 是否使用 * 或包含敏感端点。', '检查 actuator、swagger、druid、h2-console、admin 页面是否有鉴权、网络隔离和脱敏。'], '管理端点暴露可能泄露配置、凭据、内存信息和运行时结构，甚至触发拒绝服务或远程操作。', ['只暴露必要健康检查和指标端点。', '为管理端点增加鉴权、内网访问控制、脱敏和审计。'], 'Spring Boot Actuator Endpoints；Spring Security；OWASP Security Misconfiguration。'),
  rule('DEFAULT-JAVA-SPR-006', 'Controller 不得直接返回数据库实体或内部异常细节', 70, 'high', false, springWebPaths, 'Web API 应返回受控 DTO 和统一错误结构，不得把 JPA/MyBatis 实体、内部字段、堆栈、SQL 或异常类名直接暴露给调用方。', ['检查 Controller 返回值是否直接使用 Entity、DO、PO 或包含 password、secret、deleted、tenant 等内部字段。', '检查异常处理是否把 stack trace、SQL、类名和内部路径返回给前端。'], '内部模型泄露会造成敏感字段暴露、接口兼容性脆弱和攻击面扩展。', ['使用 DTO/VO 并显式选择输出字段。', '统一异常处理，只返回业务错误码、可理解消息和 traceId。'], 'Spring MVC Exception Handling；OWASP Error Handling；阿里巴巴分层规约。'),
  rule('DEFAULT-JAVA-SPR-007', '定时任务、监听器和异步入口必须防重入并具备幂等保护', 75, 'high', false, springServicePaths, 'Scheduled、Async、Listener、Consumer、Job 等非 HTTP 入口也必须有并发控制、幂等键、失败重试和补偿策略。', ['检查 @Scheduled、@Async、消息监听器和批处理任务是否可能并发重入。', '检查重复投递、任务超时、节点多实例和失败重试是否会重复写入。'], '后台入口缺少幂等和防重入会造成重复扣款、重复发货、重复发消息或数据状态错乱。', ['使用分布式锁、唯一约束、幂等表或任务状态机。', '为重复投递、并发执行和失败重试补充测试。'], 'Spring Scheduling；Spring Integration；消息幂等实践。'),
  rule('DEFAULT-JAVA-SPR-008', '事务内不得执行不可回滚的外部副作用', 80, 'critical', false, springServicePaths, '数据库事务内直接发送 MQ、HTTP 回调、邮件、文件删除、扣费网关调用等不可回滚副作用时，必须有 outbox、afterCommit 或补偿策略。', ['检查 @Transactional 方法内是否调用外部系统、消息发送或文件副作用。', '检查事务回滚后外部副作用是否仍会生效。'], '事务回滚无法撤销外部副作用，会造成数据库状态与消息、支付、库存、文件或第三方系统不一致。', ['使用事务消息、outbox 表、TransactionSynchronization afterCommit 或可靠补偿任务。', '把外部副作用移出主事务并保持幂等。'], 'Spring TransactionSynchronization；Transactional Outbox；分布式事务实践。'),
  rule('DEFAULT-JAVA-SPR-009', '配置绑定必须校验必填项、默认值和危险开关', 65, 'high', false, springConfigPaths, '新增 @ConfigurationProperties、@Value 或环境配置时，应声明必填、默认值、范围和危险开关保护。', ['检查配置项缺失时是否静默使用危险默认值。', '检查超时、线程池、开关、URL、密钥、文件路径和权限相关配置是否有校验。'], '配置缺失或默认值不当会导致启动后行为漂移、无限等待、权限放开或生产事故。', ['使用 @ConfigurationProperties 配合 validation。', '危险开关必须默认关闭，并在启动时校验范围和依赖。'], 'Spring Boot Externalized Configuration；Bean Validation；Twelve-Factor Config。'),
  rule('DEFAULT-JAVA-SPR-010', '缓存使用必须声明 key 边界、TTL 和数据隔离维度', 70, 'high', false, springServicePaths, 'Spring Cache、Redis、Caffeine、Guava Cache 等缓存不得缺少租户/用户/权限维度、TTL、失效策略和穿透保护。', ['检查 @Cacheable key 是否包含 tenantId、userId、权限范围或业务隔离字段。', '检查缓存是否有 TTL、容量上限、空值策略和变更失效路径。'], '缓存 key 维度不完整会造成跨租户数据泄露；缺少 TTL 和容量控制会造成脏数据或内存膨胀。', ['把隔离维度纳入 key。', '设置 TTL、容量、空值保护和写入后失效策略。'], 'Spring Cache；Redis Best Practices；Guava Cache。'),
  rule('DEFAULT-JAVA-SPR-011', '浏览器会话类应用不得全局关闭 CSRF 防护', 85, 'critical', false, springConfigPaths, '使用 Cookie、Session 或浏览器自动携带凭据的应用，不得无差别关闭 Spring Security CSRF 防护。', ['检查 http.csrf().disable、csrf(AbstractHttpConfigurer::disable) 和全局忽略路径。', '检查是否仅对纯 token API、非浏览器客户端或明确无状态接口做有限豁免。'], 'CSRF 关闭会让攻击者借助用户浏览器发起转账、修改资料、审批、删除等跨站请求。', ['保留默认 CSRF 防护。', '确需豁免时限定路径、客户端类型和认证方式，并补充说明。'], 'Spring Security CSRF；Spring Boot Actuator Security；OWASP CSRF。'),
  rule('DEFAULT-JAVA-SPR-012', '外部 URL 和回调地址必须使用白名单防止 SSRF', 95, 'critical', true, springWebPaths, 'RestTemplate、WebClient、HttpClient、OkHttp、URLConnection 等访问外部地址时，不得直接使用用户可控 URL、Host 或回调地址。', ['检查请求参数、数据库字段、配置下发和消息内容是否直接驱动外部 URL。', '检查是否限制协议、域名、IP 网段、端口和重定向。'], 'SSRF 可访问内网服务、云元数据、管理端点或绕过边界防护读取敏感数据。', ['使用业务枚举或配置白名单映射目标地址。', '拒绝内网、环回、链路本地、元数据地址和危险协议，并限制重定向。'], 'OWASP SSRF Prevention Cheat Sheet；Spring WebClient；Apache HttpClient。'),
  rule('DEFAULT-JAVA-MYBATIS-001', 'MyBatis ${} 只能用于白名单标识符', 90, 'critical', true, mybatisJavaPaths, 'MyBatis `${}` 是字符串替换，不得承载用户输入；只有表名、列名、排序字段等无法绑定的标识符可经白名单后使用。', ['检查 XML、注解 SQL 和 Provider 中 `${}` 的变量来源。', '检查 ORDER BY、表名、列名是否来自固定枚举映射。'], '`${}` 会绕过 PreparedStatement 参数绑定，造成 SQL 注入、越权查询或数据破坏。', ['值参数使用 `#{}`。', '动态标识符通过枚举或 Map 白名单转换，并拒绝未知值。'], 'MyBatis SQL Mapper XML；OWASP SQL Injection；阿里巴巴数据库规约。'),
  rule('DEFAULT-JAVA-MYBATIS-002', '批量 foreach SQL 必须限制集合规模和空集合语义', 60, 'high', false, mybatisJavaPaths, 'MyBatis foreach 构造 IN、批量 INSERT/UPDATE/DELETE 时必须限制集合大小，并明确空集合行为。', ['检查 foreach collection 是否可能来自用户无限输入。', '检查空集合是否生成全表条件、语法错误或跳过关键约束。'], '超大 IN 和批量 SQL 会拖垮数据库、突破参数限制；空集合处理错误可能造成全表更新或运行时失败。', ['限制批量大小并分批执行。', '空集合应显式返回空结果或拒绝执行危险 DML。'], 'MyBatis Dynamic SQL；数据库参数限制；阿里巴巴数据库规约。'),
  rule('DEFAULT-JAVA-MYBATIS-003', 'ResultMap 和关联查询必须避免隐式 N+1 与字段错映射', 55, 'medium', false, mybatisJavaPaths, '复杂 ResultMap、collection、association 和懒加载映射必须确认字段别名、主键 id 和查询次数。', ['检查嵌套 select 是否会在列表查询中触发 N+1。', '检查 resultMap 是否缺少 id 字段或列别名导致对象合并错误。'], 'N+1 会造成接口性能雪崩；字段错映射会造成脏数据、对象覆盖或权限字段混乱。', ['列表场景使用 join、批量查询或显式分页。', '为复杂映射补充列别名、id 映射和样例测试。'], 'MyBatis Result Maps；MyBatis Lazy Loading；性能审查实践。'),
  rule('DEFAULT-JAVA-MYBATIS-004', 'Mapper 方法与 XML SQL 必须保持参数名和返回契约一致', 55, 'high', false, mybatisJavaPaths, 'Mapper 接口参数、@Param、XML 引用名和返回类型必须一致，避免运行时 BindingException 或错误映射。', ['检查多参数方法是否使用 @Param 并与 XML 引用一致。', '检查返回单对象、Optional、List、Map 和影响行数是否与 SQL 语义一致。'], '参数名不一致会在运行时报错；返回契约错误会隐藏重复数据、漏处理更新失败或误判成功。', ['为多参数加 @Param。', 'DML 返回影响行数并校验预期，查询返回类型与唯一性约束一致。'], 'MyBatis Mapper XML；MyBatis Java API；阿里巴巴异常规约。'),
  rule('DEFAULT-JAVA-MYBATIS-005', 'MyBatis-Spring 事务管理器必须绑定相同 DataSource', 85, 'critical', false, [...mybatisJavaPaths, ...springConfigPaths], 'SqlSessionFactoryBean、Mapper 和 PlatformTransactionManager 必须使用同一 DataSource，或显式声明多数据源事务策略。', ['检查 SqlSessionFactoryBean dataSource 与 DataSourceTransactionManager/JpaTransactionManager 是否不一致。', '检查多数据源 Mapper 是否缺少路由、传播边界或分布式事务说明。'], '事务管理器绑定错误会让 Mapper 写入不受事务控制，造成异常后仍提交或跨库数据不一致。', ['确保同一数据源由同一个事务管理器管理。', '多数据源场景按业务拆分事务边界，并明确补偿或分布式事务方案。'], 'MyBatis-Spring Transactions；Spring Transaction Management。'),
  rule('DEFAULT-JAVA-JVM-001', '禁止在请求路径或用户可触发路径新增无界线程、无界队列或无背压异步任务', 85, 'high', true, javaPaths, '不得在生产请求路径中创建无界线程、无界队列、无限异步提交或缺少关闭策略的执行器。', ['检查 Executors.newCachedThreadPool、newFixedThreadPool 默认无界队列和 new Thread 循环创建。', '检查异步入口是否有容量、拒绝策略、超时、关闭和监控。'], '无界资源会导致 OOM、线程耗尽、级联超时或服务雪崩。', ['使用显式 ThreadPoolExecutor 参数和有界队列。', '为用户可触发任务增加限流、背压和拒绝策略。'], 'JDK ThreadPoolExecutor；阿里巴巴 P3C 线程池规约。'),
  rule('DEFAULT-JAVA-JVM-002', 'IO、流、连接等资源必须确定性关闭', 60, 'high', false, javaPaths, '文件、网络、数据库、流、锁和客户端连接必须有确定性释放路径。', ['检查 InputStream、OutputStream、Connection、Statement、ResultSet、HttpClient response 是否关闭。', '检查异常路径是否也能释放资源。'], '资源泄露会导致连接池耗尽、文件句柄耗尽或长时间锁定。', ['使用 try-with-resources。', '把资源生命周期交给连接池或框架托管并确认关闭语义。'], 'Oracle try-with-resources；阿里巴巴 Java 开发手册。'),
  rule('DEFAULT-JAVA-JVM-003', '阻塞调用必须设置超时和失败处理', 60, 'high', false, javaPaths, 'HTTP、RPC、数据库、缓存、文件和外部命令等阻塞调用必须有超时、取消或降级策略。', ['检查新增客户端是否设置 connect/read/write timeout。', '检查失败是否会释放线程、返回可理解错误或进入重试/降级。'], '缺少超时会耗尽线程池并放大外部依赖故障。', ['设置合理超时和重试上限。', '对用户请求链路增加熔断、降级或失败返回。'], 'Spring HTTP client 文档；JDK Process API；OWASP API4 Resource Consumption。'),
  rule('DEFAULT-JAVA-LIB-001', 'BeanUtils 和对象拷贝不得跨安全边界盲拷贝', 75, 'high', false, javaPaths, 'Apache BeanUtils、Spring BeanUtils、MapStruct、ModelMapper 等对象拷贝不得把请求对象直接覆盖实体、权限字段、审计字段或租户字段。', ['检查 copyProperties、populate、map 是否从 DTO 直接写入 Entity。', '检查 id、tenantId、role、status、deleted、createdBy、balance 等敏感字段是否可被外部覆盖。'], '盲拷贝会造成越权修改、审计字段污染、租户串号或业务状态被伪造。', ['使用显式字段映射或忽略敏感字段。', '写入前在服务端重新计算权限、租户、状态和审计字段。'], 'Apache Commons BeanUtils；Spring BeanUtils；OWASP Mass Assignment。'),
  rule('DEFAULT-JAVA-LIB-002', 'JSON/XML 解析中的危险多态反序列化必须禁止', 85, 'critical', true, javaPaths, 'Jackson、Fastjson、Gson、XStream、JAXB 等解析外部输入时，不得开启危险多态反序列化、autoType 或宽松类型解析。', ['检查 enableDefaultTyping、autoType、XStream permissive type、未知类型反序列化等配置。', '检查是否存在可由外部输入触发的类型漂移、代理类型和任意类实例化。'], '危险多态反序列化可能导致 RCE、任意对象构造或权限绕过。', ['关闭默认多态反序列化，使用类型白名单。', '仅允许业务 DTO 和受控类型进入反序列化链路。'], 'OWASP Deserialization Cheat Sheet；Jackson Polymorphic Deserialization；Fastjson autoType 风险。'),
  rule('DEFAULT-JAVA-LIB-006', 'JSON/XML 解析必须限制输入大小、嵌套深度和未知字段策略', 60, 'high', false, javaPaths, '外部 JSON、XML、表单和消息体解析时应限制请求体大小、数组长度、递归深度和未知字段策略。', ['检查请求体、数组、嵌套对象、流式解析和解压后的总大小是否有上限。', '检查 FAIL_ON_UNKNOWN_PROPERTIES 或同等策略是否按业务场景显式配置。'], '无限制解析会造成内存耗尽、CPU 消耗过高、字段污染或接口契约漂移。', ['限制输入大小和结构。', '对 DTO 做 schema/validation，并明确未知字段是拒绝、忽略还是记录。'], 'OWASP Input Validation；Jackson Deserialization Features；安全解析实践。'),
  rule('DEFAULT-JAVA-LIB-003', 'Guava、Caffeine 和本地缓存必须设置容量上限和失效策略', 65, 'high', false, javaPaths, '本地缓存不得无界增长，也不得长期缓存权限、租户、配置或敏感数据而缺少失效策略。', ['检查 CacheBuilder、Caffeine、ConcurrentHashMap 缓存是否缺少 maximumSize/expireAfter。', '检查权限、用户、租户、价格和配置变更后是否会失效。'], '无界缓存会造成 OOM；脏缓存会造成越权、价格错误或配置不一致。', ['设置容量、TTL、刷新和失效策略。', '对关键缓存增加隔离 key、监控和手动失效入口。'], 'Guava Cache；Caffeine Cache；OWASP Resource Consumption。'),
  rule('DEFAULT-JAVA-LIB-004', '重试工具必须限制次数、退避和幂等边界', 70, 'high', false, javaPaths, 'Spring Retry、Resilience4j、Guava Retryer、自写 retry 不得对非幂等操作无限重试或无退避重试。', ['检查 retry 是否设置最大次数、超时、退避和熔断。', '检查支付、下单、扣库存、发消息等非幂等操作是否可被重复执行。'], '不受控重试会放大故障、造成重复写入、重复扣款或压垮下游。', ['只对幂等或已加幂等键的操作重试。', '设置最大次数、指数退避、总体超时和失败降级。'], 'Spring Retry；Resilience4j Retry；分布式系统重试实践。'),
  rule('DEFAULT-JAVA-LIB-005', 'ThreadLocal 必须在池化线程中清理并避免保存请求敏感上下文', 70, 'high', false, javaPaths, 'ThreadLocal、TransmittableThreadLocal、MDC 在 Web、线程池和异步任务中必须有 clear/remove 生命周期。', ['检查用户、租户、权限、traceId、数据源路由是否存入 ThreadLocal 后缺少 finally remove。', '检查线程池复用、异步传播和异常路径是否会清理上下文。'], 'ThreadLocal 泄露会导致用户串号、租户串号、日志污染、内存泄露或数据源路由错误。', ['在 finally 中 remove/clear。', '优先用显式上下文传参，异步任务只传播必要且可清理的上下文。'], 'JDK ThreadLocal；SLF4J MDC；阿里巴巴并发规约。'),
  rule('DEFAULT-JAVA-LIB-007', '压缩包解压必须防路径穿越、解压炸弹和文件覆盖', 95, 'critical', true, javaPaths, '处理 zip、jar、tar、gzip 或用户上传压缩包时，不得直接信任 ZipEntry/TarEntry 名称、大小、符号链接和覆盖目标。', ['检查 ZipInputStream、ZipFile、TarArchiveInputStream、Commons Compress 解压是否校验真实目标路径。', '检查是否限制总大小、文件数量、压缩率、符号链接、特殊文件和覆盖已有文件。'], '不安全解压会造成 Zip Slip、任意文件覆盖、磁盘耗尽、配置篡改或远程代码执行前置条件。', ['解压前规范化目标路径并确认仍在允许目录内。', '设置总大小、文件数、层级、压缩率和覆盖策略，拒绝符号链接与特殊文件。'], 'OWASP File Upload Cheat Sheet；Snyk Zip Slip；Apache Commons Compress 安全实践。'),
  rule('DEFAULT-JAVA-SPR-013', 'CORS 配置不得对携带凭据的请求开放任意 Origin', 95, 'critical', true, springConfigPaths, 'Spring MVC、Spring Security、网关和配置文件中不得同时允许任意 Origin 与 Cookie、Authorization 或 allowCredentials。', ['检查 allowedOrigins("*")、allowedOriginPatterns("*")、Access-Control-Allow-Origin: * 与 allowCredentials/withCredentials 是否组合出现。', '检查 CORS 是否使用业务域名白名单，并区分开发、测试和生产 profile。'], '凭据跨域放开会让恶意站点借助用户浏览器读取或触发受保护接口，造成账号接管和数据泄露。', ['使用明确域名白名单，不要对凭据请求返回通配 Origin。', '按环境隔离 CORS 配置，并为管理端和私有 API 禁止宽泛跨域。'], 'Spring Framework CORS 文档；MDN CORS credentials；OWASP CSRF Prevention Cheat Sheet。'),
  rule('DEFAULT-JAVA-JVM-004', '日志框架、表达式和模板不得开启不可信查找或远程加载', 90, 'critical', true, javaPaths, 'Log4j、表达式语言、模板引擎和插件加载配置不得允许外部输入触发 JNDI、远程类加载、脚本执行或危险 lookup。', ['检查日志格式、MDC、错误消息和模板是否直接拼入外部输入并触发 lookup/表达式解析。', '检查是否启用远程 JNDI、脚本引擎、动态模板或不可信插件来源。'], '危险查找和远程加载可能导致 RCE、敏感信息泄露或日志注入扩大为系统接管。', ['关闭危险 lookup、远程加载和脚本能力。', '日志只记录转义后的数据，模板和插件只允许可信源码或签名包。'], 'Apache Log4j 安全公告；OWASP Injection；CWE-94。'),
  rule('DEFAULT-JAVA-P3C-001', '集合转 Map 必须处理重复 key', 60, 'high', false, javaPaths, '使用 stream collect(toMap) 或手写映射时必须明确重复 key 的处理方式。', ['检查 Collectors.toMap 是否提供 merge function。', '检查重复 key 是报错、保留旧值、保留新值还是聚合列表。'], '重复 key 会导致运行时异常或静默覆盖业务数据。', ['添加 merge function 并说明业务语义。', '必要时改为 groupingBy 或显式校验重复数据。'], '阿里巴巴 Java 开发手册集合处理；JDK Collectors。'),
  rule('DEFAULT-JAVA-P3C-002', 'BigDecimal 禁止使用 double 构造', 60, 'high', false, javaPaths, '金额、费率和精确小数不得通过 new BigDecimal(double) 构造。', ['检查 new BigDecimal(0.1) 等浮点构造。', '检查金额字段是否从字符串、整数分或 BigDecimal.valueOf 构造。'], '浮点二进制误差会造成账务、计费或对账偏差。', ['使用 BigDecimal.valueOf、字符串构造或最小货币单位整数。', '为金额计算补充边界测试。'], '阿里巴巴 Java 开发手册；JDK BigDecimal API。'),
  rule('DEFAULT-JAVA-P3C-003', '覆写 equals 必须同时覆写 hashCode', 55, 'high', false, javaPaths, '类覆写 equals 后必须保持 hashCode 契约一致。', ['检查实体、值对象、DTO 是否只覆写 equals。', '检查 Lombok、自生成方法和手写方法是否覆盖一致字段。'], 'HashMap、HashSet 和缓存键会出现查找失败或重复数据。', ['同时覆写 hashCode。', '优先使用 IDE/Lombok 生成并补充集合行为测试。'], 'Java Object 契约；阿里巴巴 Java 开发手册。'),
  rule('DEFAULT-JAVA-P3C-004', 'SimpleDateFormat 不得作为共享静态实例', 60, 'high', false, javaPaths, 'SimpleDateFormat 非线程安全，不得在多线程环境作为 static 共享实例。', ['检查 static SimpleDateFormat 和单例共享格式化器。', '检查线程池、Web 请求和并发任务中是否共享该实例。'], '并发格式化或解析会产生错误日期、异常或脏数据。', ['改用 DateTimeFormatter。', '如必须使用旧 API，使用局部变量或 ThreadLocal 并确保清理。'], '阿里巴巴 P3C 并发规约；JDK DateTimeFormatter。'),
  rule('DEFAULT-JAVA-P3C-005', '集合、数组和 Optional 返回值不得用 null 表达空结果', 45, 'medium', false, javaPaths, '返回集合、数组、分页结果和 Optional 时，应使用空集合或 Optional.empty，避免调用方反复防御空指针。', ['检查新增 public 方法、Service 和 Mapper 返回 List/Set/Map/array/Optional 时是否可能返回 null。', '检查调用方是否因未判空直接遍历或链式调用。'], 'null 空结果会造成运行时 NPE，并把空语义扩散到调用链。', ['返回 Collections.emptyList、emptyMap、空数组或 Optional.empty。', '对外接口在契约中明确空值语义。'], '阿里巴巴 Java 开发手册；Effective Java；Google Java Style null practices。'),
  rule('DEFAULT-JAVA-P3C-006', 'BigDecimal 比较数值相等不得使用 equals', 55, 'high', false, javaPaths, '金额、费率、数量等 BigDecimal 数值比较不得用 equals 判断业务相等，因为 scale 不同会导致结果不一致。', ['检查 amount.equals(BigDecimal.ZERO) 或两个金额对象 equals 比较。', '检查是否需要区分 scale 的特殊场景。'], '1.0 与 1.00 在 equals 下不相等，会导致金额判断、阈值判断或状态流转错误。', ['使用 compareTo 判断数值相等。', '确需比较 scale 时在规则或注释中说明业务含义。'], 'JDK BigDecimal；阿里巴巴 Java 开发手册。'),
  rule('DEFAULT-JAVA-P3C-007', 'BigDecimal divide 必须显式指定精度和舍入策略', 60, 'high', false, javaPaths, 'BigDecimal 除法在不能整除时会抛 ArithmeticException，金额和费率计算必须显式指定 scale 与 RoundingMode。', ['检查 a.divide(b) 是否缺少 scale、MathContext 或 RoundingMode。', '检查舍入策略是否与业务、税务或账务口径一致。'], '非终止小数会在运行时抛异常，或因默认精度不明确造成账务偏差。', ['使用 divide(divisor, scale, roundingMode) 或 MathContext。', '统一金额精度和舍入策略，并补充边界测试。'], 'JDK BigDecimal；阿里巴巴金额精度规约。'),
  rule('DEFAULT-JAVA-P3C-008', '禁止新增调用已废弃 API 或内部不稳定 API', 45, 'medium', false, javaPaths, '新增代码不应继续依赖 @Deprecated、sun.*、com.sun.* 或明确标注不稳定的内部 API。', ['检查新增调用是否指向 @Deprecated 类、方法、字段。', '检查是否依赖 JDK 内部包、实验性 API 或三方库内部包。'], '废弃和内部 API 可能在升级时删除或语义变化，造成构建失败、运行时异常或安全补丁无法升级。', ['迁移到官方替代 API。', '确需临时保留时写明兼容原因、版本边界和移除计划。'], 'Alibaba P3C deprecated API 规则；JDK Encapsulation；Google Java Style。'),
  rule('DEFAULT-JAVA-SEATA-001', 'Seata 全局事务不得吞掉异常后正常返回', 95, 'critical', true, seataPaths, '使用 Seata @GlobalTransactional、AT、TCC 或 Saga 处理跨服务写入时，分支失败不得被 catch 后正常返回，必须触发回滚、补偿或明确失败状态。', ['检查 @GlobalTransactional 方法内是否捕获 Exception、Throwable、RuntimeException 后仅记录日志或 return。', '检查远程扣款、库存、订单、积分等分支失败后是否重新抛出、标记 rollbackOnly 或进入补偿任务。'], '全局事务吞掉异常会让 Seata 认为事务成功，造成资金、库存、订单状态或消息结果跨服务不一致。', ['捕获异常后重新抛出能触发全局回滚的异常，或显式设置回滚状态。', '确需继续执行时必须记录补偿单、失败状态和可重试任务，并为失败分支补充测试。'], 'Apache Seata Global Transaction；Seata AT/TCC 模式文档；分布式事务一致性实践。'),
  rule('DEFAULT-JAVA-SEATA-002', 'Seata TCC/Saga 分支必须具备幂等、空回滚和防悬挂', 95, 'critical', true, seataPaths, 'TCC、Saga 或自定义补偿分支必须定义 try/confirm/cancel 边界，并处理重复调用、空回滚和 cancel 先于 try 到达的悬挂场景。', ['检查 confirm/cancel 是否以全局事务 ID、分支 ID 或业务幂等键防重复。', '检查 cancel 在 try 未成功或未执行时是否能安全空回滚，并防止后续 try 再写入。'], 'TCC 协议缺失会造成重复扣款、重复解冻、补偿覆盖成功结果或悬挂事务污染后续请求。', ['为每个分支写入事务日志或状态表，记录 try/confirm/cancel 状态。', 'confirm/cancel 必须幂等，cancel 必须支持空回滚并标记防悬挂。'], 'Apache Seata TCC 模式；Seata Saga 模式；分布式事务 TCC 设计实践。'),
  rule('DEFAULT-JAVA-CLOUD-001', 'Spring Cloud 跨服务调用必须声明超时、重试和降级边界', 70, 'high', false, springCloudPaths, 'OpenFeign、RestTemplate、WebClient、Spring Cloud Gateway 或自写 HTTP 客户端的跨服务调用必须有连接超时、读取超时、总体超时、重试次数、退避和降级策略。', ['检查 Feign、RestTemplate、WebClient、OkHttp、HttpClient 配置是否缺少 timeout。', '检查 retry 是否只用于幂等接口，并是否有最大次数、退避、熔断或 fallback。'], '无超时会拖垮线程池；对非幂等操作重试会造成重复下单、重复扣款、重复发消息或级联故障。', ['设置连接、读取和总体超时。', '只对幂等调用开启有限重试，并配合熔断、隔离、fallback 和监控指标。'], 'Spring Cloud OpenFeign；Spring Retry；Resilience4j；微服务韧性设计实践。'),
  rule('DEFAULT-JAVA-CLOUD-002', '跨服务身份上下文不得信任客户端伪造 Header', 95, 'critical', true, springCloudPaths, '用户、租户、角色、权限、组织和数据范围等身份上下文不得直接信任浏览器或外部客户端传入的 Header。', ['检查 X-User-Id、X-Tenant-Id、X-Role、X-Org-Id、Authorization 解析是否来自可信网关或认证服务。', '检查 Feign 透传 Header 是否有签名、网关注入、服务间认证或零信任校验。'], '攻击者伪造 Header 可绕过认证授权，造成水平越权、跨租户数据泄露或管理权限冒用。', ['只接受网关或认证服务签发的身份上下文，并校验签名、来源和过期时间。', '内部服务间调用使用 mTLS、JWT 签名或等价可信凭据，禁止直接透传外部身份字段。'], 'OWASP API Security Broken Access Control；Spring Security Resource Server；微服务零信任实践。'),
  rule('DEFAULT-JAVA-NULL-001', '外部输入和可空返回解引用前必须显式建模或判空', 65, 'high', false, javaPaths, '@Nullable 返回、Map.get、集合查找、反序列化 DTO、外部接口响应和配置绑定字段在解引用前必须通过 Optional、校验约束、默认值或显式判空表达空值语义。', ['检查 Map.get、findFirst().orElse(null)、repository 查询、JSON/消息反序列化字段是否直接链式调用。', '检查 @Nullable、Optional、Bean Validation、Objects.requireNonNull 或空对象默认值是否表达契约。'], '空值契约不清会导致生产 NPE，常出现在少量脏数据、灰度字段、外部接口缺字段和缓存未命中场景。', ['用 Optional、空集合、校验注解或明确默认值表达可空语义。', '对外部 DTO 和反序列化结果先做 schema/Bean Validation，再进入业务逻辑。'], 'Uber NullAway；Error Prone Nullness；阿里巴巴 Java 开发手册空指针规约。'),
  rule('DEFAULT-JAVA-ERRPRONE-001', '不得忽略异步任务异常、Future 返回值和中断语义', 95, 'critical', true, javaPaths, 'Future、CompletableFuture、ExecutorService、@Async 和线程中断处理不得丢弃异常、忽略返回值或吞掉 InterruptedException。', ['检查 submit/execute/runAsync/supplyAsync 后是否没有 join/get/exceptionally/whenComplete 或集中错误处理。', '检查 catch InterruptedException 后是否恢复 Thread.currentThread().interrupt()、退出循环或向上抛出。'], '异步异常丢失会让关键任务假成功；吞掉中断会导致线程无法停止、发布卡死、任务重复执行或资源长期占用。', ['为异步任务增加统一异常处理、结果检查和告警。', '捕获 InterruptedException 后恢复中断标记并按业务退出、回滚或抛出。'], 'Google Error Prone FutureReturnValueIgnored；Error Prone InterruptedExceptionSwallowed；JDK Concurrency。'),
  rule('DEFAULT-JAVA-MAINT-001', '避免过大方法、过深嵌套和重复复杂逻辑', 35, 'medium', false, javaPaths, '新增代码应保持方法职责清晰，避免复杂分支、重复逻辑和难以审查的大段过程式代码。', ['检查单个方法是否承担多种业务职责。', '检查嵌套 if/for/try 是否影响理解和测试。'], '复杂代码会提高缺陷概率，让安全和数据一致性问题更难被审查发现。', ['提取命名清晰的小方法、领域对象或策略。', '为复杂分支补充行为测试。'], 'Fowler Refactoring；BDR bad smells；阿里巴巴 Java 开发手册。'),
];

const vueRules = [
  rule('DEFAULT-VUE-SEC-001', '禁止把不可信内容作为 Vue 模板编译', 95, 'critical', true, vuePaths, '不得把用户、接口、路由、存储或 CMS 输入作为 Vue template 或运行时模板编译。', ['检查 template、render、compile、SSR 模板是否拼入外部输入。', '检查动态组件或富文本方案是否绕过 Vue 安全模型。'], '不可信模板等同执行 JavaScript，可能导致 XSS、账号接管或数据泄露。', ['模板必须来自可信源码。', '用户内容只能作为数据渲染并进行转义或净化。'], 'Vue Security Guide；OWASP XSS Prevention。'),
  rule('DEFAULT-VUE-SEC-002', '禁止未净化的用户或接口 HTML 进入 v-html、innerHTML', 90, 'critical', true, vuePaths, '来自用户、接口、路由或本地存储的 HTML 不得未经净化进入 v-html、innerHTML 或类似 DOM sink。', ['检查 v-html、innerHTML、outerHTML、insertAdjacentHTML 的数据来源。', '检查是否使用可信 sanitizer 并限制允许标签和属性。'], '未净化 HTML 会造成 XSS、会话窃取和敏感数据泄露。', ['改为普通文本渲染。', '确需富文本时使用经过配置的 sanitizer 并保留服务端校验。'], 'Vue Security Guide；OWASP XSS Prevention Cheat Sheet。'),
  rule('DEFAULT-VUE-SEC-003', '动态 URL、CSS、事件属性必须经过白名单或净化', 80, 'high', false, vuePaths, '绑定到 href、src、style、事件或可执行属性的数据必须经过白名单和协议限制。', ['检查 :href、:src、:style、动态事件名和路由跳转目标。', '检查 javascript:、data:、外部域名和用户样式是否被限制。'], '恶意 URL 或样式可能造成 XSS、钓鱼跳转、点击劫持或内容欺骗。', ['使用固定枚举、URL 解析和协议白名单。', '后端也要对可保存 URL 做校验。'], 'Vue Security Guide；OWASP HTML5 Security Cheat Sheet。'),
  rule('DEFAULT-VUE-SEC-004', '禁止前端持久化敏感 Token、密钥或会话秘密', 95, 'critical', true, vuePaths, '不得把长期 Token、密钥、会话秘密或敏感凭据写入 localStorage、IndexedDB、源码常量或可导出的前端状态。', ['检查 localStorage、sessionStorage、IndexedDB、Pinia/Vuex 持久化和环境变量。', '检查 Token 是否可被任意脚本读取。'], '一旦发生 XSS，持久化秘密会被直接窃取并复用。', ['优先使用 HttpOnly、Secure、SameSite Cookie 或短期令牌。', '清理前端持久化凭据并轮换泄露令牌。'], 'OWASP HTML5 Security；OWASP Secrets Management。'),
  rule('DEFAULT-VUE-SEC-005', '外链 _blank 必须配置 rel noopener noreferrer', 45, 'medium', false, ['**/*.vue'], '新窗口打开外部链接时应阻断 opener 反向控制。', ['检查 target="_blank" 是否缺少 rel。', '检查封装链接组件是否统一处理外链。'], '缺少 rel 可能导致 tabnabbing 或外部页面控制原页面跳转。', ['添加 rel="noopener noreferrer"。', '封装统一的安全外链组件。'], 'Vue Security Guide；MDN rel noopener。'),
  rule('DEFAULT-VUE-SEC-006', 'SSR 必须为每个请求创建独立 app、router 和 store', 90, 'critical', true, vuePaths, 'Vue SSR、Nuxt 或自建服务端渲染不得在模块级共享用户状态、请求上下文、权限信息或缓存对象。', ['检查 SSR 入口是否每个请求创建 createApp、router、pinia/store 和 request context。', '检查模块顶层 reactive/ref/store 是否保存用户、租户、权限或接口响应。'], '跨请求状态污染会造成用户数据泄露、权限串号、缓存错配或页面内容互相污染。', ['把 app、router、store 和用户上下文放入请求级 factory。', '只允许共享无用户态的只读配置和静态资源缓存。'], 'Vue SSR Guide；Nuxt SSR state isolation；OWASP Sensitive Data Exposure。'),
  rule('DEFAULT-VUE-SEC-007', '前端路由守卫不得替代服务端鉴权', 80, 'high', false, vuePaths, '前端 route guard、菜单隐藏、按钮禁用只能改善体验，不得作为唯一权限控制；只有 diff 明确删除或绕过服务端鉴权证据时才应升级为强风险。', ['检查新增管理页面、导出、删除、审批等高风险入口是否只在前端判断角色。', '检查接口调用是否依赖后端鉴权、租户隔离和资源归属校验。'], '攻击者可以绕过前端路由和按钮限制直接调用接口，造成越权读取或修改。', ['后端接口必须执行认证、授权和资源归属校验。', '前端权限只作为展示控制，并保持与后端权限模型一致。'], 'OWASP Broken Access Control；Vue Router Navigation Guards。'),
  rule('DEFAULT-VUE-SEC-008', '前端不得把 CORS、withCredentials 当作服务端鉴权', 70, 'high', false, vuePaths, 'withCredentials、跨域代理和前端域名判断只能表达浏览器请求方式，不能替代服务端认证、授权、CSRF 和资源归属校验。', ['检查 axios/fetch withCredentials、Vite proxy、Nuxt server proxy 是否被当作安全边界。', '检查删除后端鉴权后是否只保留前端域名、路由或按钮限制。'], '误把 CORS 当安全机制会导致接口可被脚本或直接请求绕过，造成越权和数据泄露。', ['在服务端执行认证、授权、CSRF 和资源归属校验。', '前端只负责调用体验，并与后端权限契约保持一致。'], 'MDN CORS；OWASP Broken Access Control；OWASP CSRF Prevention。'),
  rule('DEFAULT-VUE-SEC-009', 'Blob、ObjectURL 和下载预览必须限制来源、类型和生命周期', 70, 'high', false, [...vuePaths, '**/*.html'], '前端下载、预览和 URL.createObjectURL 不得把不可信 HTML、SVG、脚本或外部文件作为可执行内容打开，并应释放临时 URL。', ['检查 Blob type、download 文件名、window.open、iframe/srcdoc、object/embed 和预览组件的数据来源。', '检查 URL.createObjectURL 是否在组件卸载、替换文件或下载完成后 revokeObjectURL。'], '不受控预览会造成 XSS、钓鱼下载、内存泄露或错误文件类型诱导执行。', ['服务端与前端共同限制 MIME、扩展名、内容来源和文件名。', '用安全下载方式处理不可信文件，并在生命周期内释放 ObjectURL。'], 'OWASP File Upload Cheat Sheet；MDN Blob URL；Vue Security Guide。'),
  rule('DEFAULT-VUE-CONTRACT-001', 'props 必须声明类型、必填项、默认值或 validator', 55, 'medium', false, ['**/*.vue', '**/*.ts', '**/*.tsx'], '组件 props 应表达清晰契约，避免隐式依赖和运行时猜测。', ['检查 props 是否缺少 type、required、default 或 validator。', '检查复杂对象是否声明结构和默认值。'], '组件契约不清会造成状态错乱、运行时错误和回归难定位。', ['补充 props 类型和默认值。', '对关键枚举使用 validator 或 TypeScript 类型。'], 'Vue Style Guide；Vue Props 文档。'),
  rule('DEFAULT-VUE-CONTRACT-002', '禁止直接修改 props', 65, 'high', false, ['**/*.vue', '**/*.ts', '**/*.tsx'], '子组件不得直接修改父组件传入的 props 或其可变嵌套状态。', ['检查 props.foo =、props.list.push、解构后回写等模式。', '检查是否通过 emit 或本地副本表达变更。'], '直接修改 props 会破坏单向数据流，导致父子状态不一致。', ['使用 emit 请求父组件更新。', '需要本地编辑时复制为本地 state。'], 'Vue Style Guide；Vue Component Props。'),
  rule('DEFAULT-VUE-CONTRACT-003', 'Vue 3 组件事件必须通过 emits 声明', 45, 'medium', false, ['**/*.vue', '**/*.ts', '**/*.tsx'], 'Vue 3 组件应声明 emits 和事件负载，保持组件 API 清晰。', ['检查 defineEmits 或 emits 选项是否缺失。', '检查事件名和 payload 是否有类型或校验。'], '事件契约不清会导致父组件监听错误和迁移兼容问题。', ['补充 emits 声明。', '用 TypeScript 类型或运行时校验表达 payload。'], 'Vue Component Events；Vue Style Guide。'),
  rule('DEFAULT-VUE-PERF-001', 'v-for 必须使用稳定且唯一的 key', 60, 'high', false, ['**/*.vue'], '列表渲染必须使用业务稳定唯一 key，不得使用随机值或易变 index。', ['检查 v-for 是否缺少 key。', '检查 key 是否使用 index、Math.random 或非唯一字段。'], '不稳定 key 会造成输入状态错位、动画异常和组件复用错误。', ['使用后端 ID 或业务唯一字段。', '无唯一字段时先补充数据建模。'], 'Vue Style Guide；Vue List Rendering。'),
  rule('DEFAULT-VUE-PERF-002', '避免在同一元素同时使用 v-if 和 v-for', 45, 'medium', false, ['**/*.vue'], '同一元素混用 v-if 和 v-for 会造成优先级困惑、性能浪费或访问不到循环变量。', ['检查模板中同一标签同时出现 v-if 和 v-for。', '检查过滤逻辑是否可以前置为 computed。'], '混用会造成渲染结果不稳定、性能下降或迁移问题。', ['把过滤结果放到 computed。', '用外层 template 或子组件拆分条件。'], 'Vue Style Guide；Vue Conditional Rendering。'),
  rule('DEFAULT-VUE-PERF-003', 'computed 不得包含副作用或异步逻辑', 60, 'high', false, vuePaths, 'computed 应保持同步、纯函数和可缓存，不应发请求、写状态或执行副作用。', ['检查 computed 内是否调用接口、修改 ref/reactive 或触发路由。', '检查异步逻辑是否应迁移到 watch 或显式 action。'], '副作用 computed 会导致循环更新、缓存失效和状态难以预测。', ['把副作用移入 watch、事件处理或 composable action。', 'computed 只返回派生值。'], 'Vue Computed 文档；Vue Reactivity。'),
  rule('DEFAULT-VUE-PERF-004', '避免深度 watch 大对象或在模板中执行高成本计算', 45, 'medium', false, vuePaths, '大对象 deep watch、模板内复杂过滤排序和每次 render 的高成本计算应受控。', ['检查 deep: true 是否作用于大对象。', '检查模板是否直接执行 filter/sort/reduce 或复杂函数。'], '高成本响应式遍历会造成输入卡顿和首屏性能下降。', ['缩小 watch 范围。', '把昂贵计算缓存到 computed 或服务端。'], 'Vue Performance Guide；Vue Watchers。'),
  rule('DEFAULT-VUE-PERF-005', 'computed 排序和反转不得直接修改原响应式数组', 55, 'high', false, vuePaths, '在 computed、render 或模板派生数据中使用 sort、reverse、splice 等可变方法前必须复制数组。', ['检查 computed 中是否直接对 ref/reactive 数组调用 sort、reverse、splice。', '检查派生列表是否意外修改源状态。'], '派生计算修改源数组会触发难以预测的重渲染、状态错位和回归缺陷。', ['使用 [...list].sort()、toSorted、slice 后再处理。', '需要修改源数据时放到显式 action，并说明业务意图。'], 'Vue List Rendering；JavaScript Array sort/reverse mutability。'),
  rule('DEFAULT-VUE-ASYNC-001', '组件请求必须处理取消、过期响应和卸载后的状态写入', 60, 'high', false, vuePaths, 'watcher、组件和 composable 中的异步请求必须处理竞态、取消和组件卸载。', ['检查快速切换参数时旧响应是否可能覆盖新状态。', '检查 onUnmounted、onWatcherCleanup 或 AbortController 是否被使用。'], '过期响应会覆盖新数据，卸载后写状态会造成警告或内存泄露。', ['使用 AbortController 或请求序列号。', '在卸载和 watcher cleanup 中取消请求。'], 'Vue Watchers；MDN AbortController。'),
  rule('DEFAULT-VUE-ASYNC-002', 'fetch/axios 必须处理失败、loading 复位和用户可理解错误状态', 55, 'high', false, vuePaths, '前端请求必须处理网络错误、HTTP 非成功状态和 finally 清理。', ['检查 catch、response.ok、axios error 和 loading finally。', '检查错误是否反馈给用户或上层流程。'], '吞错会造成假成功、无限 loading 或数据不一致。', ['补充错误处理和 finally。', '为关键流程添加重试或用户可理解提示。'], 'MDN Fetch；Axios Error Handling；Vue Guide。'),
  rule('DEFAULT-VUE-AUTH-001', '权限菜单、路由和按钮变更必须同步后端授权契约', 75, 'high', false, vuePaths, '新增或调整权限菜单、路由 meta、按钮权限和前端角色映射时，必须同步后端权限码、接口授权和资源归属策略。', ['检查前端权限码、菜单配置和后端接口权限注解或权限表是否一致。', '检查隐藏按钮后是否仍能通过接口直接执行高风险操作。'], '前后端权限契约漂移会造成误授权、误拒绝或前端隐藏但接口可直调的越权风险。', ['把权限码作为稳定契约维护，并补充接口级授权。', '为关键权限补充前后端契约测试或说明。'], 'OWASP Broken Access Control；Vue Router；企业权限模型实践。'),
  rule('DEFAULT-VUE-TS-001', '避免新增 any、@ts-ignore 和不必要的非空断言', 45, 'medium', false, ['**/*.vue', '**/*.ts', '**/*.tsx'], '新增类型逃逸必须有明确理由，不得用 any 或 @ts-ignore 掩盖组件和接口契约问题。', ['检查 any、as any、@ts-ignore、! 非空断言。', '检查接口响应和 props 是否可用类型建模。'], '类型逃逸会把可发现错误推迟到运行时。', ['补充真实类型、泛型或类型守卫。', '确需忽略时写明原因和移除条件。'], 'TypeScript noImplicitAny；typescript-eslint no-explicit-any。'),
  rule('DEFAULT-VUE-CONTRACT-004', 'setup 中 await 后不得注册依赖当前实例的 Vue 上下文 API', 65, 'high', false, vuePaths, '在 setup 或 composable 中执行 await 后，再调用 onMounted、watch、provide、inject、getCurrentInstance 等依赖当前组件实例的 API，可能丢失生命周期绑定。', ['检查 async setup、顶层 await 和 composable 内 await 之后是否注册生命周期、watch、provide/inject 或上下文 API。', '检查异步初始化是否能改为先注册副作用，再在副作用内部等待数据。'], '生命周期绑定丢失会导致清理失效、监听残留、状态写入错误或 SSR/客户端表现不一致。', ['在第一个 await 之前注册生命周期和 watcher。', '把异步逻辑放入已注册的回调、watchEffect 或显式 action 中，并补充卸载测试。'], 'Vue Composition API lifecycle hooks；Vue Watchers；eslint-plugin-vue/no-lifecycle-after-await。'),
  rule('DEFAULT-VUE-CONTRACT-005', 'composable、watch、事件监听和定时器必须随生命周期清理', 60, 'high', false, vuePaths, '组件和 composable 中创建的 watch、effectScope、DOM 事件、订阅、定时器、WebSocket、BroadcastChannel 等副作用必须有停止或清理路径。', ['检查 watch/watchEffect 返回的 stop 是否在脱离组件生命周期时被调用。', '检查 addEventListener、setInterval、订阅和连接是否在 onUnmounted、onScopeDispose 或 cleanup 中释放。'], '副作用不清理会造成重复请求、内存泄露、旧用户状态串扰和页面越用越慢。', ['把副作用绑定到组件生命周期或 effectScope。', '在 onUnmounted、onScopeDispose、watch cleanup 中移除监听、关闭连接和清理定时器。'], 'Vue Watchers cleanup；Vue effectScope/onScopeDispose；MDN EventTarget removeEventListener。'),
  rule('DEFAULT-VUE-CONTRACT-006', '响应式对象跨组件或异步传递不得丢失响应性', 55, 'medium', false, vuePaths, 'props、ref、reactive、Pinia state 在解构、浅拷贝、JSON clone、异步缓存或跨组件传递时，应避免丢失响应式追踪或写入错误副本。', ['检查直接解构 props/reactive 后在模板或 watch 中使用。', '检查 JSON.parse(JSON.stringify())、Object.assign、展开运算符是否复制响应式状态后继续期待自动更新。'], '响应性丢失会让页面数据不刷新、表单回显错乱、watch 不触发或父子组件状态分叉。', ['使用 toRefs、toRef、computed 或 storeToRefs 保留响应性。', '确需快照时命名为 snapshot 并避免继续作为响应式来源。'], 'Vue Reactivity Fundamentals；Vue Props 解构实践；Pinia storeToRefs。'),
  rule('DEFAULT-VUE-ROUTER-001', '路由参数参与请求、权限和跳转前必须 schema 或白名单校验', 70, 'high', false, vuePaths, 'route params、query、hash、history state 和 returnUrl 在用于 API 请求、权限判断、重定向、文件路径或筛选条件前必须校验格式、枚举和边界。', ['检查 route.query/params 是否直接拼入接口、跳转、下载地址、排序字段或权限逻辑。', '检查是否使用 schema、类型守卫、白名单枚举、URL 协议限制和默认值。'], '路由输入不受控会导致越权查询、开放重定向、XSS、错误筛选或接口压力放大。', ['为路由输入建立 schema 校验和默认值。', '排序、状态、跳转目标和资源 ID 必须通过白名单或服务端二次校验。'], 'Vue Router；OWASP Unvalidated Redirects；OWASP Input Validation。'),
  rule('DEFAULT-FE-TS-002', 'API、存储、postMessage 和环境输入必须先按 unknown 校验', 75, 'high', false, vuePaths, '来自 API、localStorage、sessionStorage、postMessage、URL、环境变量和第三方 SDK 的数据不得直接 as 成业务类型，应先按 unknown 进入 schema 校验或类型守卫。', ['检查 await res.json() as Xxx、JSON.parse(...) as Xxx、event.data as Xxx、import.meta.env 直接信任。', '检查关键字段是否经过 zod、valibot、io-ts、手写 type guard 或服务端契约校验。'], '类型断言不会做运行时校验，外部数据缺字段或被污染时会造成权限误判、页面崩溃和脏数据提交。', ['外部输入先标记为 unknown，再通过 schema/类型守卫转换为业务类型。', '失败时进入错误状态、默认值或拒绝流程，不要继续使用半可信对象。'], 'TypeScript unknown；typescript-eslint no-unsafe-*；OWASP Input Validation。'),
];

const pythonRules = [
  rule('DEFAULT-PYTHON-SEC-001', '禁止反序列化不可信 pickle、marshal 或 shelve 数据', 95, 'critical', true, pythonPaths, 'Python 代码不得对来自请求、文件上传、消息队列、缓存、外部系统或用户可控路径的数据直接执行不可信反序列化。', ['检查 pickle.load、pickle.loads、marshal.load、shelve.open、joblib.load、dill.loads 等入口的数据来源。', '检查是否存在签名校验、类型白名单、隔离执行或改用 JSON/schema 的替代方案。'], '不可信反序列化可能执行任意代码、构造恶意对象或绕过权限边界。', ['改用 JSON、dataclass、pydantic 等受控数据格式并做 schema 校验。', '确需反序列化时只允许可信来源，并增加签名、版本和类型白名单校验。'], 'Python pickle 官方文档安全警告；OWASP Deserialization Cheat Sheet；Bandit B301。'),
  rule('DEFAULT-PYTHON-SEC-002', '禁止 shell=True 执行用户可控命令', 95, 'critical', true, pythonPaths, '不得把用户输入、接口参数、配置项、文件名或数据库字段拼接后交给 subprocess、os.system、popen 等 shell 执行。', ['检查 subprocess.run/Popen/call/check_output 中 shell=True 的参数来源。', '检查 os.system、os.popen、commands、pty.spawn 是否拼接外部输入。'], '命令注入会导致任意命令执行、服务器接管、数据泄露或横向移动。', ['使用参数数组并保持 shell=False。', '命令、子命令、文件名和可选参数必须通过固定白名单映射。'], 'Python subprocess Security Considerations；OWASP OS Command Injection Defense；Bandit B602/B605。'),
  rule('DEFAULT-PYTHON-SEC-003', '禁止 eval、exec 或动态 import 执行不可信输入', 95, 'critical', true, pythonPaths, '不得把用户输入、接口返回、配置文本或数据库内容交给 eval、exec、compile、__import__、importlib 动态执行。', ['检查 eval/exec/compile 的表达式是否来自外部输入。', '检查动态 import、getattr 调用链是否允许用户选择模块、类或函数。'], '动态代码执行可能造成 RCE、权限绕过、任意文件访问或业务逻辑被替换。', ['改用显式函数映射、枚举表或表达式解析器。', '确需插件化时使用签名校验、白名单和隔离运行环境。'], 'OWASP Code Review Guide；Bandit B307；Python 安全实践。'),
  rule('DEFAULT-PYTHON-SEC-004', 'SQL 查询必须参数化，禁止字符串拼接外部输入', 95, 'critical', true, pythonPaths, 'Python 数据访问代码不得用 f-string、百分号格式化、format 或字符串拼接把外部输入直接放入 SQL。', ['检查 sqlite3、pymysql、psycopg、cx_Oracle、SQLAlchemy text/raw SQL 是否使用绑定参数。', '检查 order by、表名、列名等动态标识符是否来自白名单映射。'], 'SQL 注入会造成越权读取、批量修改、删除数据或数据库权限提升。', ['使用 DB-API 参数绑定、ORM 查询构造器或命名绑定变量。', '动态标识符只能从固定枚举映射生成。'], 'OWASP SQL Injection Prevention Cheat Sheet；Python sqlite3 参数化示例；PEP 249。'),
  rule('DEFAULT-PYTHON-SEC-005', '禁止弱随机、弱哈希或硬编码密钥用于安全场景', 90, 'critical', true, pythonPaths, '令牌、验证码、密码重置、签名密钥、会话秘密和密码存储不得使用 random、MD5、SHA1 或硬编码密钥。', ['检查 random.random/randint/choice 是否用于 token、salt、secret、nonce、验证码等安全字段。', '检查 hashlib.md5/sha1 是否用于密码、签名或完整性保护；检查源码和配置中的真实密钥。'], '弱随机和弱哈希会导致 token 可预测、密码可破解、签名被伪造或密钥泄露。', ['使用 secrets、os.urandom 或 cryptography 的安全随机。', '密码使用 bcrypt、argon2、scrypt 或 PBKDF2；密钥放入密钥管理或受控配置。'], 'Python secrets 官方文档；OWASP Cryptographic Storage Cheat Sheet；Bandit B303/B311。'),
  rule('DEFAULT-PYTHON-SEC-006', '禁止不安全 YAML 和扩展反序列化处理不可信输入', 95, 'critical', true, pythonPaths, 'yaml.load、ruamel unsafe typ、jsonpickle、cloudpickle、dill、joblib 等不得直接处理来自用户、文件上传、消息或外部系统的不可信数据。', ['检查 yaml.load 是否缺少 SafeLoader 或 safe_load。', '检查扩展反序列化库的数据来源、类型白名单、签名校验和隔离执行。'], '不安全 YAML 和扩展反序列化可能实例化任意对象、执行代码或绕过权限边界。', ['使用 safe_load、JSON、pydantic/dataclass schema 或受控格式。', '确需反序列化时加入签名、类型白名单、版本校验和隔离运行。'], 'PyYAML 文档安全警告；OWASP Deserialization Cheat Sheet；Bandit B506。'),
  rule('DEFAULT-PYTHON-SEC-007', 'HTTP 客户端不得关闭 TLS 校验或信任用户可控代理证书', 95, 'critical', true, pythonPaths, 'requests、httpx、aiohttp、urllib、ssl 上下文不得在生产路径关闭证书校验或接受用户可控证书、代理和 CA。', ['检查 verify=False、ssl._create_unverified_context、CERT_NONE、trust_env 代理和自定义 CA 的来源。', '检查临时调试配置是否进入生产代码或默认配置。'], '关闭 TLS 校验会让中间人窃取 Token、篡改接口响应或植入恶意依赖内容。', ['保持默认 TLS 校验。', '自签证书应通过受控 CA 信任链配置，并区分本地调试与生产。'], 'Python ssl 文档；Requests TLS verification；OWASP Transport Layer Protection。'),
  rule('DEFAULT-PYTHON-SEC-008', '外部 URL 抓取和回调必须白名单防 SSRF', 95, 'critical', true, pythonPaths, 'Python 服务端不得把用户可控 URL、Host、回调地址或文件地址直接交给 requests、httpx、aiohttp、urllib、boto 等客户端。', ['检查参数、数据库字段、配置下发和消息内容是否直接驱动外部 URL。', '检查协议、域名、IP 网段、端口、DNS 重绑定和重定向是否受限。'], 'SSRF 可访问内网、云元数据、Redis、管理端点或受信任网络资源。', ['使用业务白名单映射目标地址。', '拒绝内网、环回、链路本地、元数据地址、file/gopher 等危险协议，并限制重定向。'], 'OWASP SSRF Prevention Cheat Sheet；Python urllib/requests 文档。'),
  rule('DEFAULT-PYTHON-DATA-001', '金额、费率和精确小数必须使用 Decimal 或整数最小单位', 70, 'high', false, pythonPaths, '财务金额、费率、库存数量和精确小数计算不得依赖 float 二进制精度。', ['检查金额、税率、汇率、余额、积分或库存计算是否使用 float。', '检查 Decimal 是否从字符串构造并统一舍入策略。'], '浮点误差会造成账务、计费、对账、库存和报表偏差。', ['使用 Decimal、数据库 DECIMAL/NUMERIC 或最小货币单位整数。', '统一 rounding 策略，并为边界金额补充测试。'], 'Python decimal 官方文档；IEEE 754 浮点误差；阿里巴巴金额精度规约。'),
  rule('DEFAULT-PYTHON-TIME-001', '跨系统时间必须使用时区感知 datetime', 65, 'high', false, pythonPaths, '接口、数据库、任务调度、审计日志和跨时区业务不得混用 naive datetime 与本地隐式时区。', ['检查 datetime.now/utcnow/fromtimestamp 是否缺少 tzinfo。', '检查入库、出参、缓存过期和定时任务是否统一 UTC 或业务时区。'], '时区混乱会导致订单状态、定时任务、审计追踪和过期判断提前或延后。', ['使用 datetime.now(timezone.utc) 或明确业务时区。', '输入输出统一 ISO 8601，并在数据库和 API 契约中说明时区。'], 'Python datetime 官方文档；Django timezone practices。'),
  rule('DEFAULT-PYTHON-IO-001', '文件路径必须归一化并限制在允许目录内', 90, 'critical', true, pythonPaths, '下载、上传、模板、导入导出和任务文件路径不得直接使用用户可控文件名或相对路径。', ['检查 open、Path、send_file、shutil、zipfile 解压路径是否来自请求或外部输入。', '检查是否 normalize/resolve 后校验仍位于允许的 base directory 内。'], '路径遍历会造成任意文件读取、覆盖、删除、压缩包逃逸或敏感配置泄露。', ['使用固定目录和安全文件名映射。', '解析真实路径后校验 startswith/base relation，并拒绝绝对路径和 .. 逃逸。'], 'OWASP Path Traversal；Python pathlib 官方文档；Bandit B108。'),
  rule('DEFAULT-PYTHON-ASYNC-001', '异步任务、线程池和网络请求必须设置超时、取消和资源释放', 65, 'high', false, pythonPaths, 'requests、httpx、aiohttp、数据库连接、线程池、进程池和后台任务必须有超时、取消、关闭和异常处理。', ['检查 requests/httpx/aiohttp 是否缺少 timeout。', '检查 ThreadPoolExecutor、ProcessPoolExecutor、asyncio task、数据库连接和文件句柄是否释放。'], '缺少超时和释放会导致请求堆积、连接耗尽、任务泄露或服务不可恢复。', ['为外部调用设置连接与读取超时。', '使用 with/async with、finally、取消令牌和受控 executor 生命周期。'], 'Python requests/httpx 最佳实践；asyncio task lifecycle；OWASP Resource Consumption。'),
  rule('DEFAULT-PYTHON-WEB-001', '生产不得开启 debug、交互控制台或详细错误页', 90, 'critical', true, ['**/*.py', '**/*.pyw', '**/settings*.py', '**/config*.py'], 'Flask、Django、FastAPI、Werkzeug、Uvicorn 等生产配置不得开启 debug、reload、交互式 debugger 或向外暴露详细异常。', ['检查 DEBUG=True、debug=True、use_debugger、reload=True、PROPAGATE_EXCEPTIONS 和详细错误处理中间件。', '检查生产 profile 是否能访问堆栈、环境变量、请求头或交互控制台。'], '调试模式会泄露源码、配置、凭据、请求数据，部分交互控制台可导致远程代码执行。', ['生产默认关闭 debug/reload/交互控制台。', '错误响应只返回业务错误码、traceId 和可理解消息，详细异常只进受控日志。'], 'Django deployment checklist；Flask debug 文档；OWASP Error Handling。'),
  rule('DEFAULT-PYTHON-ARCHIVE-001', '压缩包解压必须防路径穿越、符号链接和解压炸弹', 95, 'critical', true, pythonPaths, 'zipfile、tarfile、shutil.unpack_archive 和第三方解压不得直接信任条目路径、符号链接、特殊文件、大小和压缩率。', ['检查 extract/extractall 是否在解压前规范化并限制目标路径。', '检查 tar 符号链接、绝对路径、..、设备文件、总大小、文件数和压缩率是否受限。'], '不安全解压会造成任意文件覆盖、密钥泄露、服务配置篡改、磁盘耗尽或执行链路被植入。', ['逐条校验条目真实目标路径仍在允许目录内。', '限制总大小、文件数量、层级和压缩率，拒绝符号链接和特殊文件。'], 'Python tarfile extraction filters；OWASP File Upload Cheat Sheet；Zip Slip。'),
  rule('DEFAULT-PYTHON-RESOURCE-001', '上传、解析、导入和批处理必须限制大小、数量、超时和内存', 70, 'high', false, pythonPaths, '文件上传、JSON/YAML/XML、正则、分页、pandas/openpyxl 导入、批处理和压缩包处理应设置资源上限。', ['检查请求体、文件大小、行数、sheet 数、字段深度、正则复杂度、分页 limit 和批处理批量是否无上限。', '检查异常路径是否释放文件、连接、临时目录和后台任务。'], '资源无上限会造成 OOM、CPU 飙高、磁盘耗尽、请求堆积或批处理长时间锁定。', ['设置大小、数量、深度、分页、超时和内存预算。', '大文件采用流式处理、分批校验和可中断任务。'], 'OWASP API4 Resource Consumption；Python resource management；Pandas large file practices。'),
  rule('DEFAULT-PYTHON-MAINT-001', '避免新增大段全局副作用和导入期执行重逻辑', 40, 'medium', false, pythonPaths, '模块导入阶段不应执行网络请求、数据库写入、长耗时计算、启动线程或读取生产敏感资源。', ['检查模块顶层是否执行 I/O、启动后台任务或修改外部状态。', '检查配置读取、连接初始化和任务注册是否可测试、可延迟、可失败。'], '导入期副作用会造成启动失败、测试难隔离、循环导入和发布时不可控外部写入。', ['把副作用移动到显式 main、factory、依赖注入或应用启动钩子。', '为初始化失败提供清晰错误和回滚路径。'], 'Python import system；Twelve-Factor App；可测试性最佳实践。'),
];

const mysqlRules = [
  rule('DEFAULT-MYSQL-SEC-001', '禁止拼接用户输入生成 SQL', 95, 'critical', true, mysqlPaths, 'MySQL 查询、更新和迁移脚本不得把用户输入直接拼接进 SQL。', ['检查 Java 注解 SQL、Mapper XML、Repository 和脚本中的字符串拼接。', '检查 where/order/limit 参数是否绑定或白名单。'], 'SQL 注入会造成越权读取、批量修改或删除数据。', ['使用 prepared statement 或 MyBatis #{}。', '动态标识符通过白名单枚举映射。'], 'OWASP SQL Injection；CWE-89；MySQL prepared statements。'),
  rule('DEFAULT-MYSQL-SEC-002', '动态表名、列名、排序字段必须使用白名单映射', 90, 'critical', true, mysqlPaths, '表名、列名、排序方向等 SQL 标识符不能依赖参数绑定，必须通过白名单映射。', ['检查 `${}`、ORDER BY 拼接和动态表路由。', '检查输入是否只允许固定枚举值。'], '标识符注入会绕过参数化保护并造成越权查询或数据破坏。', ['把外部值映射到内部固定列名。', '拒绝不在白名单内的排序和表名。'], 'OWASP SQL Injection；MySQL prepared statements。'),
  rule('DEFAULT-MYSQL-SEC-003', '禁止默认启用 MySQL 多语句执行', 85, 'high', true, [...mysqlPaths, 'src/main/resources/**/*.{yml,yaml,properties}', 'pom.xml', 'build.gradle*'], 'MySQL JDBC、连接池和 ORM 配置不得默认启用 allowMultiQueries、allowMultiStatements 或等价多语句执行能力。', ['检查 JDBC URL、数据源配置、测试配置和动态 SQL 执行器是否开启多语句。', '检查开启多语句的场景是否限定在可信迁移工具和受控账号。'], '多语句执行会放大 SQL 注入影响，从单次查询扩大到批量修改、删除或 DDL。', ['默认关闭多语句执行。', '确需批量迁移时隔离到受控工具、受控账号和可信输入来源。'], 'MySQL Connector/J configuration；OWASP SQL Injection。'),
  rule('DEFAULT-MYSQL-DML-001', 'UPDATE、DELETE 必须有明确 WHERE 或受控批量条件', 95, 'critical', true, mysqlPaths, '生产 DML 不得无条件更新或删除全表，批处理必须说明受控范围。', ['检查 DELETE、UPDATE 是否缺少 WHERE。', '检查 WHERE 是否只是恒真条件或不受控变量。'], '全表 DML 会导致不可逆数据丢失和生产事故。', ['补充明确 WHERE、LIMIT 分批或审批脚本。', '为批处理加入 dry-run、影响行数检查和备份。'], 'CWE-89；阿里巴巴数据库规约；MySQL DML。'),
  rule('DEFAULT-MYSQL-DML-002', '批量 DML 必须分批、可重试、可观测', 70, 'high', false, mysqlPaths, '大批量 INSERT、UPDATE、DELETE 应分批执行，并具备失败恢复和观测能力。', ['检查是否一次性处理全表或大范围数据。', '检查日志、游标、断点和重试策略。'], '长事务会导致锁等待、复制延迟和 undo/redo 压力。', ['按主键范围或时间窗口分批。', '记录进度、影响行数和失败补偿方式。'], 'MySQL InnoDB deadlocks；阿里巴巴数据库规约。'),
  rule('DEFAULT-MYSQL-IDX-001', '高频查询谓词必须匹配合适索引', 70, 'high', false, mysqlPaths, '新增高频查询应确认 where/join 谓词可以命中索引。', ['检查高频接口 SQL 的 where、join、order by 字段。', '检查复合索引是否符合最左前缀。'], '缺少索引会造成全表扫描、慢查询和锁范围扩大。', ['补充合适索引或调整查询条件。', '用 explain 验证执行计划。'], 'MySQL Multiple-Column Indexes；MySQL EXPLAIN。'),
  rule('DEFAULT-MYSQL-IDX-002', 'ORDER BY、GROUP BY 应尽量与索引顺序兼容', 60, 'high', false, mysqlPaths, '排序和分组热点查询应避免不必要 filesort 和临时表。', ['检查 order by/group by 字段与索引顺序是否兼容。', '检查混合升降序和函数排序是否影响索引使用。'], '排序临时表会导致分页抖动、接口超时和数据库负载升高。', ['调整索引顺序或查询方式。', '必要时拆分查询或预计算。'], 'MySQL ORDER BY Optimization。'),
  rule('DEFAULT-MYSQL-IDX-003', '禁止无选择性的重复或冗余索引', 40, 'medium', false, mysqlPaths, '新增索引应避免重复、低选择性和被已有复合索引覆盖的冗余设计。', ['检查是否已有相同前缀索引。', '检查布尔、状态等低选择性字段是否单独建索引。'], '冗余索引会拖慢写入、浪费空间并干扰优化器选择。', ['合并或删除冗余索引。', '用真实查询和统计信息评估索引价值。'], 'MySQL Multiple-Column Indexes；阿里巴巴数据库规约。'),
  rule('DEFAULT-MYSQL-PAGE-001', '分页必须有确定性 ORDER BY 并包含唯一兜底列', 65, 'high', false, mysqlPaths, '分页查询必须使用稳定排序，排序字段相同场景应追加唯一兜底列。', ['检查 LIMIT/OFFSET 是否缺少 order by。', '检查排序字段是否可能重复且未追加主键。'], '结果顺序不稳定会导致翻页重复、漏数据或用户看到跳动数据。', ['添加确定性排序和主键兜底。', '为分页接口补充稳定性测试。'], 'MySQL LIMIT Optimization；阿里巴巴数据库规约。'),
  rule('DEFAULT-MYSQL-PAGE-002', '深分页应优先 keyset 或 seek pagination', 50, 'medium', false, mysqlPaths, '大 offset 分页应评估 keyset/seek、游标或搜索方案。', ['检查 offset 是否可能随用户翻页无限增大。', '检查是否可以用上次最大 ID 或排序键继续查询。'], '深分页会扫描和丢弃大量行，导致接口超时。', ['改用 keyset/seek pagination。', '对后台导出使用异步任务。'], 'MySQL LIMIT Optimization。'),
  rule('DEFAULT-MYSQL-TXN-001', '多表或多步骤写入必须在显式事务内', 90, 'critical', true, mysqlPaths, '涉及多表、多账户、多状态的写入必须具备明确事务边界。', ['检查 service、repository、mapper 和 SQL 脚本中的多步骤写入。', '检查 autocommit 和显式 begin/commit/rollback。'], '缺少事务会造成半成功和核心数据不一致。', ['使用 Spring @Transactional 或显式事务。', '明确失败回滚和补偿路径。'], 'MySQL InnoDB Transactions；Spring Transaction。'),
  rule('DEFAULT-MYSQL-TXN-002', '捕获数据库异常后必须 rollback 或重新抛出', 85, 'high', true, mysqlPaths, '捕获 SQL 或持久层异常后不得静默继续提交。', ['检查 catch SQLException/DataAccessException 后是否吞掉异常。', '检查是否调用 rollback、重新抛出或进入补偿。'], '吞异常会导致错误提交和账务、库存、状态不一致。', ['重新抛出异常触发回滚。', '必须吞掉时记录补偿任务并阻止错误提交。'], 'MySQL InnoDB deadlocks；Spring rollback rules。'),
  rule('DEFAULT-MYSQL-LOCK-001', 'SELECT FOR UPDATE 必须命中索引且范围可控', 75, 'high', false, mysqlPaths, '加锁查询应确保谓词命中索引并控制扫描范围。', ['检查 for update 的 where 条件和索引。', '检查范围查询是否可能扩大 next-key/gap lock。'], '锁范围过大会阻塞插入、造成死锁和吞吐下降。', ['补充索引并缩小锁定范围。', '按一致顺序获取锁并准备死锁重试。'], 'MySQL InnoDB Locking；MySQL Deadlocks。'),
  rule('DEFAULT-MYSQL-DDL-001', '禁止在业务事务中混入 DDL', 85, 'high', true, mysqlPaths, '业务代码事务中不得夹杂 ALTER、DROP、TRUNCATE 等 DDL。', ['检查 service/repository 中是否执行 DDL。', '检查迁移脚本是否混用业务 DML 和 DDL 且无边界说明。'], 'MySQL DDL 可能隐式结束事务，破坏原子性。', ['把 DDL 放入独立迁移流程。', '为发布顺序、锁等待和回滚写明方案。'], 'MySQL Atomic DDL；MySQL Metadata Locking。'),
  rule('DEFAULT-MYSQL-DDL-002', 'DROP、TRUNCATE、RENAME 和删列必须有备份与回滚策略', 95, 'critical', true, mysqlPaths, '破坏性 DDL 必须说明数据保留、备份、回滚或前滚修复方案。', ['检查 DROP TABLE、DROP COLUMN、TRUNCATE、RENAME、删除索引或约束是否新增。', '检查是否有分阶段下线、数据备份和恢复路径。'], '破坏性 DDL 可能造成不可逆数据丢失、应用版本不兼容或发布中断。', ['优先软删除或分阶段废弃。', '执行前准备备份、验证 SQL、恢复或前滚脚本。'], 'MySQL Data Definition Statements；MySQL Metadata Locking。'),
  rule('DEFAULT-MYSQL-DDL-003', '大表 ALTER 和索引变更必须评估元数据锁与在线 DDL', 80, 'high', false, mysqlPaths, '大表结构、索引和字段变更应评估元数据锁、重建表、复制延迟和在线 DDL 能力。', ['检查 ALTER TABLE、CREATE INDEX、DROP INDEX 和字段类型变更是否可能长时间阻塞读写。', '检查是否说明 ALGORITHM、LOCK、执行窗口、超时和在线迁移工具策略。'], '元数据锁可能阻塞线上查询和写入，导致发布事故或数据库雪崩。', ['低峰执行并设置锁等待保护。', '必要时使用在线 DDL、gh-ost 或 pt-online-schema-change 等受控方案。'], 'MySQL Online DDL；MySQL Metadata Locking。'),
  rule('DEFAULT-MYSQL-TYPE-001', '金额和精确数值禁止使用浮点类型', 85, 'high', true, mysqlPaths, '金额、数量、费率和账务字段不得使用 FLOAT、DOUBLE 等浮点类型。', ['检查 DDL、Entity 和 SQL 中的金额字段类型。', '检查新增 DOUBLE 是否用于精确业务值。'], '浮点误差会造成账务、计费、库存和对账错误。', ['使用 DECIMAL/NUMERIC 并明确精度 scale。', 'Java 侧使用 BigDecimal 或最小单位整数。'], 'MySQL Fixed-Point Types；阿里巴巴数据库规约。'),
  rule('DEFAULT-MYSQL-TYPE-002', '高增长主键、外部 ID 和计数字段必须评估 BIGINT', 60, 'high', false, mysqlPaths, '订单号、流水号、消息 ID、租户级增长 ID、累计计数等高增长字段不得随意使用 INT。', ['检查自增主键、外部系统 ID、雪花 ID、统计计数字段是否可能超过 INT 范围。', '检查 Java 类型、接口字段和数据库字段是否保持 Long/BIGINT 一致。'], '字段溢出会导致写入失败、ID 回绕、数据关联错误或迁移困难。', ['使用 BIGINT 和 Java Long。', '迁移时校验历史最大值、外部协议和前端精度边界。'], 'MySQL Integer Types；阿里巴巴数据库规约。'),
  rule('DEFAULT-MYSQL-CONS-001', '唯一约束和幂等键必须覆盖业务隔离维度', 85, 'high', true, mysqlPaths, '新增唯一键、幂等键和业务约束时必须包含租户、组织、业务类型等必要隔离维度。', ['检查多租户表唯一索引是否缺少 tenant_id、org_id 或业务分区字段。', '检查幂等记录是否能区分业务场景、请求来源和重复提交。'], '约束维度不完整会造成跨租户冲突、重复履约、错误拒绝写入或数据污染。', ['把业务隔离维度纳入唯一约束。', '为幂等键补充重复请求和跨租户回归测试。'], 'MySQL Constraints；OWASP Broken Access Control。'),
  rule('DEFAULT-MYSQL-QUERY-001', '查询谓词不得因函数、隐式转换或前导通配符导致索引失效', 65, 'high', false, mysqlPaths, '热点查询应避免在索引列上使用函数、表达式、隐式类型转换和 LIKE 前导通配符。', ['检查 DATE(col)、CAST(col)、字符串数字混比、不同字符集比较和 LIKE "%xxx"。', '检查 where 条件是否把转换放在列侧导致无法使用索引。'], '索引失效会引发全表扫描、慢查询、锁范围扩大和分页超时。', ['把转换放到参数侧或改写为范围查询。', '必要时使用生成列、函数索引或搜索方案。'], 'MySQL Index Optimization；MySQL LIKE Optimization。'),
  rule('DEFAULT-MYSQL-QUERY-002', 'GROUP BY 查询必须保持结果确定性', 60, 'high', false, mysqlPaths, '分组查询不得依赖 MySQL 非严格模式下的任意行返回，选择列必须与 GROUP BY 或聚合语义一致。', ['检查 SELECT 列是否既不在 GROUP BY 中，也没有聚合函数或 ANY_VALUE 语义说明。', '检查是否依赖关闭 ONLY_FULL_GROUP_BY 的历史行为。'], '非确定性分组会导致报表、对账和分页结果随执行计划变化而漂移。', ['补齐 GROUP BY 字段或使用明确聚合函数。', '保留任意值时使用显式 ANY_VALUE 并说明业务语义。'], 'MySQL GROUP BY Handling；ONLY_FULL_GROUP_BY。'),
  rule('DEFAULT-MYSQL-NULL-001', '新增 NOT NULL、默认值和字段收紧必须兼容历史数据', 90, 'critical', true, mysqlPaths, '新增 NOT NULL、UNIQUE、缩短字段长度、修改类型或默认值时，必须兼容历史数据和新旧应用同时运行窗口。', ['检查旧数据是否已回填并通过验证 SQL。', '检查旧版本应用是否仍可能写入空值、超长值或不满足唯一约束的数据。'], '迁移失败、灰度期间写入失败、数据截断或唯一冲突会阻断发布。', ['采用加字段可空、回填、双写兼容读取、加约束的分阶段迁移。', '补充历史数据验证和回滚方案。'], 'MySQL ALTER TABLE；MySQL Data Type Defaults。'),
  rule('DEFAULT-MYSQL-CHARSET-001', '字符集、排序规则和文本长度必须保持一致', 60, 'high', false, mysqlPaths, '新增或修改字符串字段、索引和比较条件时，应明确 utf8mb4、collation、大小写敏感性和长度边界。', ['检查新表或字段是否沿用错误字符集或排序规则。', '检查唯一索引是否因大小写、emoji、多字节字符或长度限制产生意外冲突。'], '字符集和排序规则不一致会导致写入失败、比较结果异常、索引失效或唯一约束误判。', ['统一字符集和排序规则。', '同步前端、Java 校验和数据库字段长度，必要时调整索引前缀。'], 'MySQL Character Sets；MySQL Collation。'),
  rule('DEFAULT-MYSQL-PRIV-001', '应用账号禁止授予过宽权限或转授权能力', 95, 'critical', true, mysqlPaths, '应用、报表和迁移账号不得被授予 ALL PRIVILEGES、*.*、SUPER、FILE、PROCESS、WITH GRANT OPTION 等超出职责的权限。', ['检查 GRANT、CREATE USER、ALTER USER 和部署脚本中的权限范围。', '检查应用账号是否拥有 DDL、跨库、文件读写或转授权能力。'], '过宽权限会扩大入侵半径，导致越权读取、批量破坏、横向移动或审计失效。', ['按应用账号、迁移账号、只读账号拆分最小权限。', '只授予具体库表和必要操作，并移除 WITH GRANT OPTION。'], 'MySQL Access Control；OWASP Least Privilege；阿里巴巴数据库安全规约。'),
  rule('DEFAULT-MYSQL-CONS-002', '禁止无保护地关闭外键、唯一性或安全更新检查', 90, 'critical', true, mysqlPaths, '迁移脚本不得无说明地设置 FOREIGN_KEY_CHECKS=0、UNIQUE_CHECKS=0、SQL_SAFE_UPDATES=0 或类似绕过完整性保护的开关。', ['检查关闭约束检查后是否在同一脚本恢复。', '检查是否有数据校验、影响范围说明和失败回滚路径。'], '完整性检查被绕过会留下孤儿数据、重复数据或不受控批量更新。', ['尽量通过分阶段迁移和数据清洗满足约束。', '确需临时关闭时必须限制会话范围、恢复开关并执行校验 SQL。'], 'MySQL Server System Variables；MySQL InnoDB Foreign Key Constraints。'),
  rule('DEFAULT-MYSQL-DML-003', '禁止用 REPLACE INTO 替代安全 upsert', 70, 'high', false, mysqlPaths, '不得在不了解删除再插入语义的情况下使用 REPLACE INTO 处理幂等或更新。', ['检查 REPLACE INTO 是否作用于有外键、触发器、自增主键、审计字段或级联关系的表。', '检查冲突时是否会删除旧行并重新插入，导致关联和审计语义变化。'], 'REPLACE INTO 可能触发级联删除、重置自增值、覆盖审计字段或造成业务状态丢失。', ['优先使用 INSERT ... ON DUPLICATE KEY UPDATE 并明确更新字段。', '幂等写入应使用唯一键、状态机和影响行数校验。'], 'MySQL REPLACE Statement；MySQL INSERT ON DUPLICATE KEY UPDATE。'),
  rule('DEFAULT-MYSQL-SEQ-001', '禁止用 MAX(id)+1 生成主键、流水号或业务序号', 90, 'critical', true, mysqlPaths, '生产写入不得通过 SELECT MAX(id)+1、count+1 或查询当前最大值的方式生成并发唯一标识。', ['检查 INSERT SELECT MAX(id)+1、先查最大号再插入、应用内自增计数等模式。', '检查流水号是否在并发、重试和多节点场景下保持唯一。'], '并发请求会生成重复编号，造成主键冲突、覆盖业务单据或重复履约。', ['使用数据库自增、序列服务、雪花算法或带唯一约束的发号表。', '为并发创建、重试和回滚场景补充测试。'], 'MySQL AUTO_INCREMENT；阿里巴巴数据库规约；并发唯一性实践。'),
  rule('DEFAULT-MYSQL-QUERY-003', 'NOT IN 子查询字段可为空时必须改写', 60, 'high', false, mysqlPaths, '当子查询字段可能包含 NULL 时，不得直接使用 NOT IN 表达反关联语义。', ['检查 NOT IN 子查询的选择列是否可能为 NULL。', '检查是否有 IS NOT NULL 过滤、NOT EXISTS 改写或左连接反查。'], 'SQL 三值逻辑会让 NOT IN 遇到 NULL 后返回非预期结果，导致漏查、漏删或错误报表。', ['改用 NOT EXISTS。', '若继续使用 NOT IN，必须显式过滤子查询 NULL 并补充边界测试。'], 'MySQL Subquery Optimization；SQL NULL three-valued logic。'),
  rule('DEFAULT-MYSQL-PLAN-001', '核心 SQL 变更必须提供执行计划和慢查询预算', 60, 'high', false, mysqlPaths, '新增或修改核心查询、报表、导出、搜索和批处理 SQL 时，应说明 EXPLAIN 结果、预期扫描行数、索引命中和慢查询预算。', ['检查复杂 join、子查询、排序、分组、大结果集和热点接口 SQL 是否有执行计划证据。', '检查是否说明表规模、选择性、慢查询阈值、监控指标和回退方案。'], '缺少执行计划验证会让全表扫描、临时表、filesort 或错误索引选择在生产流量下放大为慢查询事故。', ['补充 EXPLAIN/ANALYZE、索引验证和慢查询预算。', '对高风险 SQL 增加灰度观察、开关或回退脚本。'], 'MySQL EXPLAIN；MySQL Optimizer；阿里巴巴数据库规约。'),
  rule('DEFAULT-MYSQL-REPL-001', '大批量写入和 DDL 必须评估 binlog、复制延迟和只读副本影响', 65, 'high', false, mysqlPaths, '大批量 DML、DDL、回填、归档和清理任务应评估 binlog 体积、复制延迟、只读副本查询和主从切换影响。', ['检查是否一次写入或修改大量数据。', '检查是否说明 binlog 格式、复制延迟监控、限速、批次大小和只读流量保护。'], '复制延迟会导致读写不一致、报表错误、缓存污染和主从切换风险。', ['按主键或时间窗口限速分批执行。', '发布时观察复制延迟和只读副本负载，必要时暂停或降级。'], 'MySQL Replication；MySQL Binary Log；数据迁移发布实践。'),
  rule('DEFAULT-MYSQL-BACKUP-001', '破坏性 DML、数据修复和批量迁移必须有备份、校验和恢复方案', 90, 'critical', true, mysqlPaths, '涉及删除、覆盖、批量修复、历史数据迁移和高风险回填时，必须能说明执行前备份、影响行数校验、抽样验证和恢复路径。', ['检查 DELETE/UPDATE/MERGE/DROP/TRUNCATE、分区清理和历史数据归档脚本是否有 dry-run 或影响范围预估。', '检查是否提供备份、恢复 SQL、校验 SQL、执行窗口和责任人。'], '数据修复一旦写错可能造成不可逆数据损坏、账务差异或跨租户数据污染。', ['执行前备份或快照关键数据。', '分批执行并记录影响行数，执行后用校验 SQL 验证结果。'], 'MySQL Backup and Recovery；阿里巴巴数据库规约；生产数据修复实践。'),
  rule('DEFAULT-MYSQL-PART-001', '分区表变更必须校验唯一键、分区裁剪和破坏性分区操作', 80, 'critical', true, mysqlPaths, '新增、调整、交换、清理或删除分区时，必须说明分区键、唯一键约束、分区裁剪效果、归档备份和回滚策略。', ['检查 DROP/TRUNCATE/EXCHANGE PARTITION 是否有备份和校验。', '检查唯一键是否包含分区键，查询条件是否能利用分区裁剪。'], '分区维护错误可能直接丢失整段历史数据，或让查询退化为扫描所有分区。', ['先归档和校验待处理分区。', '为分区键、唯一键和核心查询补充验证 SQL 与回滚方案。'], 'MySQL Partitioning；MySQL ALTER TABLE Partition Operations。'),
  rule('DEFAULT-MYSQL-JSON-001', 'JSON 字段用于查询时必须有结构约束和索引策略', 55, 'high', false, mysqlPaths, 'JSON 字段承载查询、过滤、排序或唯一语义时，应声明结构约束、字段兼容策略和生成列或函数索引方案。', ['检查 JSON_EXTRACT、->、->> 是否出现在热点 where/order by/group by。', '检查 JSON 文档结构是否有服务端校验、版本兼容和索引策略。'], '无约束 JSON 会让结构漂移、索引缺失和类型比较问题在生产中表现为慢查询或脏数据。', ['为热点 JSON 路径建立生成列或函数索引。', '用 DTO/schema 校验 JSON 结构，并为版本演进保留兼容策略。'], 'MySQL JSON Data Type；MySQL Generated Columns；MySQL Functional Indexes。'),
  rule('DEFAULT-MYSQL-REPL-002', '生产迁移不得默认绕过 binlog、复制和只读保护', 95, 'critical', true, mysqlPaths, '生产迁移、数据修复和批处理脚本不得默认设置 sql_log_bin=0、关闭只读保护、跳过复制链路或绕过审计，除非有明确审批、补偿和恢复方案。', ['检查 SET sql_log_bin=0、super_read_only=0、read_only=0、跳过 binlog 或直接在从库写入。', '检查是否说明主备一致性、GTID、恢复链路、审批记录和执行窗口。'], '绕过 binlog 或只读保护会造成主备不一致、备份恢复链断裂、审计缺口和灾备切换后数据丢失。', ['默认让生产变更进入正常复制和审计链路。', '确需绕过时必须写明审批、影响范围、补偿 SQL、校验查询和恢复步骤。'], 'MySQL Binary Log；MySQL Replication；生产变更审计实践。'),
];

const oracleRules = [
  rule('DEFAULT-ORACLE-SEC-001', '动态 SQL 必须使用绑定变量或严格白名单', 95, 'critical', true, oraclePaths, 'Oracle 动态 SQL 不得直接拼接外部输入，值参数必须绑定，标识符必须白名单。', ['检查 EXECUTE IMMEDIATE、DBMS_SQL 和 Java Mapper 中的拼接。', '检查变量是否通过 using/bind variable 传入。'], 'SQL 注入会造成越权读取、数据篡改和权限提升。', ['使用绑定变量。', '动态对象名通过固定映射并拒绝未知输入。'], 'Oracle SQL Injection；Oracle bind variables；OWASP SQL Injection。'),
  rule('DEFAULT-ORACLE-SEC-002', '动态对象名必须使用白名单，DBMS_ASSERT 只能作为辅助校验', 85, 'high', true, oraclePaths, '动态表名、列名、schema 和排序字段必须来自业务白名单，DBMS_ASSERT 不能替代授权。', ['检查对象名是否来自请求或配置。', '检查 DBMS_ASSERT 后是否仍有业务白名单。'], '对象名注入会导致跨表操作、越权查询或破坏性 DDL。', ['建立允许对象名映射。', '在映射前先校验操作者权限。'], 'Oracle SQL Injection；Oracle DBMS_ASSERT。'),
  rule('DEFAULT-ORACLE-DML-001', 'UPDATE、DELETE、MERGE 必须有明确条件和影响范围说明', 95, 'critical', true, oraclePaths, 'Oracle DML 必须明确约束影响范围，不得无条件更新、删除或合并大范围数据。', ['检查 UPDATE、DELETE、MERGE 是否缺少 WHERE 或 ON 条件。', '检查脚本是否说明影响行数和回滚方式。'], '不受控 DML 会造成生产数据大面积损坏。', ['补充条件、分批和影响行数校验。', '执行前准备备份或回滚脚本。'], 'Oracle SQL Reference；CWE-89；阿里巴巴数据库规约。'),
  rule('DEFAULT-ORACLE-DML-002', '大批量 DML 必须分批、可恢复并控制 undo redo 压力', 70, 'high', false, oraclePaths, '大批量数据修正和迁移应控制事务大小、undo/redo 压力和恢复能力。', ['检查是否一次处理全量历史数据。', '检查是否记录批次、游标和失败位置。'], '大事务会造成 undo 压力、锁等待和发布窗口失控。', ['按主键或时间范围分批。', '记录进度并准备可重复执行方案。'], 'Oracle Data Concurrency；Oracle COMMIT。'),
  rule('DEFAULT-ORACLE-IDX-001', '高频谓词、函数条件和排序必须评估普通索引或函数索引', 70, 'high', false, oraclePaths, 'Oracle 热点查询应评估谓词、函数条件、排序和连接字段的索引策略。', ['检查 where 中函数、表达式和隐式转换是否影响索引。', '检查是否需要 function-based index。'], '索引缺失或失效会造成全表扫描和锁等待扩大。', ['补充普通索引或函数索引。', '用执行计划验证变更。'], 'Oracle CREATE INDEX；Oracle Optimizer 文档。'),
  rule('DEFAULT-ORACLE-PAGE-001', 'OFFSET/FETCH 或 ROWNUM 分页必须有确定性排序', 65, 'high', false, oraclePaths, '分页必须配合确定性 order by，排序字段重复时追加唯一列。', ['检查 OFFSET/FETCH、ROWNUM 是否缺少排序。', '检查排序是否唯一稳定。'], '排序不稳定会导致分页重复、漏数据和回归难复现。', ['添加稳定 order by 和主键兜底。', '避免在无序集合上分页。'], 'Oracle SELECT row limiting。'),
  rule('DEFAULT-ORACLE-TXN-001', '多步骤写入必须用明确事务边界', 90, 'critical', true, oraclePaths, '多表、多步骤或 PL/SQL 过程写入必须说明事务边界和提交点。', ['检查过程、脚本和 Java service 是否隐式提交。', '检查异常路径是否结束事务。'], '事务边界不清会造成半成功和补偿困难。', ['明确 commit/rollback 策略。', '由外层事务统一提交时避免内部 commit。'], 'Oracle COMMIT；Oracle ROLLBACK；Spring Transaction。'),
  rule('DEFAULT-ORACLE-TXN-002', '捕获异常后必须 rollback、raise 或记录补偿路径', 85, 'high', true, oraclePaths, 'PL/SQL 和 Java 持久层不得 WHEN OTHERS THEN NULL 或吞掉数据库异常。', ['检查 WHEN OTHERS、catch Exception 是否静默处理。', '检查是否 rollback、raise 或写入补偿任务。'], '吞异常会隐藏失败并让错误数据提交。', ['重新抛出异常或 rollback。', '需要容忍失败时记录审计和补偿。'], 'Oracle PL/SQL Error Handling；Oracle ROLLBACK。'),
  rule('DEFAULT-ORACLE-LOCK-001', '行锁和 SELECT FOR UPDATE 必须控制范围和等待策略', 70, 'high', false, oraclePaths, 'Oracle 加锁查询必须限制范围，并明确 nowait、wait 或 skip locked 策略。', ['检查 SELECT FOR UPDATE 是否范围可控。', '检查是否可能长时间阻塞关键表。'], '锁等待会阻塞业务写入并诱发发布事故。', ['缩小锁定范围。', '根据业务使用 NOWAIT、WAIT 或 SKIP LOCKED。'], 'Oracle Data Concurrency；Oracle SELECT FOR UPDATE。'),
  rule('DEFAULT-ORACLE-DDL-001', '业务事务中禁止混入 DDL', 90, 'critical', true, oraclePaths, 'Oracle DDL 会隐式提交，不得放入业务事务或期望回滚的脚本中。', ['检查业务代码、过程和脚本是否在事务中执行 DDL。', '检查 DDL 前后是否错误假设可回滚。'], '隐式提交会破坏事务原子性并造成无法回滚的状态。', ['把 DDL 放入独立迁移。', '明确发布、锁和回滚策略。'], 'Oracle DDL implicit commit；Oracle COMMIT。'),
  rule('DEFAULT-ORACLE-DDL-002', 'DROP、TRUNCATE、RENAME 必须有审批式迁移说明和回滚策略', 95, 'critical', true, oraclePaths, '破坏性 DDL 必须经过审批式迁移说明、备份、回滚或前滚修复方案。', ['检查 DROP、TRUNCATE、RENAME 是否新增。', '检查是否说明数据保留、备份和恢复路径。'], '破坏性 DDL 可能造成不可逆数据丢失和服务中断。', ['改为可回滚迁移或分阶段下线。', '提供备份、恢复和验证步骤。'], 'Oracle DDL locks；Oracle Data Concurrency。'),
  rule('DEFAULT-ORACLE-DDL-003', '热表 DDL 必须评估在线变更、锁等待和发布兼容', 85, 'critical', true, oraclePaths, 'Oracle 热表或大表 ALTER TABLE、新增索引、修改字段、增加 NOT NULL 或默认值时，必须说明在线变更能力、锁等待、发布顺序和新旧版本兼容。', ['检查高频业务表是否执行 ALTER TABLE、CREATE INDEX、字段类型修改或约束修改。', '检查是否说明 ONLINE、分阶段迁移、锁等待窗口、灰度顺序和失败回退方式。'], 'DDL 可能长时间持有表锁或元数据锁，导致核心业务写入阻塞、发布窗口失控或新旧应用不兼容。', ['拆成新增兼容字段、回填、切流、加约束、清理旧字段等阶段。', '对索引和约束变更评估在线能力，并准备锁等待监控和回退方案。'], 'Oracle Online DDL；Oracle Data Concurrency。'),
  rule('DEFAULT-ORACLE-TYPE-001', '金额、数量和精确小数必须使用合适的 NUMBER(p,s)', 85, 'high', true, oraclePaths, 'Oracle 精确业务数值必须明确 NUMBER 的 precision 和 scale。', ['检查金额、数量、税率、汇率字段类型。', '检查是否缺少 p/s 或使用不合适浮点语义。'], '精度设计错误会造成账务、库存和报表偏差。', ['使用 NUMBER(p,s) 并和 Java BigDecimal 对齐。', '为边界精度补充迁移验证。'], 'Oracle Data Types；阿里巴巴数据库规约。'),
  rule('DEFAULT-ORACLE-TYPE-002', '字符字段长度语义和 Java 映射必须明确', 65, 'high', false, oraclePaths, '新增或修改 VARCHAR2、CHAR、NVARCHAR2、NCHAR 字段时，必须明确长度语义、字符集影响和 Java/API 长度校验一致性。', ['检查是否依赖默认 BYTE/CHAR 长度语义。', '检查中文、多字节字符、emoji 等输入是否可能超过数据库长度。'], '多字节字符可能在生产环境写入失败，或前端允许长度与数据库长度不一致导致线上异常。', ['明确使用合适的长度语义。', '同步前端限制、Java Bean Validation 和数据库字段定义。'], 'Oracle Character Data Types；Oracle Globalization Support。'),
  rule('DEFAULT-ORACLE-COMPAT-001', '共享 SQL 禁止混用 Oracle 与 MySQL 方言特性', 65, 'high', false, oraclePaths, '跨库共享代码不得混用 LIMIT、ROWNUM、AUTO_INCREMENT、序列、类型和锁语义。', ['检查同一 Mapper 或共享 SQL 是否混合两种方言。', '检查分页、DDL、日期函数和自增策略。'], '方言混用会导致运行时 SQL 错误或迁移失败。', ['按数据库拆分 SQL 方言。', '用适配层或迁移工具管理差异。'], 'Oracle SELECT；MySQL LIMIT；Oracle Data Types；MySQL Atomic DDL。'),
  rule('DEFAULT-ORACLE-CONS-001', '新增约束必须先校验历史数据和空值兼容', 80, 'high', true, oraclePaths, '新增或收紧 NOT NULL、UNIQUE、CHECK、外键等约束前，必须校验历史数据、默认值、空值和应用写入路径。', ['检查新增约束是否有历史数据扫描或修复脚本。', '检查唯一约束是否考虑大小写、空值、多租户字段和历史重复数据。'], '迁移执行失败、线上写入失败，或唯一/外键约束设计不完整会造成跨租户冲突和数据污染。', ['先清洗历史数据并补充验证 SQL。', '多租户唯一约束应包含租户维度，并分阶段上线约束。'], 'Oracle Constraints；Oracle Data Integrity。'),
  rule('DEFAULT-ORACLE-SEQ-001', '主键生成必须避免序列误用和并发冲突', 75, 'high', true, oraclePaths, '使用 Oracle SEQUENCE、identity column 或 Java 侧 ID 生成时，必须保证并发唯一、迁移兼容和回填安全。', ['检查是否用 MAX(id)+1、前端传入 ID 或非原子方式生成主键。', '检查序列起始值是否大于历史最大值，批量导入和多节点写入是否会冲突。'], '并发插入主键冲突或迁移后序列倒挂，会导致写入失败或覆盖错误数据。', ['使用数据库序列、identity 或统一 ID 服务。', '迁移后同步序列起始值，禁止用 MAX(id)+1 生成生产主键。'], 'Oracle Sequences；Oracle Identity Columns。'),
  rule('DEFAULT-ORACLE-TXN-003', '自治事务必须限定审计场景并避免破坏主事务一致性', 80, 'critical', true, oraclePaths, 'PRAGMA AUTONOMOUS_TRANSACTION 只能用于明确的审计、补偿记录等隔离场景，不得在业务写入中绕过主事务提交或回滚。', ['检查自治事务中是否修改业务表、资金表、库存表或状态表。', '检查自治事务是否有明确异常处理、审计目的和调用边界。'], '自治事务会独立提交，可能让主事务回滚后仍留下业务副作用，造成数据不一致。', ['把业务写入纳入主事务。', '仅保留审计类自治事务，并记录调用方、资源和结果。'], 'Oracle Autonomous Transactions；Oracle PL/SQL Transactions。'),
  rule('DEFAULT-ORACLE-TRG-001', '触发器副作用必须可追踪且不得隐藏业务写入', 70, 'high', false, oraclePaths, '新增或修改触发器时，必须说明触发条件、副作用、递归风险和与应用事务的一致性关系。', ['检查触发器是否写业务表、调用外部过程或修改同一业务对象。', '检查是否存在递归触发、顺序依赖或隐藏审计字段变更。'], '触发器隐藏副作用会让应用代码难以审查，可能造成重复写入、递归异常或事务结果不可预测。', ['把核心业务写入显式放到应用或过程入口。', '保留触发器时补充说明、测试和审计日志。'], 'Oracle Triggers；Oracle Data Integrity。'),
  rule('DEFAULT-ORACLE-PRIV-001', '数据库权限变更必须最小授权并避免对象所有者越权', 90, 'critical', true, oraclePaths, '新增 GRANT、CREATE SYNONYM、包权限、跨 schema 访问或高权限账号使用时，必须遵守最小权限并说明授权对象和调用边界。', ['检查是否新增 GRANT ANY、SELECT ANY TABLE、DBA、CREATE ANY 等高权限。', '检查跨 schema 同义词或高权限包过程是否绕过应用数据权限。'], '过宽数据库权限会造成越权读取、批量数据篡改、横向移动和审计困难。', ['只授权具体对象和必要操作。', '按应用账号、迁移账号、只读账号拆分权限，并对高权限过程增加审计。'], 'Oracle Privileges；Oracle Security Guide。'),
  rule('DEFAULT-ORACLE-SEC-003', '动态 SQL 拼接日期和数字必须绑定或显式格式化', 90, 'critical', true, oraclePaths, 'Oracle 动态 SQL 不得依赖会话 NLS 参数把日期、数字或金额隐式转成字符串后拼接。', ['检查 EXECUTE IMMEDIATE 中日期、数字、金额拼接。', '检查是否使用绑定变量，或使用显式格式模型且输入来源可信。'], 'NLS 语义差异可能让 SQL 语义漂移，严重时形成注入或错误数据范围。', ['优先使用绑定变量。', '确需动态文本时使用固定格式模型，并拒绝用户控制格式。'], 'Oracle SQL Injection；Oracle NLS Parameters；OWASP SQL Injection。'),
  rule('DEFAULT-ORACLE-CONS-002', '禁止迁移脚本遗留禁用约束或触发器', 90, 'critical', true, oraclePaths, '迁移和修复脚本不得禁用 constraint、trigger 或完整性检查后缺少恢复与验证。', ['检查 DISABLE CONSTRAINT、DISABLE TRIGGER、ALTER TRIGGER DISABLE 是否出现。', '检查是否在同一发布步骤恢复启用并验证历史数据。'], '约束或触发器长期关闭会绕过完整性、审计和业务保护，造成脏数据或权限记录缺失。', ['优先修复数据后再启用约束。', '确需禁用时限制窗口、恢复启用并提供验证 SQL。'], 'Oracle Constraints；Oracle Triggers；Oracle Data Integrity。'),
  rule('DEFAULT-ORACLE-MERGE-001', 'MERGE 源数据必须保证匹配键唯一', 70, 'high', false, oraclePaths, '使用 MERGE 做同步、修复或迁移时，源数据的 ON 匹配键必须唯一且可验证。', ['检查 USING 子查询或临时表是否可能出现重复匹配键。', '检查是否有去重、唯一约束或执行前校验 SQL。'], '重复匹配会导致运行时错误、不稳定更新或重复覆盖业务数据。', ['对源数据先 group by/row_number 去重。', '在 stage 表增加唯一约束或执行前重复键检查。'], 'Oracle MERGE Statement；Oracle Data Integrity。'),
  rule('DEFAULT-ORACLE-QUERY-001', 'NOT IN 子查询字段可为空时必须改写', 60, 'high', false, oraclePaths, '当子查询字段可能包含 NULL 时，不得直接使用 NOT IN 表达反关联语义。', ['检查 NOT IN 子查询的选择列是否可能为 NULL。', '检查是否使用 NOT EXISTS、LEFT JOIN 反查或显式 IS NOT NULL。'], 'Oracle 三值逻辑会让 NOT IN 遇到 NULL 后返回非预期结果，造成漏查、漏删或错误报表。', ['改写为 NOT EXISTS。', '保留 NOT IN 时显式过滤 NULL 并补充边界测试。'], 'Oracle SQL Conditions；SQL NULL three-valued logic。'),
  rule('DEFAULT-ORACLE-RECOVER-001', 'NOLOGGING 和直接路径批量写入必须说明恢复与备库影响', 65, 'high', false, oraclePaths, '新增 NOLOGGING、APPEND、直接路径装载或大批量索引构建时，必须说明介质恢复、备库同步和补救策略。', ['检查 CREATE INDEX/ALTER TABLE/INSERT APPEND 是否使用 NOLOGGING。', '检查是否说明备份、Data Guard、补录或重建方案。'], 'NOLOGGING 可能影响恢复链路和备库一致性，故障时导致对象不可恢复或数据缺口。', ['仅在受控窗口使用，并在执行后备份或重建备库对象。', '关键业务表默认保持可恢复写入。'], 'Oracle NOLOGGING；Oracle Data Guard；Oracle Backup and Recovery。'),
  rule('DEFAULT-ORACLE-PLAN-001', '核心 SQL 变更必须提供执行计划稳定性证据', 60, 'high', false, oraclePaths, '核心查询、报表、批处理、MERGE 和复杂 PL/SQL SQL 变更应说明执行计划、统计信息依赖、索引选择和回退方案。', ['检查是否涉及大表 join、函数谓词、排序、分页、聚合或绑定变量敏感 SQL。', '检查是否提供 DBMS_XPLAN、AWR/ASH 观察、SQL Plan Baseline 或灰度验证策略。'], '执行计划漂移会让核心接口从毫秒级退化到秒级或分钟级，并可能放大锁等待和资源争用。', ['补充执行计划和关键统计信息说明。', '必要时使用 SQL Plan Baseline、索引验证或灰度观察。'], 'Oracle Optimizer；DBMS_XPLAN；Oracle SQL Plan Management。'),
  rule('DEFAULT-ORACLE-PART-001', '分区表变更必须说明分区键、裁剪效果和全局索引维护', 85, 'critical', true, oraclePaths, 'Oracle 分区表新增、拆分、合并、交换、截断或删除分区时，必须说明分区键、裁剪效果、全局索引状态、归档备份和回退策略。', ['检查 ALTER TABLE ... PARTITION、EXCHANGE PARTITION、DROP/TRUNCATE PARTITION 是否出现。', '检查全局索引是否会失效，分区交换表是否校验结构和数据范围。'], '分区维护错误可能丢失整段数据、让全局索引不可用，或让核心查询无法分区裁剪。', ['先备份或归档目标分区并校验边界。', '说明 UPDATE GLOBAL INDEXES、索引重建、交换表校验和回退路径。'], 'Oracle Partitioning；Oracle Global Index Maintenance。'),
  rule('DEFAULT-ORACLE-BULK-001', '批处理脚本必须可重入、可断点续跑并隔离失败批次', 65, 'high', false, oraclePaths, '批量修复、迁移、清理和同步脚本应具备批次记录、断点续跑、失败隔离、提交粒度和结果校验。', ['检查循环内 commit 是否无策略或过于频繁。', '检查失败后是否能从上次成功批次恢复，重复执行是否幂等。'], '批处理不可恢复会导致重复修复、漏处理、长事务、undo 压力或人工补数据风险。', ['按主键、时间或业务键分批并记录进度。', '为每批记录输入范围、影响行数、失败原因和校验结果。'], 'Oracle PL/SQL Bulk Processing；Oracle COMMIT；批处理发布实践。'),
  rule('DEFAULT-ORACLE-DBLINK-001', 'DBLink 和跨库访问必须限制权限、事务边界和敏感数据范围', 85, 'critical', false, oraclePaths, '新增 DBLink、跨 schema 视图、同义词或远程过程调用时，必须说明最小权限、凭据保护、数据范围、事务一致性和审计；只有高权限、明文凭据或敏感数据跨库读取证据明确时才升级为硬风险。', ['检查 CREATE DATABASE LINK、远程对象 @link、跨库 synonym/view 是否出现。', '检查是否使用高权限账号、固定明文密码或跨库读取敏感数据。'], 'DBLink 会扩大数据库信任边界，凭据泄露或权限过宽会造成跨库数据泄露和横向移动。', ['使用最小权限专用账号和受控网络访问。', '敏感数据跨库访问必须脱敏、审计并限制查询范围。'], 'Oracle Database Links；Oracle Security Guide；最小权限原则。'),
  rule('DEFAULT-ORACLE-RECOVER-002', '破坏性数据修复必须说明 Flashback、备份和恢复窗口', 90, 'critical', true, oraclePaths, '删除、覆盖、批量修复、分区维护和历史数据迁移必须说明 Flashback 可用性、备份点、恢复窗口、验证 SQL 和失败处置。', ['检查高风险 DML/DDL 是否只有执行 SQL、缺少恢复说明。', '检查是否评估 undo 保留、Flashback Table/Query、RMAN 或导出备份可用性。'], '数据修复失败可能超出 Flashback/undo 窗口，导致无法快速恢复或只能人工补偿。', ['执行前确认恢复窗口和备份点。', '提供执行前后校验 SQL、影响行数和恢复步骤。'], 'Oracle Flashback；Oracle Backup and Recovery；生产数据修复实践。'),
];

const postgresqlRules = [
  rule('DEFAULT-POSTGRESQL-TXN-001', 'PostgreSQL 加锁事务不得长时间持锁或缺少等待策略', 70, 'high', false, postgresqlPaths, '事务中使用 SELECT FOR UPDATE、LOCK TABLE、 advisory lock 或高隔离级别时，必须控制锁范围、获取顺序、等待时间和外部调用。', ['检查事务内是否持锁调用 HTTP、MQ、文件、第三方接口或长耗时计算。', '检查 SELECT FOR UPDATE 是否有索引谓词、固定加锁顺序、lock_timeout 或 NOWAIT/SKIP LOCKED 策略。'], '长事务持锁会造成阻塞、死锁、连接耗尽和核心交易排队。', ['缩小事务范围，先完成外部调用或改用 outbox/afterCommit。', '为加锁查询补充索引、固定顺序、锁等待超时和死锁重试。'], 'PostgreSQL Explicit Locking；PostgreSQL SELECT FOR UPDATE；事务隔离实践。'),
  rule('DEFAULT-POSTGRESQL-SEC-001', 'SECURITY DEFINER 函数必须固定 search_path 并最小授权', 95, 'critical', true, postgresqlPaths, 'SECURITY DEFINER 函数、过程和触发器以创建者权限运行，必须设置安全 search_path、限制可执行权限，并避免拼接执行不可信 SQL。', ['检查 SECURITY DEFINER 是否缺少 SET search_path 到可信 schema 和 pg_temp 控制。', '检查 EXECUTE 动态 SQL 是否绑定参数或使用 format %I/%L，并限制 GRANT EXECUTE 范围。'], '攻击者可通过对象名劫持、临时 schema 或动态 SQL 提权，绕过应用鉴权读取或篡改数据。', ['在函数定义中固定 search_path，并撤销 public 执行权限。', '动态对象名使用白名单和安全格式化，值参数使用绑定。'], 'PostgreSQL CREATE FUNCTION SECURITY DEFINER；PostgreSQL Function Security；OWASP Least Privilege。'),
  rule('DEFAULT-POSTGRESQL-DDL-001', '热表 DDL 必须使用低锁分阶段方案', 95, 'critical', true, postgresqlPaths, 'PostgreSQL 热表索引、约束、字段默认值、NOT NULL 和类型变更必须评估锁级别，使用低锁、分阶段、可回滚方案。', ['检查 CREATE INDEX 是否应使用 CONCURRENTLY。', '检查新增约束是否可先 NOT VALID 再 VALIDATE，NOT NULL 是否先回填并验证。'], '普通 DDL 可能长时间阻塞读写或等待锁，导致核心接口不可用和发布卡死。', ['使用 CREATE INDEX CONCURRENTLY、NOT VALID/VALIDATE、分批回填、短事务和 lock_timeout。', '避免把 CONCURRENTLY 放在事务包装迁移中，并准备回滚或前滚脚本。'], 'PostgreSQL CREATE INDEX CONCURRENTLY；PostgreSQL ALTER TABLE；数据库在线变更实践。'),
  rule('DEFAULT-POSTGRESQL-RLS-001', '多租户表的 RLS 和租户过滤不得被绕过', 90, 'critical', true, postgresqlPaths, '使用 PostgreSQL Row Level Security、租户 schema 或租户字段隔离时，不得关闭 RLS、绕过 policy，或新增缺少租户条件的查询路径。', ['检查 ALTER TABLE ... DISABLE ROW LEVEL SECURITY、BYPASSRLS、SECURITY DEFINER 是否绕过租户策略。', '检查 Mapper、Repository 和 SQL 是否缺少 tenant_id/org_id 等隔离条件。'], '租户隔离被绕过会造成跨租户数据泄露、越权修改和合规事故。', ['保持 RLS 开启并为管理任务限定专用账号、审计和审批。', '所有业务查询必须从可信上下文注入租户条件，并补充越权失败测试。'], 'PostgreSQL Row Security Policies；OWASP Broken Access Control；多租户数据隔离实践。'),
  rule('DEFAULT-POSTGRESQL-IDX-001', 'PostgreSQL 索引变更必须匹配查询谓词、排序和统计信息', 60, 'high', false, postgresqlPaths, '新增核心查询或索引时，应确认 btree、GIN、GiST、BRIN、partial index、expression index 与真实谓词、排序和表规模匹配。', ['检查 ILIKE、函数表达式、JSONB、数组、范围类型和排序是否需要特定索引。', '检查 partial index 条件是否与 SQL 谓词完全兼容，并是否需要 ANALYZE 更新统计信息。'], '索引不匹配会让 PostgreSQL 选择顺序扫描、排序溢出或错误执行计划，导致生产慢查询。', ['用 EXPLAIN/ANALYZE 验证核心 SQL。', '为表达式、JSONB、范围或部分索引写明适用谓词、表规模和回退方案。'], 'PostgreSQL Indexes；PostgreSQL EXPLAIN；SQL 性能审查实践。'),
  rule('DEFAULT-POSTGRESQL-JSON-001', 'JSONB 查询必须有结构约束、索引和兼容演进策略', 55, 'high', false, postgresqlPaths, 'JSONB 字段承载查询、权限、状态或唯一语义时，应声明结构校验、版本兼容和 GIN/表达式索引策略。', ['检查 ->、->>、@>、jsonb_path_query 等热点查询是否无索引。', '检查 JSONB 字段是否缺少 schema 校验、默认值、版本字段和历史数据兼容。'], '无约束 JSONB 会造成结构漂移、慢查询、类型比较错误和灰度期间字段缺失。', ['用应用 schema、CHECK、生成列或领域对象约束结构。', '热点路径建立 GIN 或表达式索引，并为版本演进保留兼容读取。'], 'PostgreSQL JSON Types；PostgreSQL GIN Indexes；数据契约治理实践。'),
];

const oceanbaseRules = [
  rule('DEFAULT-OCEANBASE-COMPAT-001', 'OceanBase 必须声明并遵守 MySQL 或 Oracle 租户兼容模式', 95, 'critical', true, oceanbasePaths, 'OceanBase SQL、DDL、分页、序列、自增、函数、数据类型和驱动配置必须与目标租户的 MySQL 或 Oracle 兼容模式一致，不得混用两种方言。', ['检查同一迁移或 Mapper 是否混用 MySQL LIMIT、自增语法与 Oracle sequence、dual、ROWNUM、包过程等语法。', '检查连接串、租户、schema、DDL 和应用配置是否明确兼容模式。'], '方言混用会导致发布时 SQL 不兼容、分页错误、序列冲突、DDL 失败或运行时只在生产租户暴露。', ['在规则、迁移目录或配置中声明 OceanBase 租户兼容模式。', '按兼容模式拆分脚本和 Mapper，跨模式复用必须有适配层和测试。'], 'OceanBase MySQL/Oracle 兼容模式文档；OceanBase SQL 兼容性；数据库方言治理实践。'),
  rule('DEFAULT-OCEANBASE-TXN-001', 'OceanBase 大批量写入和跨分区事务必须分批限速', 70, 'high', false, oceanbasePaths, 'OceanBase 大批量 DML、跨分区写入、跨租户操作和长事务必须评估事务大小、锁等待、复制延迟、超时和租户资源影响。', ['检查是否一次性更新或删除大量数据。', '检查跨分区 join/update、批量回填、历史归档是否有分批、限速、重试和观测指标。'], '分布式事务放大会造成锁等待、租户资源打满、复制延迟和核心业务抖动。', ['按主键、分区或时间窗口分批执行，并设置超时和限速。', '发布时观察租户 CPU/IO、锁等待、复制延迟和失败重试。'], 'OceanBase 事务文档；OceanBase 分布式执行；生产数据迁移实践。'),
  rule('DEFAULT-OCEANBASE-DDL-001', 'OceanBase 热表 DDL、索引和分区变更必须确认在线能力与回滚', 95, 'critical', true, oceanbasePaths, 'OceanBase 热表 DDL、主键/唯一键、全局索引、分区和列类型变更必须说明在线能力、兼容模式、执行窗口、失败恢复和回滚策略。', ['检查 ALTER TABLE、CREATE INDEX、DROP INDEX、分区调整和唯一约束是否作用于热表。', '检查是否说明在线 DDL 支持范围、租户资源影响、执行窗口和回滚或前滚脚本。'], '错误 DDL 可能阻塞租户、破坏分区裁剪、造成复制延迟或让应用版本不兼容。', ['在预发租户验证 DDL 语法、锁行为和执行耗时。', '为热表变更准备分阶段方案、回滚/前滚脚本和发布观察指标。'], 'OceanBase DDL 文档；OceanBase 索引和分区文档；数据库在线变更实践。'),
  rule('DEFAULT-OCEANBASE-PART-001', 'OceanBase 分区键、唯一键和全局索引必须匹配访问模式', 75, 'high', false, oceanbasePaths, 'OceanBase 分区表设计和变更必须确认分区键、主键、唯一键、全局/局部索引与核心查询、写入热点和数据生命周期匹配。', ['检查唯一约束是否与分区键和租户维度兼容。', '检查热点查询是否能分区裁剪，跨分区查询是否可接受。'], '分区设计不当会导致跨分区扫描、写热点、全局索引维护成本过高或唯一性语义错误。', ['按租户、时间或业务主键选择稳定分区策略。', '用执行计划验证核心查询能分区裁剪，并为归档清理准备校验和回滚。'], 'OceanBase 分区文档；OceanBase 全局索引；分布式数据库建模实践。'),
  rule('DEFAULT-OCEANBASE-RESOURCE-001', 'OceanBase 租户资源、连接池和超时配置必须受控', 65, 'high', false, oceanbasePaths, 'OceanBase 应用连接池、批处理并发、SQL 超时和租户资源使用必须与租户规格匹配，避免单应用耗尽租户资源。', ['检查连接池最大连接、并发任务、查询超时、批量大小是否无上限。', '检查新增后台任务或报表是否说明租户 CPU、内存、IO 和连接影响。'], '资源配置失控会造成租户级雪崩，影响同租户所有业务。', ['设置连接池上限、SQL 超时、批处理限速和熔断。', '对高成本任务使用低峰窗口、队列和租户资源监控。'], 'OceanBase 租户资源管理；JDBC 连接池实践；SRE 容量治理。'),
];

const redisRules = [
  rule('DEFAULT-REDIS-LOCK-001', 'Redis 分布式锁必须原子加锁、唯一令牌释放并设置超时', 95, 'critical', true, redisPaths, '生产分布式锁不得使用 SETNX 后单独 EXPIRE、无唯一 token、无过期时间或非原子释放。', ['检查 setnx + expire 是否分两步执行。', '检查释放锁是否校验唯一 token，并是否使用 Lua 或等价原子操作。'], '锁失效会导致重复扣款、重复发货、库存超卖；锁无法释放会造成业务死锁。', ['使用 SET key value NX PX 原子加锁，value 使用唯一随机 token。', '释放时用 Lua 校验 token 后删除，并设置合理过期、续期和失败降级策略。'], 'Redis Distributed Locks；Redlock 设计说明；分布式幂等实践。'),
  rule('DEFAULT-REDIS-CACHE-001', '会话、权限、风控和幂等缓存必须有 TTL 与隔离维度', 95, 'critical', true, redisPaths, '会话、权限、风控、余额、幂等、验证码和租户数据缓存必须设置 TTL、隔离 key 和失效策略，不得永久或跨租户复用。', ['检查 Redis key 是否包含 tenantId、userId、业务场景等隔离维度。', '检查 set/hset 缓存是否缺少 expire、ttl、版本号或主动失效路径。'], '永久或跨租户缓存会造成越权、脏读、旧权限继续生效、重复请求绕过或资金状态错误。', ['把租户、用户、权限范围和业务类型纳入 key。', '设置 TTL、主动失效、版本号或双删策略，并为权限变更补充回归测试。'], 'Redis 缓存实践；OWASP Broken Access Control；企业缓存治理实践。'),
  rule('DEFAULT-REDIS-CMD-001', '生产请求路径禁止 KEYS、FLUSH、无界 Lua 和无界批量删除', 95, 'critical', true, redisPaths, '生产请求、定时任务和管理接口不得执行 KEYS、FLUSHALL、FLUSHDB、无界 Lua、无界 scan 删除或大范围阻塞命令。', ['检查 KEYS、FLUSH*、EVAL、DEL 大集合、SMEMBERS 大集合和无 cursor/limit 的扫描。', '检查清理任务是否有限速、游标、批次、管理权限和审计。'], 'Redis 单线程被阻塞会导致全站缓存不可用；FLUSH 或无界删除会直接清空生产数据。', ['用 SCAN/SSCAN/HSCAN/ZSCAN 分批游标处理，并限制批次和速率。', '危险命令只允许受控管理通道、审批和审计，线上默认禁用。'], 'Redis KEYS/SCAN 文档；Redis Latency；生产运维安全实践。'),
  rule('DEFAULT-REDIS-BIGKEY-001', 'Redis big key、hot key 和大集合必须有容量与拆分策略', 65, 'high', false, redisPaths, '新增 Redis key、hash、list、set、zset、stream 时，应控制单 key 大小、元素数量、热点访问和序列化体积。', ['检查单 key 是否可能无限增长或承载大对象。', '检查热点 key 是否被所有请求集中访问，是否有本地缓存、分片或降级策略。'], 'big key 会造成网络抖动、阻塞删除、持久化膨胀；hot key 会让 Redis 单点压力放大。', ['按业务维度拆 key、设置上限和 TTL。', '使用分片、本地缓存、异步删除 UNLINK 或后台清理，并监控 key 大小和访问热点。'], 'Redis Memory Optimization；Redis Latency；缓存容量治理实践。'),
  rule('DEFAULT-REDIS-PUBSUB-001', 'Redis Pub/Sub 不得承载必须可靠送达的关键业务事件', 70, 'high', false, redisPaths, 'Redis Pub/Sub、普通通知和非持久化通道不保证离线可靠送达，关键业务事件必须使用可靠队列、Stream、MQ 或 outbox。', ['检查订单、支付、库存、审计、权限变更等事件是否仅 publish 后即认为成功。', '检查订阅者离线、重启、网络抖动时是否有补偿、重放或持久化记录。'], '关键事件丢失会导致状态不一致、审计缺失、缓存不失效或资金链路漏处理。', ['关键事件进入 RabbitMQ/Kafka/Redis Stream 或数据库 outbox。', 'Pub/Sub 只用于可丢弃通知，并为订阅失败设计补偿刷新。'], 'Redis Pub/Sub 文档；Redis Streams；Transactional Outbox。'),
  rule('DEFAULT-REDIS-SERIAL-001', 'Redis 值序列化不得使用不可信反序列化或跨版本脆弱格式', 75, 'high', false, redisPaths, 'Redis 中存储跨服务共享或外部可影响的数据时，不得使用 Java 原生序列化、pickle 或缺少版本字段的脆弱二进制格式。', ['检查 JdkSerializationRedisSerializer、pickle、dill、Kryo 默认类名反序列化和无版本 JSON。', '检查缓存值是否可能被外部系统、脚本或旧版本写入。'], '不安全反序列化可能触发 RCE；格式无版本会导致灰度期间反序列化失败或读到错误字段。', ['使用 JSON/MessagePack/ProtoBuf 等受控格式，并记录 schema/version。', '对反序列化输入做类型白名单、长度限制和失败降级。'], 'OWASP Deserialization Cheat Sheet；Spring Data Redis Serialization；Python pickle 安全警告。'),
];

const rabbitmqRules = [
  rule('DEFAULT-RABBITMQ-ACK-001', 'RabbitMQ 消费者必须事务成功后确认并保证幂等', 95, 'critical', true, rabbitmqPaths, 'RabbitMQ 消费端不得 autoAck 或在数据库事务成功前 ack；必须明确 ack/nack/requeue、死信队列和重复投递幂等策略。', ['检查 autoAck=true、AcknowledgeMode.NONE 或消费入口先 ack 后写库。', '检查重复 delivery、消费者重启、事务回滚后是否会重复写入或丢消息。'], '提前确认会造成消息丢失；缺少幂等会造成重复扣款、重复发货、重复通知或状态错乱。', ['使用手动确认，并在本地事务成功后 ack。', '用业务幂等键、唯一约束或状态机处理重复投递，失败进入 nack/DLQ/补偿。'], 'RabbitMQ Consumer Acknowledgements；Spring AMQP AcknowledgeMode；消息幂等实践。'),
  rule('DEFAULT-RABBITMQ-DELIVERY-001', '关键消息必须配置持久化、publisher confirm 和 return/outbox', 95, 'critical', true, rabbitmqPaths, '订单、支付、库存、审计、权限等关键消息必须使用 durable exchange/queue、persistent message、publisher confirm/return 或可靠 outbox。', ['检查关键事件是否发送到非 durable queue/exchange 或 deliveryMode 非 persistent。', '检查 publisher confirm、returnCallback、mandatory、事务消息或 outbox 是否缺失。'], 'Broker 重启、网络抖动或路由失败时，消息可能静默丢失，导致业务状态不一致。', ['声明 durable exchange/queue，发送 persistent message。', '开启 publisher confirm/return，或使用数据库 outbox 和后台可靠投递。'], 'RabbitMQ Publisher Confirms；RabbitMQ Message Durability；Transactional Outbox。'),
  rule('DEFAULT-RABBITMQ-RETRY-001', 'RabbitMQ 重试必须有上限、退避、DLQ 和毒消息隔离', 95, 'critical', true, rabbitmqPaths, '消费失败不得无限 requeue 或无退避重试；必须限制次数、延迟退避、隔离毒消息并保留可排查上下文。', ['检查 basicNack/basicReject requeue=true 是否在异常路径无限循环。', '检查重试计数、延迟队列、死信交换机、告警和人工处理通道是否存在。'], '单条毒消息会反复打满消费者和 Broker，造成队列堆积、CPU 飙升和业务雪崩。', ['使用 retry count、延迟重试、DLQ 和告警。', '不可恢复异常直接进入死信或人工处置，保留消息 ID、错误原因和 traceId。'], 'RabbitMQ Dead Letter Exchanges；Spring AMQP Retry；消息重试治理实践。'),
  rule('DEFAULT-RABBITMQ-SCHEMA-001', '消息体必须有稳定 schema、版本和兼容策略', 65, 'high', false, rabbitmqPaths, '跨服务消息必须声明 eventType、version、messageId、occurredAt、traceId 和业务键，字段变更必须兼容旧消费者。', ['检查消息 DTO 是否删除、重命名或改变字段含义。', '检查消费者是否能处理未知字段、缺省字段和旧版本消息。'], '消息契约破坏会导致消费者反序列化失败、漏处理或错误解释业务状态。', ['使用版本化事件 schema，并保持向后兼容。', '新增字段提供默认值，破坏性变更使用新 eventType/version 并灰度发布。'], 'CloudEvents；AsyncAPI；事件驱动契约治理实践。'),
  rule('DEFAULT-RABBITMQ-ORDER-001', '依赖顺序的消息必须声明分区键、单活消费或乱序补偿', 60, 'high', false, rabbitmqPaths, '订单状态、账户流水、库存变更等依赖顺序的消息必须说明路由键、分区、单活消费、幂等状态机或乱序补偿。', ['检查同一业务实体的事件是否可能进入多个队列、多个消费者并发或不同 routing key。', '检查消费者是否按版本号、状态机或时间戳拒绝旧事件覆盖新状态。'], '乱序消费会让订单回退、库存错误、账务状态覆盖或重复通知。', ['按业务实体路由到稳定分区或单活队列。', '消费者使用状态机、版本号和幂等表处理重复与乱序。'], 'RabbitMQ Routing；消息顺序与幂等实践；事件状态机设计。'),
];

const droolsRules = [
  rule('DEFAULT-DROOLS-DRL-001', 'DRL 规则名必须在同一 package 内唯一', 70, 'high', true, droolsPaths, '同一 Drools package 内不得出现会覆盖或破坏执行结果的重复规则名。', ['检查同 package 下 rule 名称是否重复。', '检查重命名是否保持审计、日志和回归用例可追踪。'], '重复规则名可能覆盖旧规则、导致构建失败或产生错误决策。', ['使用稳定且唯一的业务域规则名。', '重命名时同步测试、日志和规则说明。'], 'Drools DRL Language Reference；KIE rule assets。'),
  rule('DEFAULT-DROOLS-FLOW-001', '禁止无理由使用高 salience 或大范围 salience 梯度', 35, 'medium', false, ['**/*.drl'], 'salience 会改变 agenda 优先级，不应被当作隐藏业务流程。', ['检查 salience 大量魔法数。', '检查是否有业务说明和测试覆盖执行顺序。'], '过度依赖 salience 会导致规则新增后执行顺序漂移。', ['用显式 fact 状态、agenda group 或规则流表达流程。', '为优先级规则补充测试。'], 'Drools rule attributes salience。'),
  rule('DEFAULT-DROOLS-FLOW-002', '自修改规则必须显式处理循环触发', 75, 'high', true, droolsPaths, '规则 RHS 修改可匹配事实时，必须处理重复激活和循环触发。', ['检查 modify/update 后是否会再次满足同一规则。', '检查 no-loop、lock-on-active 或状态推进是否正确。'], '循环触发会造成重复扣费、错误决策、CPU 飙升或规则执行不终止。', ['使用 no-loop、状态字段或规则流控制。', '为重复触发场景补充规则测试。'], 'Drools no-loop；Drools modify/update。'),
  rule('DEFAULT-DROOLS-FLOW-003', '审慎使用 lock-on-active，避免与 from 组合误伤规则执行', 50, 'high', false, ['**/*.drl'], 'lock-on-active 会丢弃激活，应避免在复杂 from 场景中隐藏规则执行。', ['检查 lock-on-active 与 from、agenda group、ruleflow group 的组合。', '检查是否有测试证明规则不会被误抑制。'], '误用会导致应执行规则被跳过，产生错误决策。', ['优先使用更明确的状态 fact。', '保留 lock-on-active 时写明原因并覆盖测试。'], 'Drools lock-on-active；Drools conditional element from。'),
  rule('DEFAULT-DROOLS-FACT-001', 'fact 修改必须通过 modify 或 update 通知工作内存', 80, 'critical', true, droolsPaths, '已插入工作内存的 fact 发生变化时必须通知 Drools。', ['检查 RHS 中直接 setter 后是否缺少 modify/update。', '检查 Java/Kotlin 规则服务修改 fact 后是否通知 session。'], '工作内存索引失真会导致后续规则基于旧事实执行。', ['在 DRL 中使用 modify。', '在 Java/Kotlin 中调用 update 并传入正确 fact handle。'], 'Drools modify；Drools update；Working Memory。'),
  rule('DEFAULT-DROOLS-FACT-002', 'insert、retract、delete 必须限制副作用范围', 75, 'high', true, droolsPaths, '新增、撤回或删除 fact 会改变整个规则网络，必须限制条件和生命周期。', ['检查无条件 insert 是否可能重复创建 fact。', '检查 retract/delete 是否过早移除其他规则需要的事实。'], '事实生命周期错误会造成级联触发、漏判或错误决策。', ['为 insert/delete 增加条件和状态标记。', '为事实生命周期补充回归样例。'], 'Drools insert；Drools delete；Fact lifecycle。'),
  rule('DEFAULT-DROOLS-FACT-003', 'RHS consequence 不应承载外部不可回滚副作用', 80, 'critical', true, ['**/*.drl'], '规则 RHS 不应直接发 HTTP、写数据库、发消息、扣费或删文件等不可回滚操作。', ['检查 consequence 中是否调用外部网关、DAO、消息发送或文件操作。', '检查重复激活时副作用是否幂等。'], '规则重复触发或回滚失败会造成重复扣费、脏写和外部系统不一致。', ['在 RHS 只产生命令或事件 fact。', '由应用层统一处理副作用和事务。'], 'Drools consequence model；Working Memory semantics。'),
  rule('DEFAULT-DROOLS-PERF-001', '复杂条件应避免不可索引和高成本匹配', 45, 'medium', false, ['**/*.drl'], '规则条件应避免大量 eval、深层 from 和跨大集合笛卡尔匹配。', ['检查 eval 中复杂函数和外部调用。', '检查 from 是否遍历大集合或嵌套集合。'], '高成本匹配会让事实数量增长后性能急剧退化。', ['把可索引字段放入约束。', '预处理大集合或拆分规则。'], 'Drools constraints；Drools eval；Drools from。'),
  rule('DEFAULT-DROOLS-GLOBAL-001', 'global 不得承载可变业务状态或跨规则共享副作用', 85, 'critical', true, droolsPaths, 'Drools global 只能作为只读服务或配置入口，不得保存决策状态、跨规则可变集合，或在规则中直接写库、发消息、调用远程副作用。', ['检查 global List/Map/DAO/Service 是否被 RHS 修改或用于保存结果。', '检查 global 调用是否绕过事务、幂等、审计和异常处理。'], 'global 可变状态会污染多次执行和并发会话，外部副作用会造成重复执行和事务不一致。', ['把结果写成 fact 或命令对象，由应用层统一提交。', 'global 如用于服务调用，必须只读、幂等并受应用层隔离。'], 'Drools Globals；Drools Stateless/Stateful Sessions；规则引擎实践。'),
  rule('DEFAULT-DROOLS-IDEMP-001', '关键规则执行结果必须具备幂等键或状态推进', 85, 'critical', true, droolsPaths, '资金、库存、权限、审批、履约、计费和风控规则不得只依赖规则触发次数，必须用幂等键、状态机或结果 fact 防止重复生效。', ['检查 RHS 是否直接累加金额、扣减库存、授予权限或改变订单状态。', '检查重复 insert/update、重试和多次 fireAllRules 是否会重复生效。'], '规则重复激活或重试会造成重复扣费、重复发券、重复审批或权限状态错乱。', ['用业务幂等键、状态推进和唯一约束保护结果。', '为重复执行、重试和并发场景补充规则测试。'], 'Drools Agenda；幂等设计；风控规则实践。'),
  rule('DEFAULT-DROOLS-TIME-001', '日期时间规则必须显式时区、时钟来源和边界语义', 70, 'high', false, droolsPaths, '涉及账期、合同、权益、活动、风控有效期和过期判断的规则必须明确时区、时钟来源、日期闭区间/开区间和夏令时边界。', ['检查 LocalDateTime.now、new Date、系统默认时区和字符串日期比较。', '检查生效/失效边界是否说明包含当天、当天结束或精确到秒。'], '时间语义不清会导致权益提前失效、计费跨期、风控绕过或审计时间错乱。', ['由应用层注入统一 Clock 或业务日期。', '在规则中明确时区和边界，并补充跨日、月底和 DST 样例。'], 'Java Time API；Drools temporal reasoning；业务时间建模。'),
  rule('DEFAULT-DROOLS-NUM-001', '金额、比例和阈值计算必须使用 BigDecimal 安全比较与明确舍入', 80, 'critical', true, droolsPaths, '规则中涉及金额、折扣、费率、税费、积分和阈值判断时，不得使用 double 精度、BigDecimal equals 或缺省舍入的 divide。', ['检查 BigDecimal.equals、new BigDecimal(double)、divide 未指定 RoundingMode。', '检查 DRL 中数字字面量和 Java 规则服务是否保持精度一致。'], '金额精度错误会导致计费、折扣、税费和风控阈值判断偏差。', ['使用 compareTo 做数值比较。', '统一 scale 和 RoundingMode，并用字符串或整数最小单位构造金额。'], 'JDK BigDecimal；阿里巴巴 Java 开发手册；金融计算实践。'),
  rule('DEFAULT-DROOLS-RELEASE-001', '规则热更新必须具备版本、灰度、回滚和兼容策略', 90, 'critical', true, droolsPaths, 'KieScanner、KieContainer、动态规则包或配置中心下发规则时，必须记录规则版本、灰度范围、回滚包、事实模型兼容和审计追踪。', ['检查是否引入动态加载 DRL、Maven KJAR 热更新或远程规则配置。', '检查规则包与事实类、枚举、字段和旧会话是否兼容。'], '无治理热更新会把错误规则直接推到生产，导致大面积错误决策且难以回滚。', ['规则包必须版本化、灰度发布并保留回滚版本。', '关键规则发布前后记录命中率、输入摘要和决策差异。'], 'Drools KIE Scanner；KIE Containers；规则发布治理。'),
  rule('DEFAULT-DROOLS-SEC-001', '不得执行不可信来源的 DRL、MVEL、表达式或动态规则包', 95, 'critical', true, droolsPaths, 'DRL、MVEL、Java dialect、规则模板和动态规则包不得直接来自用户、租户、接口、数据库可编辑内容或未签名远程来源。', ['检查是否允许上传、编辑或远程拉取规则后直接编译执行。', '检查是否限制 import、反射、文件、网络、系统属性和危险类调用。'], '不可信规则执行等同代码执行，可能导致 RCE、越权访问、数据泄露或规则污染。', ['只允许可信源码或签名规则包进入执行器。', '多租户或在线编辑场景必须使用受限 DSL、白名单、沙箱和审计。'], 'Drools Security；MVEL security；OWASP Injection。'),
  rule('DEFAULT-DROOLS-MAINT-001', '禁止通过隐式执行顺序表达业务依赖', 50, 'high', false, ['**/*.drl'], '规则间依赖不应只靠文件顺序、salience 魔法数或 agenda 切换暗含。', ['检查规则是否依赖前一条规则先执行但没有状态 fact。', '检查规则流是否有可读说明。'], '隐式顺序会让新增规则破坏旧业务结果。', ['使用显式状态 fact 或规则流。', '为关键顺序写明业务含义和测试。'], 'Drools agenda；Drools rule attributes。'),
  rule('DEFAULT-DROOLS-MAINT-002', 'DRL 资产必须按业务域分包并配套规则测试', 40, 'medium', false, droolsPaths, '规则文件应按业务域组织，并保留可回归的规则样例或测试。', ['检查大型 DRL 是否混合多个业务域。', '检查新增规则是否有典型输入输出样例。'], '缺少组织和测试会导致规则资产难维护、难回归。', ['按业务域拆分 package 和文件。', '为新增规则补充 KIE 测试或样例。'], 'KIE rule assets；Drools test scenarios。'),
];

const securityRules = [
  rule('DEFAULT-SEC-001', '禁止任何技术栈提交密钥、Token、私钥和真实 .env', 100, 'critical', true, securityPaths, '任何语言、配置、脚本、容器文件和文档中都不得提交真实凭据。', ['检查密钥、Token、密码、私钥、Cookie、连接串和真实 .env 值。', '检查凭据是否已经进入 diff、测试数据或镜像构建文件。'], '凭据泄露会导致账号接管、生产数据暴露和云资源滥用。', ['删除凭据并改为密钥管理或环境注入。', '轮换所有已暴露凭据。'], 'OWASP Secrets Management；CWE-798；GitHub Secret Scanning。'),
  rule('DEFAULT-SEC-002', '用户私有资源必须鉴权并校验归属', 100, 'critical', true, securityPaths, '访问用户、租户、订单、文件、权限和后台资源时必须校验身份、角色和资源归属。', ['检查接口是否只按 ID 查询私有资源。', '检查是否移除租户、owner、role 或 scope 校验。'], '缺少归属校验会导致水平越权和敏感数据泄露。', ['在服务端强制校验操作者与资源关系。', '为越权访问补充失败测试。'], 'OWASP API Security；OWASP Top 10 Broken Access Control。'),
  rule('DEFAULT-SEC-003', '文件上传必须限制类型、大小、存储位置和执行权限', 95, 'critical', true, securityPaths, '上传功能必须限制内容类型、大小、扩展名、存储目录和执行权限。', ['检查是否信任客户端 Content-Type 或文件名。', '检查上传目录是否可执行或可直接覆盖业务文件。'], '不受控上传可能导致 WebShell、任意文件写入或磁盘耗尽。', ['服务端校验魔数、大小和扩展名。', '上传文件隔离存储并禁用执行。'], 'OWASP File Upload Cheat Sheet；CWE Top 25。'),
  rule('DEFAULT-SEC-004', '敏感数据展示、日志、导出和前端状态必须脱敏', 95, 'critical', true, securityPaths, '身份证、手机号、银行卡、Token、密码、隐私字段不得完整输出到页面、日志、导出或前端状态。', ['检查日志、报表、导出、错误响应和前端 store。', '检查异常栈是否包含请求头、Cookie 或密钥。'], '敏感数据泄露会造成合规风险、账号接管和隐私事故。', ['按场景脱敏、哈希或删除敏感字段。', '日志保留排障上下文但不打印秘密。'], 'OWASP Logging Cheat Sheet；OWASP API Security。'),
  rule('DEFAULT-SEC-005', '外部 URL、文件路径和重定向目标必须白名单校验', 90, 'critical', true, securityPaths, '外部跳转、回调地址、文件读取路径和下载目标必须限制到可信范围。', ['检查 redirect、callback、returnUrl、file path 是否来自用户输入。', '检查是否存在路径穿越或开放重定向。'], '未校验目标会导致钓鱼、SSRF、任意文件读取或路径穿越。', ['使用白名单域名和规范化路径。', '拒绝相对穿越和未知协议。'], 'OWASP SSRF；OWASP Unvalidated Redirects；CWE Top 25。'),
  rule('DEFAULT-SEC-006', '状态变更接口必须防 CSRF 或使用等价保护', 75, 'high', false, securityPaths, '使用 Cookie 认证的状态变更接口应具备 CSRF token、SameSite 或等价保护。', ['检查 POST/PUT/PATCH/DELETE 是否依赖 Cookie 且无 CSRF 防护。', '检查跨站请求是否可触发敏感变更。'], 'CSRF 会诱导用户在已登录状态下执行非预期操作。', ['启用 CSRF token 或 SameSite Cookie。', '对高风险操作增加二次确认或幂等校验。'], 'OWASP CSRF Prevention Cheat Sheet。'),
  rule('DEFAULT-SEC-007', '不可信模板、表达式、脚本和规则输入不得直接执行', 95, 'critical', true, securityPaths, '任何模板、表达式、脚本、规则和命令输入都不得直接来自不可信来源后执行。', ['检查模板引擎、表达式语言、脚本引擎、Drools 和命令执行入口。', '检查是否有沙箱、白名单和权限隔离。'], '直接执行不可信输入可能导致 RCE、XSS、权限绕过或规则污染。', ['只允许可信源码进入执行器。', '必须开放时使用受限 DSL、白名单和沙箱。'], 'OWASP Injection；OWASP XSS；CWE Top 25。'),
  rule('DEFAULT-SEC-008', '权限、风控、计费和数据变更路径不得降级审计日志', 80, 'high', false, securityPaths, '高风险路径应保留可追踪审计日志，不得无替代地删除关键上下文。', ['检查是否删除操作者、资源 ID、结果、失败原因和 trace id。', '检查是否把敏感明文当作审计内容。'], '审计缺失会让越权、资金和数据事故无法追踪。', ['保留必要审计字段并脱敏。', '对关键变更写入不可抵赖审计。'], 'OWASP Logging Cheat Sheet；阿里巴巴日志规约。'),
  rule('DEFAULT-SEC-009', 'CORS 不得同时允许任意 Origin 和凭据', 95, 'critical', true, securityPaths, '任何网关、后端、Nginx、K8s、前端代理或配置中都不得把 Access-Control-Allow-Origin: * 与凭据请求组合使用。', ['检查 allowCredentials、withCredentials、Access-Control-Allow-Credentials、Cookie、Authorization 与通配 Origin 是否同时出现。', '检查是否按环境使用可信域名白名单并禁止反射任意 Origin。'], '凭据跨域放开会让恶意站点读取用户私有数据或触发状态变更。', ['使用明确 Origin 白名单，并对凭据请求返回具体 Origin。', '禁止把请求 Origin 原样反射为允许值，管理端和私有 API 默认关闭跨域。'], 'MDN CORS credentials；Spring Framework CORS；OWASP CSRF Prevention。'),
  rule('DEFAULT-SEC-010', 'Cookie、会话和浏览器安全响应头不得降级', 90, 'critical', true, securityPaths, '登录态、会话 Cookie、CSRF Cookie 和安全响应头不得被移除或降级，尤其是 HttpOnly、Secure、SameSite、CSP、HSTS、X-Frame-Options。', ['检查 Set-Cookie 是否缺少 HttpOnly/Secure/SameSite 或把 SameSite=None 与非 Secure 组合。', '检查 CSP、frame-ancestors、HSTS、X-Content-Type-Options 是否被删除或对生产关闭。'], '浏览器安全头降级会导致会话窃取、点击劫持、跨站脚本扩大化或中间人风险。', ['为会话 Cookie 设置 HttpOnly、Secure、SameSite。', '保持必要安全头，并按业务场景最小化放开 CSP 和 frame 规则。'], 'OWASP Session Management Cheat Sheet；OWASP Secure Headers；MDN Set-Cookie。'),
  rule('DEFAULT-SEC-011', '登录、验证码、导出、搜索和高成本接口必须有限流和资源保护', 75, 'high', false, securityPaths, '认证、验证码、短信、导出、搜索、批量查询、规则执行和大文件接口应限制频率、并发、结果集和成本。', ['检查是否新增高成本接口但缺少 rate limit、captcha、配额、分页上限、队列或熔断。', '检查失败重试和批量导出是否可被单用户或单 IP 放大。'], '缺少滥用保护会导致撞库、短信轰炸、数据批量爬取、数据库压力或服务不可用。', ['增加按用户、租户、IP 和接口维度的限流与配额。', '高成本操作异步化、分页化，并记录审计和告警。'], 'OWASP API Security API4；OWASP Authentication Cheat Sheet；资源消耗防护实践。'),
  rule('DEFAULT-SEC-012', '依赖锁文件、镜像来源和安装脚本不得引入不可信供应链入口', 75, 'high', false, supplyChainPaths, '新增依赖、镜像、包管理配置和安装脚本时，应固定来源、版本、校验和锁文件，避免 git/http/tarball、不可信 registry、postinstall 后门和签名绕过。', ['检查 package、Maven、Gradle、pip、Dockerfile、.npmrc、私服地址和 lock 文件是否同步。', '检查是否新增远程脚本、postinstall、curl|sh、未固定版本或不可信镜像源。'], '供应链入口失控会引入恶意依赖、构建污染、后门脚本或不可复现发布。', ['固定版本和来源，同步锁文件或约束文件。', '避免安装期执行远程脚本，对私服、镜像和签名校验做变更说明。'], 'GitHub Dependency Review；SLSA；OWASP Software Supply Chain Security。'),
  rule('DEFAULT-SEC-013', '调试端点、Swagger、H2、Druid、GraphQL introspection 不得在生产无鉴权暴露', 95, 'critical', true, securityPaths, '生产或公网环境不得无鉴权暴露 Swagger、Actuator、H2 Console、Druid、GraphQL introspection、debug toolbar、admin 控制台等管理面。', ['检查配置是否开启管理端点、调试 UI、数据库控制台或 introspection。', '检查生产 profile、网关、容器和反向代理是否有鉴权、网络隔离和脱敏。'], '管理面暴露会泄露接口、配置、数据库、运行时和内部结构，可能进一步导致越权或 RCE。', ['生产关闭调试和管理 UI，必要端点加鉴权、内网隔离、最小暴露和审计。', '开发配置必须与生产 profile 明确隔离。'], 'OWASP Security Misconfiguration；Spring Boot Actuator Security；GraphQL Security。'),
  rule('DEFAULT-FE-LINT-001', '前端核心安全和契约 lint 规则不得全局关闭或降级', 90, 'critical', true, [...vuePaths, 'eslint.config.js', '.eslintrc*', 'package.json'], 'ESLint、eslint-plugin-vue、typescript-eslint、Vue 安全规则和类型安全规则不得在项目级被关闭、降级或用空配置绕过。', ['检查 vue/no-v-html、no-unsafe-*、no-implied-eval、no-new-func、no-script-url、no-debugger 等核心规则是否被全局 off。', '检查配置变更是否只为局部误报做最小豁免，并有原因和期限。'], '全局关闭前端扫描会让 XSS、类型逃逸、危险 DOM sink 和调试代码绕过提交门禁。', ['恢复核心安全和契约规则。', '确需豁免时使用局部 disable，并写明原因、范围、负责人和移除期限。'], 'eslint-plugin-vue；typescript-eslint no-unsafe-*；Semgrep ignore governance。'),
  rule('DEFAULT-SEC-SCAN-001', 'Semgrep 和安全扫描配置不得宽泛排除安全关键路径', 90, 'critical', true, [...supplyChainPaths, '.semgrepignore', '.semgrep.yml', '.semgrep.yaml', 'semgrep*.yml', 'semgrep*.yaml'], 'Semgrep、依赖扫描、Secret 扫描、SAST 或 CI 安全门禁不得用 .semgrepignore、exclude、severity 降级或 continue-on-error 宽泛排除前端、安全、后端和配置路径。', ['检查 .semgrepignore、semgrep.yml、CI workflow 是否排除 src、security、*.vue、*.ts、*.java、配置和迁移目录。', '检查高危规则集、严重级别阈值、扫描失败策略是否被删除或降级。'], '扫描被宽泛排除会让真实安全漏洞和凭据泄露绕过提交与 CI。', ['只对具体误报文件或规则做最小豁免。', '豁免必须写明原因、期限和替代人工验证，安全扫描失败默认阻断。'], 'Semgrep ignore 文档；OWASP Secure Code Review；CI 安全门禁实践。'),
  rule('DEFAULT-FE-BUILD-001', '生产 sourcemap 和 debug bundle 不得公开敏感源码与环境信息', 75, 'high', false, [...vuePaths, 'vite.config.ts', 'vite.config.js', 'webpack.config.js', 'vue.config.js', 'nuxt.config.ts', 'nuxt.config.js'], '生产构建不得默认公开 sourcemap、debug bundle、内部路径、环境变量、接口地址和未脱敏源码。', ['检查 production sourcemap、devtool、debug、analyze、console 保留配置。', '检查 sourcemap 上传和公开访问是否区分私有错误平台与公网静态资源。'], '公开 sourcemap 会暴露源码、内部路径、接口结构和安全逻辑，降低攻击门槛。', ['生产默认关闭公开 sourcemap，或只上传到受控错误平台。', '构建产物中不得包含密钥、内部配置和调试入口。'], 'Vite build.sourcemap；Webpack devtool；OWASP Security Misconfiguration。'),
];

const workflowRules = [
  rule('DEFAULT-WORKFLOW-001', '行为变更必须有对应测试或明确无法测试原因', 70, 'high', false, workflowPaths, '改变用户可见行为、业务规则、接口或数据处理时，应补充测试或说明不可自动化原因。', ['检查新增逻辑是否有单元、集成、组件或端到端测试。', '检查未测原因是否具体且可审查。'], '缺少测试会让回归在提交后才暴露。', ['补充覆盖核心行为的测试。', '确实无法测试时写明手工验证步骤。'], 'GitHub Pull Request Review；JUnit/Spring Test；Vue Testing。'),
  rule('DEFAULT-WORKFLOW-002', '缺陷修复必须补充回归测试或复现说明', 75, 'high', false, workflowPaths, '修复 bug 时应把复现路径转化为回归测试或明确记录无法自动化的复现说明。', ['检查修复是否包含失败用例。', '检查测试是否能在未来防止同类回归。'], '没有回归测试的缺陷容易再次出现。', ['先写能复现缺陷的失败测试。', '修复后保留测试并说明覆盖范围。'], 'Test-driven Development；GitHub Pull Request Review。'),
  rule('DEFAULT-WORKFLOW-003', '高风险路径必须覆盖成功、失败、空值和异常分支', 85, 'high', false, workflowPaths, '权限、资金、库存、规则引擎和数据迁移路径应覆盖主要成功、失败、空值和异常分支。', ['检查关键路径是否只测 happy path。', '检查空值、异常、边界金额和权限失败是否覆盖。'], '高风险路径测试不足会隐藏严重业务缺陷。', ['补充边界和失败测试。', '项目可在 diy 规则中把核心域测试不足改为强拦截。'], 'JUnit/Spring Test；Vue Testing；数据库迁移最佳实践。'),
  rule('DEFAULT-WORKFLOW-004', '公共 API 字段删除、重命名或语义变化且无兼容策略时必须硬拦', 90, 'critical', true, workflowPaths, '公共 API 的字段、枚举、状态码和语义变化必须保留兼容策略或版本迁移说明。', ['检查 response/request 字段是否删除、改名或含义变化。', '检查是否有版本、默认值、兼容层或发布说明。'], '破坏性 API 变更会导致前后端、外部客户或移动端运行时失败。', ['提供兼容字段、版本化接口或迁移窗口。', '标注 breaking change 并补充契约测试。'], 'SemVer；Conventional Commits；GitHub Pull Request Review。'),
  rule('DEFAULT-WORKFLOW-005', '数据库 schema 变更缺少迁移、回滚、旧数据和灰度策略时必须硬拦', 90, 'critical', true, workflowPaths, '表结构、索引、字段含义和迁移脚本变更必须说明旧数据处理、回滚或前滚修复和灰度顺序。', ['检查 DDL 是否有迁移说明和回滚策略。', '检查应用代码与 schema 发布顺序是否兼容。'], 'schema 变更缺少策略会造成发布失败、数据丢失或新旧版本不兼容。', ['补充迁移脚本、回滚或前滚方案。', '说明灰度顺序和旧数据校验。'], 'Flyway/Liquibase practices；MySQL/Oracle DDL 文档。'),
  rule('DEFAULT-WORKFLOW-006', '配置项变更必须保留默认值、迁移说明或失败提示', 75, 'high', false, workflowPaths, '新增或修改配置项时应说明默认值、必填性、迁移路径和缺失时错误提示。', ['检查配置读取是否有默认值或启动失败提示。', '检查 README、部署模板和示例配置是否同步。'], '配置变更不清会导致环境启动失败或行为漂移。', ['补充默认值和校验。', '同步示例配置和部署说明。'], 'Twelve-Factor Config；Spring Boot Configuration。'),
  rule('DEFAULT-WORKFLOW-007', '依赖新增必须说明用途并同步锁文件', 65, 'medium', false, workflowPaths, '新增 npm、Maven、Gradle 或其他依赖时应说明用途，并同步锁文件或版本约束。', ['检查 package.json、pom.xml、build.gradle 是否有对应锁文件或版本。', '检查依赖是否和现有能力重复。'], '无说明依赖会增加供应链风险、体积和维护成本。', ['说明用途并固定版本。', '同步 package-lock、pnpm-lock、gradle lock 或 Maven 版本管理。'], 'GitHub Dependency Review；SemVer。'),
  rule('DEFAULT-WORKFLOW-008', '提交前不得遗留调试代码、跳过测试和临时断言', 70, 'high', false, workflowPaths, '提交中不得保留 console 调试、临时开关、跳过测试、only 测试或短路断言。', ['检查 console.log、debugger、describe.only、it.skip、临时 return。', '检查测试跳过是否有明确 issue 和期限。'], '临时代码会污染日志、降低测试可信度或绕过关键逻辑。', ['删除调试代码。', '恢复被跳过测试或说明跟踪 issue。'], 'GitHub Pull Request Review；Vue Testing；JUnit。'),
  rule('DEFAULT-WORKFLOW-009', '生产配置和示例配置必须同步敏感默认值和安全开关', 75, 'high', false, workflowPaths, '修改 application、env、部署模板、Docker、K8s、Helm 或示例配置时，应同步安全默认值、敏感占位符和环境差异说明。', ['检查示例配置是否把安全开关、默认密码、调试模式、管理端点和真实地址同步到错误环境。', '检查新配置是否在 README、部署模板和启动校验中说明。'], '配置漂移会导致测试可用但生产缺项、错误连接真实资源、调试开关泄露或安全策略不一致。', ['同步示例、部署模板和启动校验。', '敏感值使用占位符，危险开关默认关闭，并区分 dev/test/prod profile。'], 'Twelve-Factor Config；Spring Boot Externalized Configuration；部署配置实践。'),
  rule('DEFAULT-WORKFLOW-010', '高风险变更必须有开关、灰度、回滚和观测指标', 80, 'high', false, workflowPaths, '涉及权限、资金、库存、数据库迁移、规则引擎、批量任务和核心接口的变更，应说明开关、灰度范围、回滚或前滚方案和观测指标。', ['检查是否有 feature flag、灰度条件、回滚包、数据校验、告警指标和发布后观察项。', '检查不可逆变更是否有前滚修复和人工处置方案。'], '缺少发布治理会让高风险变更一次性影响全部用户，故障后难以及时止损。', ['增加开关、灰度批次、回滚/前滚步骤和关键指标。', '对数据迁移和规则变更保留审计、比对和回放能力。'], '渐进式交付实践；数据库迁移最佳实践；SRE 监控告警。'),
  rule('DEFAULT-WORKFLOW-011', '生成包、构建产物和临时文件不得误提交', 65, 'medium', false, workflowPaths, '提交中不应包含 dist、build、target、coverage、node_modules、*.tgz、*.zip、*.jar、*.map 等构建产物或临时文件，除非项目明确需要版本化。', ['检查打包文件、源码 map、覆盖率报告、临时目录、缓存文件和本地生成包是否进入提交。', '检查构建产物中是否夹带密钥、源码、依赖或环境配置。'], '误提交产物会污染仓库、扩大 diff、泄露源码或凭据，并让 npm/github 分发流程不可控。', ['把产物加入 .gitignore 或发布流程。', '确需提交时说明生成来源、更新命令和安全检查结果。'], 'Git ignore practices；GitHub secret scanning；npm publish practices。'),
  rule('DEFAULT-WORKFLOW-012', 'CI、测试、扫描和迁移校验不得被跳过或降级', 90, 'critical', true, workflowPaths, '主流程 CI、测试、代码扫描、依赖扫描、数据库迁移校验和发布门禁不得被删除、跳过、continue-on-error 或用临时命令短路。', ['检查 CI job、Maven/Gradle/npm 脚本、Makefile 和 shell 脚本是否加入 -DskipTests、maven.test.skip、--passWithNoTests、|| true、continue-on-error。', '检查质量门禁、覆盖率、安全扫描和迁移 dry-run 是否被删除或仅对主分支失效。'], '门禁被绕过会让缺陷、安全漏洞和迁移失败直接进入主干或生产发布。', ['恢复必跑测试、扫描和迁移校验。', '临时豁免必须有负责人、期限、风险说明和替代验证。'], 'CI/CD best practices；GitHub Actions；Maven/Gradle/npm test practices。'),
  rule('DEFAULT-FE-LINT-002', 'eslint-disable、@ts-ignore 和 nosemgrep 必须局部且说明原因期限', 65, 'high', false, workflowPaths, '局部关闭 ESLint、TypeScript、Semgrep 或安全扫描规则时，必须限定到最小范围，并说明误报原因、负责人或移除期限。', ['检查 eslint-disable、@ts-ignore、@ts-expect-error、nosemgrep、noinspection 是否作用于整文件或整目录。', '检查是否缺少原因说明，或关闭后覆盖安全、权限、XSS、反序列化等关键规则。'], '长期豁免会让真实缺陷沉默，团队逐渐失去扫描可信度。', ['缩小到单行或单条规则，并写明原因和移除条件。', '能用类型、重构或规则配置解决的，不用注释关闭。'], 'typescript-eslint ban-ts-comment；Semgrep nosemgrep；代码扫描豁免治理实践。'),
  rule('DEFAULT-VUE-TEST-001', '权限、路由和 store 组件测试必须覆盖拒绝态与不应调用 API', 70, 'high', false, workflowPaths, '涉及权限按钮、路由守卫、Pinia/Vuex store、菜单和管理操作的前端变更，应测试拒绝态、失败态和不应调用后端 API 的断言。', ['检查测试是否只覆盖 admin happy path。', '检查无权限、过期登录、租户不匹配和接口失败时是否断言按钮隐藏、跳转、错误状态和 API 未调用。'], '前端权限契约漂移会造成误授权、误拒绝或用户能通过界面触发危险操作。', ['补充无权限和失败态组件测试。', '使用 spy/mock 断言拒绝态不会调用高风险 API。'], 'Vue Test Utils；Pinia Testing；OWASP Broken Access Control 测试实践。'),
  rule('DEFAULT-VUE-TEST-002', 'XSS、URL 和 HTML 渲染变更必须包含恶意输入测试', 75, 'high', false, workflowPaths, '涉及 v-html、URL、富文本、下载预览、postMessage、路由跳转和 HTML 渲染的变更，应包含恶意 HTML、协议绕过和脱敏泄露测试样例。', ['检查测试是否覆盖 <script>、事件属性、javascript:、data:、SVG、恶意文件名和外部跳转。', '检查 sanitizer、URL 白名单和脱敏逻辑是否有负例断言。'], '安全渲染变更没有恶意样例时，容易在后续优化中重新引入 XSS、开放重定向或敏感泄露。', ['补充恶意输入用例和负例断言。', '把 sanitizer 配置、URL 白名单和脱敏策略纳入回归测试。'], 'OWASP XSS Prevention Cheat Sheet；Vue Security Guide；前端安全测试实践。'),
];

const sqlfluffRules = [
  rule('DEFAULT-SQLFLUFF-CI-001', 'SQLFluff 必须固定 dialect/templater 且迁移 SQL 不得无审阅 autofix', 60, 'medium', false, sqlfluffPaths, 'SQLFluff 用于 SQL 质量门禁时必须明确 dialect、templater 和适用目录；迁移 SQL 不得在 CI 中无人工审阅自动 fix。', ['检查 .sqlfluff、pyproject、CI 是否缺少 dialect 或在多数据库项目中使用错误方言。', '检查 sqlfluff fix 是否直接改写 migrations、oracle/mysql/postgresql/oceanbase SQL 并自动提交或放行。'], '错误方言或无审阅 autofix 可能重写 Oracle/MySQL/PostgreSQL/OceanBase SQL 语义，造成迁移脚本不可执行或业务查询变化。', ['为不同数据库目录配置明确 dialect 和 templater。', 'CI 可 lint，但迁移 SQL 的 fix 必须人工审阅 diff 并通过数据库 dry-run。'], 'SQLFluff Rules and Dialects；数据库迁移审查实践；CI 质量门禁治理。'),
];


const RULES_GUIDE = `# GitPushReview 规则编写说明

本目录用于配置提交前代码审核规则。GitPushReview 只会加载 \`.gitpushreview/agent/rules-index.md\` 中声明的规则文件，不会自动扫描所有 Markdown 文件。

## 规则编写格式

一个 Markdown 文件可以写多条规则。每条规则必须使用二级标题，格式为：

\`\`\`md
## 规则ID 中文规则标题
\`\`\`

规则 ID 建议使用稳定前缀：

- \`DEFAULT-...\`：插件内置默认规则。
- \`PROJECT-...\`：项目通用规则，例如架构分层、接口契约、数据模型。
- \`DIY-...\`：项目最高优先级规则，例如鉴权、资金、审计、生产安全红线。

标题下面必须紧跟一段 YAML 元数据：

\`\`\`yaml
score: 80
severity: high
hardBlock: false
paths:
  - backend/**/*.java
  - frontend/**/*.vue
capabilities:
  - language.java
  - frontend.vue
signalPaths:
  - backend/**/*Payment*.java
signalContent:
  - payment callback
evidencePatterns:
  - payment-callback|payment callback|检测到支付回调相关变更
allowUnknownExpansion: false
\`\`\`

正文建议固定使用这些小节，AI 会把它们作为审核依据和修复建议来源。可以用 \`gitpushreview explain <file> --json\` 查看某个文件的能力标签、候选规则、signal 命中情况和过滤原因：

- **规则说明**：这条规则要求什么。
- **检查要点**：审核时应该检查哪些信号。
- **违规风险**：违反后会造成什么业务、数据、安全或稳定性问题。
- **修复建议**：希望开发者如何整改。
- **不推荐示例**：可以放代码片段，帮助 AI 判断。
- **推荐示例**：可以放代码片段，帮助 AI 给出更准确建议。

## 字段说明

- \`score\`：规则基础分，建议 1-100。分数越高，风险越高。
- \`severity\`：严重等级，只建议填写 \`low\`、\`medium\`、\`high\`、\`critical\`。
- \`hardBlock\`：是否单条命中就强拦截。明显异常、高风险安全问题、资金问题、越权问题建议设置为 \`true\`。
- \`paths\`：规则适用文件范围。必须尽量精确，不建议使用 \`**/*\` 这种全局兜底。
- \`capabilities\`：规则适用能力域，例如 \`language.java\`、\`frontend.vue\`、\`persistence.sql\`、\`middleware.mq.kafka\`。静态层会根据文件路径、内容信号和项目画像生成能力标签。
- \`signalPaths\`：补充路由路径信号，只用于证明 unknown 文件可能适用该规则，不替代普通文件的 \`paths + capabilities\` 匹配。
- \`signalContent\`：补充路由内容信号，可以填写正则片段，例如 \`KafkaTemplate\`、\`payment callback\`、\`tenantId\`。
- \`evidencePatterns\`：静态证据提取模式，格式为 \`证据ID|正则|中文证据说明\`。命中后只作为 AI 复审线索，\`score=0\` 且不直接拦截。
- \`allowUnknownExpansion\`：当文件无法识别能力时，是否允许通过 \`signalPaths\` 或 \`signalContent\` 把该规则加入 AI 候选集。默认 \`false\`，只建议高价值项目规则或 DIY 规则打开。

## 计分机制

每条规则命中后会形成一个 finding。最终分数按规则来源的权重计算：

\`\`\`text
weightedScore = score × weight
totalScore = 所有 finding 的 weightedScore 之和
\`\`\`

默认权重在 \`.gitpushreview/agent/rules-index.md\` 中配置：

- BDR：\`weight: 1.0\`
- Default Rules：\`weight: 1.0\`
- Project Rules：\`weight: 1.5\`
- DIY Rules：\`weight: 2.0\`

拦截策略在 \`.gitpushreview/agent/policy.md\` 中配置：

- \`softBlockScore\`：总分达到该值时软拦截，开发者可以确认后继续提交。
- \`hardBlockScore\`：总分达到该值时强拦截，必须整改后才能提交。
- \`hardBlock: true\`：单条规则命中即可强拦截，不需要等待总分达到阈值。

## 提示话术和优化意见由谁维护

插件内置的命令行提示由 GitPushReview 维护，例如“审核结果”“软拦截”“强拦截”。

规则里的业务话术、检查要点和修复建议由项目维护者在 Markdown 中录入。提交时 AI 会结合本次 diff，把规则中的原则转成具体的“证据”和“修复建议”。
`;

const PROJECT_README = `# Project Rules 项目规则说明

project 目录用于维护本项目长期有效的项目规则，例如架构分层、接口契约、数据模型、发布兼容性。

这些规则默认在 \`.gitpushreview/agent/rules-index.md\` 的 \`Project Rules\` 中启用，默认权重为：

\`\`\`yaml
weight: 1.5
\`\`\`

适合写在 project 目录的规则：

- 模块依赖方向、分层边界、禁止跨层访问。
- API 字段兼容性、错误码、分页、版本策略。
- 数据模型状态流转、迁移脚本、灰度兼容。
- 团队约定的测试、发布、配置和可观测性要求。

如果新增规则文件，需要同时把文件路径加入 \`.gitpushreview/agent/rules-index.md\` 的 \`Project Rules.files\`。
`;

const DIY_README = `# DIY Rules 说明

diy 目录用于维护项目最高优先级规则。这里的规则通常来自业务红线、安全红线、资金红线、生产事故复盘和团队强约束。

这些规则默认在 \`.gitpushreview/agent/rules-index.md\` 的 \`DIY Rules\` 中启用，默认权重为：

\`\`\`yaml
weight: 2.0
hardBlockOnViolation: true
\`\`\`

适合写在 diy 目录的规则：

- 鉴权、租户隔离、水平越权、数据权限。
- 支付、退款、对账、库存、资金一致性。
- 审计日志、敏感信息脱敏、生产配置红线。
- 某个项目独有且违反后必须整改的规则。

DIY 规则权重最高。若某条规则违反后必须整改，请在规则元数据中设置：

\`\`\`yaml
hardBlock: true
\`\`\`

如果新增规则文件，需要同时把文件路径加入 \`.gitpushreview/agent/rules-index.md\` 的 \`DIY Rules.files\`。
`;

const PROJECT_ARCHITECTURE_DOC = `# 项目架构规则

## PROJECT-ARCH-001 禁止绕过应用分层直接访问下层资源

\`\`\`yaml
score: 60
severity: high
hardBlock: false
paths:
  - backend/**/*.java
  - backend/**/*.kt
  - src/**/*.java
\`\`\`

**规则说明**：
Controller、Resource、Job、Listener 等入口层不应直接访问 Mapper、DAO、Repository 或底层数据源，必须通过 Service、Domain Service 或明确的应用服务表达业务边界。

**检查要点**：
- 入口层是否直接注入 Mapper、DAO、Repository、DataSource、JdbcTemplate。
- 是否绕过已有 Service 导致鉴权、事务、审计、缓存或领域校验失效。
- 是否新增跨模块调用，破坏既有依赖方向。

**违规风险**：
绕过分层会让权限校验、事务边界和业务约束分散，后续缺陷很难被审查和测试发现。

**修复建议**：
把数据访问和业务规则收敛到 Service 或领域对象中，入口层只负责编排请求、参数校验和响应转换。

**不推荐示例**：
\`\`\`java
@RestController
class OrderController {
  @Autowired OrderMapper orderMapper;
}
\`\`\`

**推荐示例**：
\`\`\`java
@RestController
class OrderController {
  @Autowired OrderService orderService;
}
\`\`\`
`;

const PROJECT_API_CONTRACT_DOC = `# API 契约规则

## PROJECT-API-001 公共 API 变更必须保持兼容或说明迁移策略

\`\`\`yaml
score: 70
severity: high
hardBlock: false
paths:
  - backend/**/*.java
  - frontend/**/*.ts
  - frontend/**/*.vue
  - api/**/*.yaml
  - openapi/**/*.yaml
\`\`\`

**规则说明**：
公共 API 的字段、枚举、错误码、分页结构和语义变更必须保持兼容；确实需要破坏兼容时，应提供版本、默认值、迁移窗口或发布说明。

**检查要点**：
- 是否删除、重命名或改变 response/request 字段含义。
- 是否改变错误码、状态码、分页字段或枚举值语义。
- 前端、后端、移动端或外部调用方是否有兼容处理。

**违规风险**：
破坏性 API 变更会导致调用方运行时失败，线上表现通常是页面异常、数据缺失或流程中断。

**修复建议**：
保留兼容字段或新增版本化接口；在规则正文、接口文档或提交说明中写清楚迁移方式。
`;

const PROJECT_DATA_MODEL_DOC = `# 数据模型规则

## PROJECT-DATA-001 数据模型变更必须说明迁移、回滚和灰度策略

\`\`\`yaml
score: 70
severity: high
hardBlock: false
paths:
  - db/**
  - migrations/**
  - schema/**
  - **/*.sql
  - backend/**/*.java
\`\`\`

**规则说明**：
表结构、字段含义、索引、状态枚举和历史数据处理方式变更时，必须说明迁移、回滚、灰度兼容和旧数据处理策略。

**检查要点**：
- DDL 是否有对应迁移脚本和回滚方案。
- 应用代码是否兼容新旧 schema 同时存在的发布窗口。
- 历史数据、默认值、空值和唯一约束是否被考虑。

**违规风险**：
数据模型变更缺少策略会造成发布失败、数据丢失、旧版本不可用或线上数据不一致。

**修复建议**：
补充迁移脚本、回滚脚本或灰度发布说明，并为关键查询和写入路径补充回归验证。
`;

const DIY_AUTH_DOC = `# DIY 鉴权规则

## DIY-AUTH-001 禁止绕过租户边界读取或修改数据

\`\`\`yaml
score: 90
severity: critical
hardBlock: true
paths:
  - backend/**/*.java
  - backend/**/*.kt
  - frontend/**/*.vue
  - frontend/**/*.ts
\`\`\`

**规则说明**：
所有涉及用户、订单、合同、资金、文件、权限等租户数据的读取、修改、导出和缓存，都必须显式校验租户、组织或数据归属边界。

**检查要点**：
- 是否只通过 \`id\`、\`userId\`、\`orderId\` 等字段直接查询私有资源。
- 查询条件、缓存 key、导出任务和异步任务是否缺少 \`tenantId\`、\`orgId\`、\`companyId\` 或等价隔离字段。
- 是否绕过统一鉴权组件、数据权限组件或服务端归属校验。

**违规风险**：
违反该规则可能造成水平越权、跨租户数据泄露、客户数据污染或权限体系失效。

**修复建议**：
从可信上下文获取当前租户和操作者身份，在服务端强制校验资源归属，并为越权访问补充失败测试。

**不推荐示例**：
\`\`\`java
orderMapper.selectById(orderId);
\`\`\`

**推荐示例**：
\`\`\`java
orderMapper.selectByIdAndTenantId(orderId, currentTenantId);
\`\`\`
`;

const DIY_PAYMENT_DOC = `# DIY 支付规则

## DIY-PAYMENT-001 资金状态变更必须保证幂等和一致性

\`\`\`yaml
score: 95
severity: critical
hardBlock: true
paths:
  - backend/**/*.java
  - backend/**/*.kt
  - db/**
  - migrations/**
\`\`\`

**规则说明**：
支付、退款、对账、余额、积分、优惠券和库存扣减等资金或准资金路径，必须具备幂等键、状态机约束、事务边界和失败补偿策略。

**检查要点**：
- 是否存在重复回调、重复提交或并发请求导致重复扣款、重复退款、重复发券。
- 状态流转是否只能从合法前置状态进入目标状态。
- 数据库写入、消息发送和外部支付调用是否有一致性策略。

**违规风险**：
资金链路缺少幂等和一致性会造成资损、错账、重复履约或对账失败。

**修复建议**：
增加业务幂等键、唯一约束、状态机校验、事务边界和补偿任务，并补充重复请求和并发场景测试。
`;

const DIY_LOGGING_DOC = `# DIY 日志规则

## DIY-LOG-001 审计日志必须保留关键上下文且敏感字段脱敏

\`\`\`yaml
score: 70
severity: high
hardBlock: false
paths:
  - backend/**/*.java
  - backend/**/*.kt
  - frontend/**/*.ts
  - frontend/**/*.vue
\`\`\`

**规则说明**：
权限、资金、配置、数据导出、批量操作等高风险路径必须保留可追踪审计日志，同时不得输出明文密码、Token、身份证、银行卡、手机号全量等敏感信息。

**检查要点**：
- 是否删除了操作者、资源 ID、结果、失败原因、traceId 等审计上下文。
- 日志、异常、前端状态和导出文件中是否出现敏感明文。
- 是否能根据日志追踪一次高风险操作的发起人、目标资源和处理结果。

**违规风险**：
审计缺失会导致事故无法追踪；敏感明文日志会造成合规和安全风险。

**修复建议**：
保留必要审计字段，对敏感字段做脱敏、哈希或删除，并为高风险路径统一接入审计组件。
`;

export const DEFAULT_DOCS = {
  'docs/RULES.md': RULES_GUIDE,
  'docs/default/java.md': renderDoc('Java 默认审核规则', javaRules),
  'docs/default/vue.md': renderDoc('Vue 默认审核规则', vueRules),
  'docs/default/python.md': renderDoc('Python 默认审核规则', pythonRules),
  'docs/default/mysql.md': renderDoc('MySQL 默认审核规则', mysqlRules),
  'docs/default/oracle.md': renderDoc('Oracle 默认审核规则', oracleRules),
  'docs/default/postgresql.md': renderDoc('PostgreSQL 默认审核规则', postgresqlRules),
  'docs/default/oceanbase.md': renderDoc('OceanBase 默认审核规则', oceanbaseRules),
  'docs/default/redis.md': renderDoc('Redis 默认审核规则', redisRules),
  'docs/default/rabbitmq.md': renderDoc('RabbitMQ 默认审核规则', rabbitmqRules),
  'docs/default/drools.md': renderDoc('Drools 默认审核规则', droolsRules),
  'docs/default/security.md': renderDoc('跨技术栈安全默认审核规则', securityRules),
  'docs/default/workflow.md': renderDoc('工程流程默认审核规则', workflowRules),
  'docs/default/sqlfluff.md': renderDoc('SQLFluff 默认审核规则', sqlfluffRules),
  'docs/project/README.md': PROJECT_README,
  'docs/project/architecture.md': PROJECT_ARCHITECTURE_DOC,
  'docs/project/api-contract.md': PROJECT_API_CONTRACT_DOC,
  'docs/project/data-model.md': PROJECT_DATA_MODEL_DOC,
  'docs/diy/README.md': DIY_README,
  'docs/diy/auth.md': DIY_AUTH_DOC,
  'docs/diy/payment.md': DIY_PAYMENT_DOC,
  'docs/diy/logging.md': DIY_LOGGING_DOC,
};
