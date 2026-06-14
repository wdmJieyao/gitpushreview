export const REVIEW_AGENT = `# Review Agent

Review only staged changes. Use BDR, default rules, project rules, and DIY rules in priority order. Return findings with evidence tied to the diff.
`;

export const POLICY = `# Review Policy

\`\`\`yaml
softBlockScore: 60
hardBlockScore: 90
ciSoftBlockBehavior: fail
\`\`\`
`;

export const RULES_INDEX = `# Rule Index

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
  - ../docs/default/mysql.md
  - ../docs/default/oracle.md
  - ../docs/default/drools.md
  - ../docs/default/security.md
  - ../docs/default/workflow.md
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
const springConfigPaths = ['**/*.java', 'src/main/resources/**/*.{yml,yaml,properties}', 'pom.xml', 'build.gradle*'];
const vuePaths = ['**/*.vue', '**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];
const mysqlPaths = [
  '**/*.sql',
  'migrations/**',
  'db/**',
  'schema/**',
  '**/*Mapper*.xml',
  '**/*Mapper*.java',
  '**/*Repository*.java',
  '**/*DAO*.java',
  '**/*Dao*.java',
  '**/*Repository*',
  '**/*DAO*',
];
const oraclePaths = [...mysqlPaths, '**/*.pks', '**/*.pkb'];
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
  '**/*.vue',
  '**/*.ts',
  '**/*.tsx',
  '**/*.js',
  '**/*.jsx',
  '**/*.html',
  '**/*.sql',
  '**/*.drl',
  'src/main/resources/**/*.{yml,yaml,properties}',
  '**/*.json',
  '**/*.conf',
  '**/*.sh',
  'Dockerfile',
  'docker-compose*.yml',
  '.env*',
];
const workflowPaths = [
  '**/*.java',
  '**/*.vue',
  '**/*.ts',
  '**/*.js',
  '**/*.sql',
  '**/*.drl',
  'package.json',
  'package-lock.json',
  'pom.xml',
  'build.gradle*',
  'migrations/**',
  'src/test/**',
  'test/**',
];

function renderList(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

function renderRule(rule) {
  const paths = rule.paths.map((item) => `  - "${item}"`).join('\n');
  return `## ${rule.id} ${rule.title}

\`\`\`yaml
score: ${rule.score}
severity: ${rule.severity}
hardBlock: ${rule.hardBlock}
paths:
${paths}
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
  rule('DEFAULT-JAVA-SPR-001', '禁止明确删除或绕过关键输入校验', 85, 'high', true, springWebPaths, '不得明确移除认证、授权、持久化、金额、权限或数据破坏相关的 Bean Validation、手动校验和业务约束。', ['检查 @Valid、@Validated、NotNull、Size、Pattern、自定义 Validator 是否被删除。', '检查金额、状态流转、租户、权限和危险操作是否绕过校验。'], '关键校验被移除会导致脏数据入库、越权参数、数据破坏或业务约束失效。', ['恢复关键校验并把校验放在入口和领域边界。', '为被绕过的边界补充失败用例。'], 'Spring Validation；Bean Validation；阿里巴巴 Java 开发手册。'),
  rule('DEFAULT-JAVA-SPR-002', '禁止破坏事务一致性边界', 90, 'critical', true, springServicePaths, '多表、多资源或多步骤写入必须保持清晰事务边界，不得让关键写入半成功。', ['检查 @Transactional 是否被删除、传播级别是否改变、异常是否被吞掉。', '检查资金、库存、订单、权限、规则结果落库等路径是否保持原子性。'], '事务边界破坏会造成资金、库存、状态或审计数据不一致。', ['恢复事务注解或显式事务控制。', '异常应回滚、重新抛出或进入补偿流程。'], 'Spring Transaction 文档；MySQL InnoDB 事务；Oracle COMMIT/ROLLBACK。'),
  rule('DEFAULT-JAVA-SPR-003', '@Transactional 方法避免内部自调用导致事务失效', 60, 'high', false, springServicePaths, 'Spring AOP 代理下，同类内部调用事务方法通常不会触发事务增强。', ['检查 this.method() 调用被 @Transactional 标注的方法。', '检查事务入口是否通过代理、独立 service 或 TransactionTemplate 触发。'], '事务未生效会导致异常后提交、锁范围异常或数据部分更新。', ['把事务方法移到独立 Bean，或通过代理入口调用。', '必要时使用 TransactionTemplate 表达边界。'], 'Spring AOP；Spring Transaction rollback rules。'),
  rule('DEFAULT-JAVA-SPR-004', 'checked exception 与事务回滚策略必须明确', 60, 'high', false, springServicePaths, 'Spring 默认对 unchecked exception 回滚；checked exception 需要明确 rollbackFor 或显式处理。', ['检查事务方法是否捕获或抛出 checked exception。', '检查 rollbackFor/noRollbackFor 是否和业务语义一致。'], '异常类型与回滚策略不匹配会导致错误提交或过度回滚。', ['为 checked exception 配置 rollbackFor。', '在方法契约中说明哪些异常会提交、回滚或补偿。'], 'Spring Transaction rollback rules；阿里巴巴 Java 开发手册异常规约。'),
  rule('DEFAULT-JAVA-JVM-001', '禁止在请求路径或用户可触发路径新增无界线程、无界队列或无背压异步任务', 85, 'high', true, javaPaths, '不得在生产请求路径中创建无界线程、无界队列、无限异步提交或缺少关闭策略的执行器。', ['检查 Executors.newCachedThreadPool、newFixedThreadPool 默认无界队列和 new Thread 循环创建。', '检查异步入口是否有容量、拒绝策略、超时、关闭和监控。'], '无界资源会导致 OOM、线程耗尽、级联超时或服务雪崩。', ['使用显式 ThreadPoolExecutor 参数和有界队列。', '为用户可触发任务增加限流、背压和拒绝策略。'], 'JDK ThreadPoolExecutor；阿里巴巴 P3C 线程池规约。'),
  rule('DEFAULT-JAVA-JVM-002', 'IO、流、连接等资源必须确定性关闭', 60, 'high', false, javaPaths, '文件、网络、数据库、流、锁和客户端连接必须有确定性释放路径。', ['检查 InputStream、OutputStream、Connection、Statement、ResultSet、HttpClient response 是否关闭。', '检查异常路径是否也能释放资源。'], '资源泄露会导致连接池耗尽、文件句柄耗尽或长时间锁定。', ['使用 try-with-resources。', '把资源生命周期交给连接池或框架托管并确认关闭语义。'], 'Oracle try-with-resources；阿里巴巴 Java 开发手册。'),
  rule('DEFAULT-JAVA-JVM-003', '阻塞调用必须设置超时和失败处理', 60, 'high', false, javaPaths, 'HTTP、RPC、数据库、缓存、文件和外部命令等阻塞调用必须有超时、取消或降级策略。', ['检查新增客户端是否设置 connect/read/write timeout。', '检查失败是否会释放线程、返回可理解错误或进入重试/降级。'], '缺少超时会耗尽线程池并放大外部依赖故障。', ['设置合理超时和重试上限。', '对用户请求链路增加熔断、降级或失败返回。'], 'Spring HTTP client 文档；JDK Process API；OWASP API4 Resource Consumption。'),
  rule('DEFAULT-JAVA-P3C-001', '集合转 Map 必须处理重复 key', 60, 'high', false, javaPaths, '使用 stream collect(toMap) 或手写映射时必须明确重复 key 的处理方式。', ['检查 Collectors.toMap 是否提供 merge function。', '检查重复 key 是报错、保留旧值、保留新值还是聚合列表。'], '重复 key 会导致运行时异常或静默覆盖业务数据。', ['添加 merge function 并说明业务语义。', '必要时改为 groupingBy 或显式校验重复数据。'], '阿里巴巴 Java 开发手册集合处理；JDK Collectors。'),
  rule('DEFAULT-JAVA-P3C-002', 'BigDecimal 禁止使用 double 构造', 60, 'high', false, javaPaths, '金额、费率和精确小数不得通过 new BigDecimal(double) 构造。', ['检查 new BigDecimal(0.1) 等浮点构造。', '检查金额字段是否从字符串、整数分或 BigDecimal.valueOf 构造。'], '浮点二进制误差会造成账务、计费或对账偏差。', ['使用 BigDecimal.valueOf、字符串构造或最小货币单位整数。', '为金额计算补充边界测试。'], '阿里巴巴 Java 开发手册；JDK BigDecimal API。'),
  rule('DEFAULT-JAVA-P3C-003', '覆写 equals 必须同时覆写 hashCode', 55, 'high', false, javaPaths, '类覆写 equals 后必须保持 hashCode 契约一致。', ['检查实体、值对象、DTO 是否只覆写 equals。', '检查 Lombok、自生成方法和手写方法是否覆盖一致字段。'], 'HashMap、HashSet 和缓存键会出现查找失败或重复数据。', ['同时覆写 hashCode。', '优先使用 IDE/Lombok 生成并补充集合行为测试。'], 'Java Object 契约；阿里巴巴 Java 开发手册。'),
  rule('DEFAULT-JAVA-P3C-004', 'SimpleDateFormat 不得作为共享静态实例', 60, 'high', false, javaPaths, 'SimpleDateFormat 非线程安全，不得在多线程环境作为 static 共享实例。', ['检查 static SimpleDateFormat 和单例共享格式化器。', '检查线程池、Web 请求和并发任务中是否共享该实例。'], '并发格式化或解析会产生错误日期、异常或脏数据。', ['改用 DateTimeFormatter。', '如必须使用旧 API，使用局部变量或 ThreadLocal 并确保清理。'], '阿里巴巴 P3C 并发规约；JDK DateTimeFormatter。'),
  rule('DEFAULT-JAVA-MAINT-001', '避免过大方法、过深嵌套和重复复杂逻辑', 35, 'medium', false, javaPaths, '新增代码应保持方法职责清晰，避免复杂分支、重复逻辑和难以审查的大段过程式代码。', ['检查单个方法是否承担多种业务职责。', '检查嵌套 if/for/try 是否影响理解和测试。'], '复杂代码会提高缺陷概率，让安全和数据一致性问题更难被审查发现。', ['提取命名清晰的小方法、领域对象或策略。', '为复杂分支补充行为测试。'], 'Fowler Refactoring；BDR bad smells；阿里巴巴 Java 开发手册。'),
];

const vueRules = [
  rule('DEFAULT-VUE-SEC-001', '禁止把不可信内容作为 Vue 模板编译', 95, 'critical', true, vuePaths, '不得把用户、接口、路由、存储或 CMS 输入作为 Vue template 或运行时模板编译。', ['检查 template、render、compile、SSR 模板是否拼入外部输入。', '检查动态组件或富文本方案是否绕过 Vue 安全模型。'], '不可信模板等同执行 JavaScript，可能导致 XSS、账号接管或数据泄露。', ['模板必须来自可信源码。', '用户内容只能作为数据渲染并进行转义或净化。'], 'Vue Security Guide；OWASP XSS Prevention。'),
  rule('DEFAULT-VUE-SEC-002', '禁止未净化的用户或接口 HTML 进入 v-html、innerHTML', 90, 'critical', true, vuePaths, '来自用户、接口、路由或本地存储的 HTML 不得未经净化进入 v-html、innerHTML 或类似 DOM sink。', ['检查 v-html、innerHTML、outerHTML、insertAdjacentHTML 的数据来源。', '检查是否使用可信 sanitizer 并限制允许标签和属性。'], '未净化 HTML 会造成 XSS、会话窃取和敏感数据泄露。', ['改为普通文本渲染。', '确需富文本时使用经过配置的 sanitizer 并保留服务端校验。'], 'Vue Security Guide；OWASP XSS Prevention Cheat Sheet。'),
  rule('DEFAULT-VUE-SEC-003', '动态 URL、CSS、事件属性必须经过白名单或净化', 80, 'high', false, vuePaths, '绑定到 href、src、style、事件或可执行属性的数据必须经过白名单和协议限制。', ['检查 :href、:src、:style、动态事件名和路由跳转目标。', '检查 javascript:、data:、外部域名和用户样式是否被限制。'], '恶意 URL 或样式可能造成 XSS、钓鱼跳转、点击劫持或内容欺骗。', ['使用固定枚举、URL 解析和协议白名单。', '后端也要对可保存 URL 做校验。'], 'Vue Security Guide；OWASP HTML5 Security Cheat Sheet。'),
  rule('DEFAULT-VUE-SEC-004', '禁止前端持久化敏感 Token、密钥或会话秘密', 95, 'critical', true, vuePaths, '不得把长期 Token、密钥、会话秘密或敏感凭据写入 localStorage、IndexedDB、源码常量或可导出的前端状态。', ['检查 localStorage、sessionStorage、IndexedDB、Pinia/Vuex 持久化和环境变量。', '检查 Token 是否可被任意脚本读取。'], '一旦发生 XSS，持久化秘密会被直接窃取并复用。', ['优先使用 HttpOnly、Secure、SameSite Cookie 或短期令牌。', '清理前端持久化凭据并轮换泄露令牌。'], 'OWASP HTML5 Security；OWASP Secrets Management。'),
  rule('DEFAULT-VUE-SEC-005', '外链 _blank 必须配置 rel noopener noreferrer', 45, 'medium', false, ['**/*.vue'], '新窗口打开外部链接时应阻断 opener 反向控制。', ['检查 target="_blank" 是否缺少 rel。', '检查封装链接组件是否统一处理外链。'], '缺少 rel 可能导致 tabnabbing 或外部页面控制原页面跳转。', ['添加 rel="noopener noreferrer"。', '封装统一的安全外链组件。'], 'Vue Security Guide；MDN rel noopener。'),
  rule('DEFAULT-VUE-CONTRACT-001', 'props 必须声明类型、必填项、默认值或 validator', 55, 'medium', false, ['**/*.vue', '**/*.ts', '**/*.tsx'], '组件 props 应表达清晰契约，避免隐式依赖和运行时猜测。', ['检查 props 是否缺少 type、required、default 或 validator。', '检查复杂对象是否声明结构和默认值。'], '组件契约不清会造成状态错乱、运行时错误和回归难定位。', ['补充 props 类型和默认值。', '对关键枚举使用 validator 或 TypeScript 类型。'], 'Vue Style Guide；Vue Props 文档。'),
  rule('DEFAULT-VUE-CONTRACT-002', '禁止直接修改 props', 65, 'high', false, ['**/*.vue', '**/*.ts', '**/*.tsx'], '子组件不得直接修改父组件传入的 props 或其可变嵌套状态。', ['检查 props.foo =、props.list.push、解构后回写等模式。', '检查是否通过 emit 或本地副本表达变更。'], '直接修改 props 会破坏单向数据流，导致父子状态不一致。', ['使用 emit 请求父组件更新。', '需要本地编辑时复制为本地 state。'], 'Vue Style Guide；Vue Component Props。'),
  rule('DEFAULT-VUE-CONTRACT-003', 'Vue 3 组件事件必须通过 emits 声明', 45, 'medium', false, ['**/*.vue', '**/*.ts', '**/*.tsx'], 'Vue 3 组件应声明 emits 和事件负载，保持组件 API 清晰。', ['检查 defineEmits 或 emits 选项是否缺失。', '检查事件名和 payload 是否有类型或校验。'], '事件契约不清会导致父组件监听错误和迁移兼容问题。', ['补充 emits 声明。', '用 TypeScript 类型或运行时校验表达 payload。'], 'Vue Component Events；Vue Style Guide。'),
  rule('DEFAULT-VUE-PERF-001', 'v-for 必须使用稳定且唯一的 key', 60, 'high', false, ['**/*.vue'], '列表渲染必须使用业务稳定唯一 key，不得使用随机值或易变 index。', ['检查 v-for 是否缺少 key。', '检查 key 是否使用 index、Math.random 或非唯一字段。'], '不稳定 key 会造成输入状态错位、动画异常和组件复用错误。', ['使用后端 ID 或业务唯一字段。', '无唯一字段时先补充数据建模。'], 'Vue Style Guide；Vue List Rendering。'),
  rule('DEFAULT-VUE-PERF-002', '避免在同一元素同时使用 v-if 和 v-for', 45, 'medium', false, ['**/*.vue'], '同一元素混用 v-if 和 v-for 会造成优先级困惑、性能浪费或访问不到循环变量。', ['检查模板中同一标签同时出现 v-if 和 v-for。', '检查过滤逻辑是否可以前置为 computed。'], '混用会造成渲染结果不稳定、性能下降或迁移问题。', ['把过滤结果放到 computed。', '用外层 template 或子组件拆分条件。'], 'Vue Style Guide；Vue Conditional Rendering。'),
  rule('DEFAULT-VUE-PERF-003', 'computed 不得包含副作用或异步逻辑', 60, 'high', false, vuePaths, 'computed 应保持同步、纯函数和可缓存，不应发请求、写状态或执行副作用。', ['检查 computed 内是否调用接口、修改 ref/reactive 或触发路由。', '检查异步逻辑是否应迁移到 watch 或显式 action。'], '副作用 computed 会导致循环更新、缓存失效和状态难以预测。', ['把副作用移入 watch、事件处理或 composable action。', 'computed 只返回派生值。'], 'Vue Computed 文档；Vue Reactivity。'),
  rule('DEFAULT-VUE-PERF-004', '避免深度 watch 大对象或在模板中执行高成本计算', 45, 'medium', false, vuePaths, '大对象 deep watch、模板内复杂过滤排序和每次 render 的高成本计算应受控。', ['检查 deep: true 是否作用于大对象。', '检查模板是否直接执行 filter/sort/reduce 或复杂函数。'], '高成本响应式遍历会造成输入卡顿和首屏性能下降。', ['缩小 watch 范围。', '把昂贵计算缓存到 computed 或服务端。'], 'Vue Performance Guide；Vue Watchers。'),
  rule('DEFAULT-VUE-ASYNC-001', '组件请求必须处理取消、过期响应和卸载后的状态写入', 60, 'high', false, vuePaths, 'watcher、组件和 composable 中的异步请求必须处理竞态、取消和组件卸载。', ['检查快速切换参数时旧响应是否可能覆盖新状态。', '检查 onUnmounted、onWatcherCleanup 或 AbortController 是否被使用。'], '过期响应会覆盖新数据，卸载后写状态会造成警告或内存泄露。', ['使用 AbortController 或请求序列号。', '在卸载和 watcher cleanup 中取消请求。'], 'Vue Watchers；MDN AbortController。'),
  rule('DEFAULT-VUE-ASYNC-002', 'fetch/axios 必须处理失败、loading 复位和用户可理解错误状态', 55, 'high', false, vuePaths, '前端请求必须处理网络错误、HTTP 非成功状态和 finally 清理。', ['检查 catch、response.ok、axios error 和 loading finally。', '检查错误是否反馈给用户或上层流程。'], '吞错会造成假成功、无限 loading 或数据不一致。', ['补充错误处理和 finally。', '为关键流程添加重试或用户可理解提示。'], 'MDN Fetch；Axios Error Handling；Vue Guide。'),
  rule('DEFAULT-VUE-TS-001', '避免新增 any、@ts-ignore 和不必要的非空断言', 45, 'medium', false, ['**/*.vue', '**/*.ts', '**/*.tsx'], '新增类型逃逸必须有明确理由，不得用 any 或 @ts-ignore 掩盖组件和接口契约问题。', ['检查 any、as any、@ts-ignore、! 非空断言。', '检查接口响应和 props 是否可用类型建模。'], '类型逃逸会把可发现错误推迟到运行时。', ['补充真实类型、泛型或类型守卫。', '确需忽略时写明原因和移除条件。'], 'TypeScript noImplicitAny；typescript-eslint no-explicit-any。'),
];

const mysqlRules = [
  rule('DEFAULT-MYSQL-SEC-001', '禁止拼接用户输入生成 SQL', 95, 'critical', true, mysqlPaths, 'MySQL 查询、更新和迁移脚本不得把用户输入直接拼接进 SQL。', ['检查 Java 注解 SQL、Mapper XML、Repository 和脚本中的字符串拼接。', '检查 where/order/limit 参数是否绑定或白名单。'], 'SQL 注入会造成越权读取、批量修改或删除数据。', ['使用 prepared statement 或 MyBatis #{}。', '动态标识符通过白名单枚举映射。'], 'OWASP SQL Injection；CWE-89；MySQL prepared statements。'),
  rule('DEFAULT-MYSQL-SEC-002', '动态表名、列名、排序字段必须使用白名单映射', 90, 'critical', true, mysqlPaths, '表名、列名、排序方向等 SQL 标识符不能依赖参数绑定，必须通过白名单映射。', ['检查 `${}`、ORDER BY 拼接和动态表路由。', '检查输入是否只允许固定枚举值。'], '标识符注入会绕过参数化保护并造成越权查询或数据破坏。', ['把外部值映射到内部固定列名。', '拒绝不在白名单内的排序和表名。'], 'OWASP SQL Injection；MySQL prepared statements。'),
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
  rule('DEFAULT-MYSQL-TYPE-001', '金额和精确数值禁止使用浮点类型', 85, 'high', true, mysqlPaths, '金额、数量、费率和账务字段不得使用 FLOAT、DOUBLE 等浮点类型。', ['检查 DDL、Entity 和 SQL 中的金额字段类型。', '检查新增 DOUBLE 是否用于精确业务值。'], '浮点误差会造成账务、计费、库存和对账错误。', ['使用 DECIMAL/NUMERIC 并明确精度 scale。', 'Java 侧使用 BigDecimal 或最小单位整数。'], 'MySQL Fixed-Point Types；阿里巴巴数据库规约。'),
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
  rule('DEFAULT-ORACLE-TYPE-001', '金额、数量和精确小数必须使用合适的 NUMBER(p,s)', 85, 'high', true, oraclePaths, 'Oracle 精确业务数值必须明确 NUMBER 的 precision 和 scale。', ['检查金额、数量、税率、汇率字段类型。', '检查是否缺少 p/s 或使用不合适浮点语义。'], '精度设计错误会造成账务、库存和报表偏差。', ['使用 NUMBER(p,s) 并和 Java BigDecimal 对齐。', '为边界精度补充迁移验证。'], 'Oracle Data Types；阿里巴巴数据库规约。'),
  rule('DEFAULT-ORACLE-COMPAT-001', '共享 SQL 禁止混用 Oracle 与 MySQL 方言特性', 65, 'high', false, oraclePaths, '跨库共享代码不得混用 LIMIT、ROWNUM、AUTO_INCREMENT、序列、类型和锁语义。', ['检查同一 Mapper 或共享 SQL 是否混合两种方言。', '检查分页、DDL、日期函数和自增策略。'], '方言混用会导致运行时 SQL 错误或迁移失败。', ['按数据库拆分 SQL 方言。', '用适配层或迁移工具管理差异。'], 'Oracle SELECT；MySQL LIMIT；Oracle Data Types；MySQL Atomic DDL。'),
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
];

export const DEFAULT_DOCS = {
  'docs/default/java.md': renderDoc('Java 默认审核规则', javaRules),
  'docs/default/vue.md': renderDoc('Vue 默认审核规则', vueRules),
  'docs/default/mysql.md': renderDoc('MySQL 默认审核规则', mysqlRules),
  'docs/default/oracle.md': renderDoc('Oracle 默认审核规则', oracleRules),
  'docs/default/drools.md': renderDoc('Drools 默认审核规则', droolsRules),
  'docs/default/security.md': renderDoc('跨技术栈安全默认审核规则', securityRules),
  'docs/default/workflow.md': renderDoc('工程流程默认审核规则', workflowRules),
  'docs/project/architecture.md': '# 项目架构规则\n\n在这里补充本项目的架构分层、模块边界和依赖方向规则。\n',
  'docs/project/api-contract.md': '# API 契约规则\n\n在这里补充本项目的接口兼容性、字段命名、错误码和版本策略。\n',
  'docs/project/data-model.md': '# 数据模型规则\n\n在这里补充本项目的数据模型、状态流转、迁移和一致性规则。\n',
  'docs/diy/auth.md': '# DIY 鉴权规则\n\n在这里补充本项目最高优先级的鉴权、租户和权限规则。\n',
  'docs/diy/payment.md': '# DIY 支付规则\n\n在这里补充本项目最高优先级的资金、支付、退款和对账规则。\n',
  'docs/diy/logging.md': '# DIY 日志规则\n\n在这里补充本项目最高优先级的日志、审计和脱敏规则。\n',
};
