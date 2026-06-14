import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_DOCS } from '../src/templates.js';
import { parseMarkdownRules } from '../src/rules/markdown.js';

const demoSamples = [
  {
    name: 'Java controller removes authorization and validation checks',
    file: 'src/main/java/com/acme/user/UserController.java',
    snippet: `
      @PostMapping("/users/{id}/role")
      public void updateRole(@PathVariable Long id, @RequestBody RoleRequest request) {
        userService.updateRole(id, request.role());
      }
    `,
    expectedRules: ['DEFAULT-JAVA-SEC-004', 'DEFAULT-JAVA-SPR-001', 'DEFAULT-SEC-002'],
  },
  {
    name: 'MyBatis mapper builds SQL from user input',
    file: 'src/main/java/com/acme/user/UserMapper.java',
    snippet: `
      @Select("select * from user where name = '" + name + "'")
      List<User> search(String name);
    `,
    expectedRules: ['DEFAULT-MYSQL-SEC-001', 'DEFAULT-MYSQL-SEC-002'],
  },
  {
    name: 'Spring Boot exposes actuator and disables csrf',
    file: 'src/main/resources/application.yml',
    snippet: `
      management.endpoints.web.exposure.include: "*"
      security.csrf.enabled: false
    `,
    expectedRules: ['DEFAULT-JAVA-SPR-005', 'DEFAULT-JAVA-SPR-011'],
  },
  {
    name: 'Spring service calls external url inside transaction',
    file: 'src/main/java/com/acme/order/OrderService.java',
    snippet: `
      @Transactional
      public void notify(String callbackUrl) {
        restTemplate.postForObject(callbackUrl, body, Void.class);
        mapper.updateStatus(id, "SENT");
      }
    `,
    expectedRules: ['DEFAULT-JAVA-SPR-008', 'DEFAULT-JAVA-SPR-012'],
  },
  {
    name: 'MyBatis mapper uses raw substitution and large foreach',
    file: 'src/main/resources/mapper/UserMapper.xml',
    snippet: `
      select * from user order by \${column}
      <foreach collection="ids" item="id" open="(" separator="," close=")">#{id}</foreach>
    `,
    expectedRules: ['DEFAULT-JAVA-MYBATIS-001', 'DEFAULT-JAVA-MYBATIS-002'],
  },
  {
    name: 'Java utility blindly copies request fields and uses unbounded cache',
    file: 'src/main/java/com/acme/user/UserConvertor.java',
    snippet: `
      BeanUtils.copyProperties(request, entity);
      CacheBuilder.newBuilder().build();
    `,
    expectedRules: ['DEFAULT-JAVA-LIB-001', 'DEFAULT-JAVA-LIB-003'],
  },
  {
    name: 'Spring configuration properties miss validation for risky defaults',
    file: 'src/main/java/com/acme/config/PaymentProperties.java',
    snippet: `
      @ConfigurationProperties(prefix = "payment")
      public class PaymentProperties {
        private String callbackUrl;
        private Integer timeoutMs;
      }
    `,
    expectedRules: ['DEFAULT-JAVA-SPR-009'],
  },
  {
    name: 'MyBatis Spring configuration binds mapper and transaction manager to different datasources',
    file: 'src/main/java/com/acme/config/MyBatisConfig.java',
    snippet: `
      sqlSessionFactory.setDataSource(orderDataSource);
      return new DataSourceTransactionManager(userDataSource);
    `,
    expectedRules: ['DEFAULT-JAVA-MYBATIS-005'],
  },
  {
    name: 'Spring transaction catches checked exception without rollback policy',
    file: 'src/main/java/com/acme/order/OrderService.java',
    snippet: `
      @Transactional
      public void importOrder() throws IOException {
        try {
          orderMapper.insert(order);
        } catch (IOException ex) {
          log.warn("ignore", ex);
        }
      }
    `,
    expectedRules: ['DEFAULT-JAVA-SPR-004'],
  },
  {
    name: 'ThreadLocal context is set without finally cleanup',
    file: 'src/main/java/com/acme/security/TenantContext.java',
    snippet: `
      private static final ThreadLocal<String> TENANT = new ThreadLocal<>();
      public static void bind(String tenantId) {
        TENANT.set(tenantId);
      }
    `,
    expectedRules: ['DEFAULT-JAVA-LIB-005'],
  },
  {
    name: 'BigDecimal equality and division omit business-safe comparison and rounding',
    file: 'src/main/java/com/acme/billing/BillingService.java',
    snippet: `
      if (amount.equals(BigDecimal.ZERO)) {
        return total.divide(count);
      }
    `,
    expectedRules: ['DEFAULT-JAVA-P3C-006', 'DEFAULT-JAVA-P3C-007'],
  },
  {
    name: 'Java code keeps using deprecated and internal APIs',
    file: 'src/main/java/com/acme/legacy/LegacyAdapter.java',
    snippet: `
      @SuppressWarnings("deprecation")
      public void call() {
        sun.misc.Unsafe unsafe = getUnsafe();
        legacyDeprecatedClient.execute();
      }
    `,
    expectedRules: ['DEFAULT-JAVA-P3C-008'],
  },
  {
    name: 'JSON parser enables dangerous polymorphic typing and has no parser limits',
    file: 'src/main/java/com/acme/api/JsonConfig.java',
    snippet: `
      objectMapper.enableDefaultTyping();
      objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    `,
    expectedRules: ['DEFAULT-JAVA-LIB-002', 'DEFAULT-JAVA-LIB-006'],
  },
  {
    name: 'Java archive extractor trusts entry names and does not cap extracted size',
    file: 'src/main/java/com/acme/file/ArchiveImportService.java',
    snippet: `
      ZipEntry entry = zip.getNextEntry();
      Files.copy(zip, target.resolve(entry.getName()));
    `,
    expectedRules: ['DEFAULT-JAVA-LIB-007', 'DEFAULT-JAVA-SEC-008'],
  },
  {
    name: 'Spring CORS allows wildcard origins with credentials',
    file: 'src/main/java/com/acme/config/WebCorsConfig.java',
    snippet: `
      registry.addMapping("/api/**").allowedOrigins("*").allowCredentials(true);
    `,
    expectedRules: ['DEFAULT-JAVA-SPR-013', 'DEFAULT-SEC-009'],
  },
  {
    name: 'Java logging configuration enables unsafe lookup from request data',
    file: 'src/main/java/com/acme/audit/AuditLogger.java',
    snippet: `
      log.info("login user={}", request.getHeader("X-User"));
      // pattern enables lookup substitution for untrusted values
    `,
    expectedRules: ['DEFAULT-JAVA-JVM-004'],
  },
  {
    name: 'Vue component renders API HTML directly',
    file: 'src/views/Profile.vue',
    snippet: `
      <template><section v-html="profile.bioHtml"></section></template>
    `,
    expectedRules: ['DEFAULT-VUE-SEC-002', 'DEFAULT-SEC-004'],
  },
  {
    name: 'Vue request relies on withCredentials and frontend route role only',
    file: 'src/views/admin/UserAdmin.vue',
    snippet: `
      axios.get("/api/admin/users", { withCredentials: true });
      if (route.meta.role === "admin") showDelete.value = true;
    `,
    expectedRules: ['DEFAULT-VUE-SEC-008', 'DEFAULT-VUE-AUTH-001'],
  },
  {
    name: 'Vue blob preview opens untrusted file and never revokes object url',
    file: 'src/views/file/FilePreview.vue',
    snippet: `
      const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
      window.open(url);
    `,
    expectedRules: ['DEFAULT-VUE-SEC-009'],
  },
  {
    name: 'Python endpoint executes user controlled shell command',
    file: 'src/app/jobs/export_report.py',
    snippet: `
      cmd = request.args["cmd"]
      subprocess.run(cmd, shell=True)
    `,
    expectedRules: ['DEFAULT-PYTHON-SEC-002'],
  },
  {
    name: 'Python loads untrusted yaml and disables TLS verification',
    file: 'src/app/imports/config_loader.py',
    snippet: `
      config = yaml.load(request.files["file"].read())
      requests.get(config["callback"], verify=False)
    `,
    expectedRules: ['DEFAULT-PYTHON-SEC-006', 'DEFAULT-PYTHON-SEC-007'],
  },
  {
    name: 'Python URL fetch and tar extraction miss SSRF and archive guards',
    file: 'src/app/files/fetch_extract.py',
    snippet: `
      data = requests.get(request.args["url"]).content
      tarfile.open(fileobj=BytesIO(data)).extractall(upload_dir)
    `,
    expectedRules: ['DEFAULT-PYTHON-SEC-008', 'DEFAULT-PYTHON-ARCHIVE-001'],
  },
  {
    name: 'Python production app starts with debug and unbounded upload parsing',
    file: 'src/app/api/server.py',
    snippet: `
      app.run(host="0.0.0.0", debug=True)
      rows = pandas.read_excel(request.files["sheet"])
    `,
    expectedRules: ['DEFAULT-PYTHON-WEB-001', 'DEFAULT-PYTHON-RESOURCE-001'],
  },
  {
    name: 'Oracle package executes dynamic SQL',
    file: 'db/oracle/packages/user_admin.pkb',
    snippet: `
      execute immediate 'delete from users where name = ' || p_name;
    `,
    expectedRules: ['DEFAULT-ORACLE-SEC-001', 'DEFAULT-ORACLE-DML-001'],
  },
  {
    name: 'Drools rule mutates fact without update',
    file: 'rules/pricing/discount.drl',
    snippet: `
      rule "discount"
      when
        $order : Order()
      then
        $order.setDiscount(10);
      end
    `,
    expectedRules: ['DEFAULT-DROOLS-FACT-001', 'DEFAULT-DROOLS-FLOW-002'],
  },
  {
    name: 'Dockerfile contains a secret-looking environment variable',
    file: 'Dockerfile',
    snippet: 'ENV API_TOKEN=real-token-value',
    expectedRules: ['DEFAULT-SEC-001'],
  },
  {
    name: 'Nginx CORS and cookie security headers are weakened',
    file: 'nginx/conf.d/app.conf',
    snippet: `
      add_header Access-Control-Allow-Origin *;
      add_header Access-Control-Allow-Credentials true;
      add_header Set-Cookie "sid=$sid; SameSite=None";
    `,
    expectedRules: ['DEFAULT-SEC-009', 'DEFAULT-SEC-010'],
  },
  {
    name: 'Public production configuration exposes debug management surfaces',
    file: 'k8s/prod/app.yaml',
    snippet: `
      SPRING_PROFILES_ACTIVE: prod
      MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE: "*"
      H2_CONSOLE_ENABLED: "true"
    `,
    expectedRules: ['DEFAULT-SEC-013', 'DEFAULT-WORKFLOW-009'],
  },
  {
    name: 'Package change adds install script and weakens supply chain lock discipline',
    file: 'package.json',
    snippet: `
      { "scripts": { "postinstall": "curl https://example.com/install.sh | sh" },
        "dependencies": { "left-pad": "github:user/repo" } }
    `,
    expectedRules: ['DEFAULT-SEC-012', 'DEFAULT-WORKFLOW-007'],
  },
  {
    name: 'Maven build file uses a drifting dependency version without lock discipline',
    file: 'pom.xml',
    snippet: `
      <dependency>
        <groupId>org.example</groupId>
        <artifactId>unsafe-lib</artifactId>
        <version>LATEST</version>
      </dependency>
    `,
    expectedRules: ['DEFAULT-SEC-012', 'DEFAULT-WORKFLOW-007'],
  },
  {
    name: 'Python packaging files add an unpinned dependency and editable install',
    file: 'pyproject.toml',
    snippet: `
      [project]
      dependencies = ["requests", "pkg @ git+https://example.com/repo.git"]
    `,
    expectedRules: ['DEFAULT-SEC-012', 'DEFAULT-WORKFLOW-007'],
  },
  {
    name: 'Search export endpoint lacks rate and result limits',
    file: 'src/main/java/com/acme/report/ExportController.java',
    snippet: `
      @GetMapping("/export")
      public List<Row> export(String q) { return reportService.searchAll(q); }
    `,
    expectedRules: ['DEFAULT-SEC-011'],
  },
  {
    name: 'GitHub Actions bypasses tests and security scan',
    file: '.github/workflows/ci.yml',
    snippet: `
      - run: npm test -- --passWithNoTests || true
      - run: mvn test -DskipTests
      continue-on-error: true
    `,
    expectedRules: ['DEFAULT-WORKFLOW-012'],
  },
  {
    name: 'High risk rollout misses feature flag rollback and observability',
    file: 'deploy/prod/order-migration.yaml',
    snippet: `
      change: migrate all orders immediately
      rollback: none
      metrics: none
    `,
    expectedRules: ['DEFAULT-WORKFLOW-010'],
  },
  {
    name: 'Build artifact is committed as a generated package',
    file: 'dist/app/gitpushreview-0.1.0.tgz',
    snippet: 'binary package archive generated by npm pack',
    expectedRules: ['DEFAULT-WORKFLOW-011'],
  },
  {
    name: 'Recursive source map and node_modules artifact are left in the tree',
    file: 'web/dist/assets/app.js.map',
    snippet: 'sourcemap output',
    expectedRules: ['DEFAULT-WORKFLOW-011'],
  },
  {
    name: 'Database migration changes schema',
    file: 'db/mysql/migrations/V20260614__drop_legacy_user.sql',
    snippet: 'drop table legacy_user;',
    expectedRules: ['DEFAULT-MYSQL-DDL-001', 'DEFAULT-WORKFLOW-005'],
  },
  {
    name: 'MySQL migration tightens constraints during rollout',
    file: 'migrations/mysql/V20260615__add_order_unique_key.sql',
    snippet: 'alter table orders add unique key uk_order_no(order_no), modify buyer_name varchar(20) not null;',
    expectedRules: ['DEFAULT-MYSQL-DDL-003', 'DEFAULT-MYSQL-CONS-001', 'DEFAULT-MYSQL-NULL-001'],
  },
  {
    name: 'MySQL query uses non-deterministic group by and index-breaking function',
    file: 'src/main/resources/mapper/OrderMapper.xml',
    snippet: 'select user_id, status from orders where date(created_at) = #{day} group by user_id;',
    expectedRules: ['DEFAULT-MYSQL-QUERY-001', 'DEFAULT-MYSQL-QUERY-002'],
  },
  {
    name: 'Oracle migration adds hot-table constraint and sequence logic',
    file: 'db/oracle/migrations/V20260616__order_constraints.sql',
    snippet: 'alter table orders add constraint uk_order_no unique(order_no); select max(id)+1 into v_id from orders;',
    expectedRules: ['DEFAULT-ORACLE-DDL-003', 'DEFAULT-ORACLE-CONS-001', 'DEFAULT-ORACLE-SEQ-001'],
  },
  {
    name: 'Oracle package uses autonomous transaction and broad grants',
    file: 'db/oracle/packages/audit_admin.pkb',
    snippet: 'pragma autonomous_transaction; grant select any table to app_user;',
    expectedRules: ['DEFAULT-ORACLE-TXN-003', 'DEFAULT-ORACLE-PRIV-001'],
  },
  {
    name: 'MySQL migration drops partition and changes JSON query path without recovery evidence',
    file: 'migrations/mysql/V20260617__archive_orders.sql',
    snippet: 'alter table orders drop partition p202401; select * from orders where json_extract(ext, "$.channel") = "app";',
    expectedRules: ['DEFAULT-MYSQL-PART-001', 'DEFAULT-MYSQL-JSON-001', 'DEFAULT-MYSQL-BACKUP-001'],
  },
  {
    name: 'MySQL batch job updates many rows and needs execution-plan and replication review',
    file: 'src/main/java/com/acme/job/OrderBackfillJob.java',
    snippet: 'orderMapper.backfillAllPaidOrders(); // new large update without EXPLAIN, scan estimate, slow-query budget or binlog delay plan',
    expectedRules: ['DEFAULT-MYSQL-PLAN-001', 'DEFAULT-MYSQL-REPL-001'],
  },
  {
    name: 'Oracle partition maintenance uses database link and needs recovery window',
    file: 'db/oracle/migrations/V20260618__exchange_order_partition.sql',
    snippet: 'alter table orders exchange partition p202406 with table orders_stage; select * from user@prod_link; delete from orders where created_at < date "2024-01-01"; -- no Flashback/RMAN/export recovery window documented',
    expectedRules: ['DEFAULT-ORACLE-PART-001', 'DEFAULT-ORACLE-DBLINK-001', 'DEFAULT-ORACLE-RECOVER-002'],
  },
  {
    name: 'Oracle batch procedure changes core SQL without plan evidence',
    file: 'db/oracle/packages/order_batch.pkb',
    snippet: 'for r in c loop update orders set status = v_status where id = r.id; commit; end loop;',
    expectedRules: ['DEFAULT-ORACLE-BULK-001', 'DEFAULT-ORACLE-PLAN-001'],
  },
  {
    name: 'Drools rule uses global side effect and non-idempotent money logic',
    file: 'rules/pricing/payment.drl',
    snippet: `
      global PaymentService paymentService;
      then
        paymentService.charge($order.getId(), new BigDecimal(0.1).divide(rate));
    `,
    expectedRules: ['DEFAULT-DROOLS-GLOBAL-001', 'DEFAULT-DROOLS-IDEMP-001', 'DEFAULT-DROOLS-NUM-001'],
  },
  {
    name: 'Drools dynamic rule service loads remote rules without release guard',
    file: 'src/main/java/com/acme/rules/RuleEngineService.java',
    snippet: 'kieScanner.start(1000L); kieHelper.addContent(remoteDrlFromTenant, ResourceType.DRL);',
    expectedRules: ['DEFAULT-DROOLS-RELEASE-001', 'DEFAULT-DROOLS-SEC-001'],
  },
  {
    name: 'Seata TCC branch catches failure and misses rollback contract',
    file: 'src/main/java/com/acme/payment/PaymentService.java',
    snippet: `
      @GlobalTransactional
      public void pay() {
        try { accountTccAction.prepare(null, orderId); } catch (Exception ignored) { return; }
      }
      public boolean rollback(BusinessActionContext ctx) { return true; }
    `,
    expectedRules: ['DEFAULT-JAVA-SEATA-001', 'DEFAULT-JAVA-SEATA-002'],
  },
  {
    name: 'Spring Cloud client trusts user header and retries non-idempotent call',
    file: 'src/main/java/com/acme/client/OrderFeignClient.java',
    snippet: `
      @RequestHeader("X-User-Id") String userId;
      retryTemplate.execute(ctx -> restTemplate.postForObject(url, order, Void.class));
    `,
    expectedRules: ['DEFAULT-JAVA-CLOUD-001', 'DEFAULT-JAVA-CLOUD-002'],
  },
  {
    name: 'Java nullable map value and async failure are ignored',
    file: 'src/main/java/com/acme/async/AsyncOrderService.java',
    snippet: `
      String name = names.get(id).trim();
      CompletableFuture.runAsync(() -> send()).exceptionally(ex -> null);
      catch (InterruptedException ex) { log.warn("ignored"); }
    `,
    expectedRules: ['DEFAULT-JAVA-NULL-001', 'DEFAULT-JAVA-ERRPRONE-001'],
  },
  {
    name: 'PostgreSQL migration uses security definer and blocking hot-table DDL',
    file: 'db/postgresql/V20260619__admin_function.sql',
    snippet: `
      create function admin_run(sql text) returns void security definer language plpgsql as $ begin execute sql; end $;
      create index idx_order_status on orders(status);
    `,
    expectedRules: ['DEFAULT-POSTGRESQL-SEC-001', 'DEFAULT-POSTGRESQL-DDL-001'],
  },
  {
    name: 'PostgreSQL mapper locks rows without bounded wait and tenant policy',
    file: 'src/main/resources/mapper/PostgresOrderMapper.xml',
    snippet: 'select * from orders where status = #{status} for update; alter table orders disable row level security;',
    expectedRules: ['DEFAULT-POSTGRESQL-TXN-001', 'DEFAULT-POSTGRESQL-RLS-001'],
  },
  {
    name: 'OceanBase migration mixes tenant dialect and risky online DDL',
    file: 'db/oceanbase/V20260620__orders.sql',
    snippet: 'create tenant app_tenant; select seq_order.nextval from dual; alter table orders add global index g_idx_user(user_id);',
    expectedRules: ['DEFAULT-OCEANBASE-COMPAT-001', 'DEFAULT-OCEANBASE-DDL-001'],
  },
  {
    name: 'Redis distributed lock uses setnx expire split and broad key scan',
    file: 'src/main/java/com/acme/cache/RedisLockService.java',
    snippet: `
      redis.setnx(key, "1");
      redis.expire(key, 30);
      redis.keys("order:*").forEach(redis::del);
    `,
    expectedRules: ['DEFAULT-REDIS-LOCK-001', 'DEFAULT-REDIS-CMD-001'],
  },
  {
    name: 'Redis cache stores permanent cross-tenant permissions',
    file: 'src/app/redis/permissions_cache.py',
    snippet: 'redis.set("perm:" + user_id, json.dumps(roles)); redis.publish("pay", pickle.dumps(event))',
    expectedRules: ['DEFAULT-REDIS-CACHE-001', 'DEFAULT-REDIS-SERIAL-001'],
  },
  {
    name: 'RabbitMQ listener auto-acks and infinitely requeues poison messages',
    file: 'src/main/java/com/acme/mq/PaymentListener.java',
    snippet: `
      @RabbitListener(queues = "pay")
      public void on(Message message) { channel.basicAck(tag, false); throw new RuntimeException(); }
      channel.basicNack(tag, false, true);
    `,
    expectedRules: ['DEFAULT-RABBITMQ-ACK-001', 'DEFAULT-RABBITMQ-RETRY-001'],
  },
  {
    name: 'RabbitMQ publisher sends critical event without confirm or durable delivery',
    file: 'src/main/resources/rabbitmq/application-rabbit.yaml',
    snippet: `
      spring.rabbitmq.publisher-confirm-type: none
      queue.durable: false
      deliveryMode: NON_PERSISTENT
    `,
    expectedRules: ['DEFAULT-RABBITMQ-DELIVERY-001'],
  },
  {
    name: 'Vue setup registers watch after await and loses cleanup',
    file: 'src/views/User.vue',
    snippet: `
      await loadUser();
      watch(route, () => fetchUser());
      window.addEventListener("resize", onResize);
    `,
    expectedRules: ['DEFAULT-VUE-CONTRACT-004', 'DEFAULT-VUE-CONTRACT-005'],
  },
  {
    name: 'Vue router input and API response are trusted without schema',
    file: 'src/api/user.ts',
    snippet: `
      const id = route.query.id as string;
      const user = await res.json() as User;
    `,
    expectedRules: ['DEFAULT-VUE-ROUTER-001', 'DEFAULT-FE-TS-002'],
  },
  {
    name: 'Frontend lint and scan gates are globally disabled',
    file: 'eslint.config.js',
    snippet: 'rules: { "vue/no-v-html": "off", "@typescript-eslint/no-unsafe-assignment": "off" }',
    expectedRules: ['DEFAULT-FE-LINT-001'],
  },
  {
    name: 'Semgrep ignores frontend and security paths',
    file: '.semgrepignore',
    snippet: 'src/**/*.vue\nsecurity/**\n**/*.ts',
    expectedRules: ['DEFAULT-SEC-SCAN-001'],
  },
  {
    name: 'Production build exposes source maps',
    file: 'vite.config.ts',
    snippet: 'export default defineConfig({ build: { sourcemap: true } })',
    expectedRules: ['DEFAULT-FE-BUILD-001'],
  },
  {
    name: 'SQLFluff CI runs without dialect and autofixes migrations',
    file: '.github/workflows/sqlfluff.yml',
    snippet: 'sqlfluff fix migrations --force',
    expectedRules: ['DEFAULT-SQLFLUFF-CI-001'],
  },
];

function allDefaultRules() {
  return Object.entries(DEFAULT_DOCS)
    .filter(([file]) => file.startsWith('docs/default/'))
    .flatMap(([file, markdown]) => parseMarkdownRules(markdown, { source: 'Default Rules', file, weight: 1 }));
}

function globToRegExp(glob) {
  const doubleStarSlash = '\0DOUBLE_STAR_SLASH\0';
  const doubleStar = '\0DOUBLE_STAR\0';
  const escaped = glob
    .replace(/\*\*\//g, doubleStarSlash)
    .replace(/\*\*/g, doubleStar)
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '[^/]*')
    .replaceAll(doubleStarSlash, '(?:.*/)?')
    .replaceAll(doubleStar, '.*');
  return new RegExp(`^${escaped}$`);
}

function pathMatches(glob, file) {
  return globToRegExp(glob.replaceAll('\\', '/')).test(file.replaceAll('\\', '/'));
}

test('demo enterprise-stack snippets are covered by default rule path scopes', () => {
  const rulesById = new Map(allDefaultRules().map((rule) => [rule.id, rule]));

  for (const sample of demoSamples) {
    assert.ok(sample.snippet.trim(), `${sample.name} should include a demo snippet`);
    for (const ruleId of sample.expectedRules) {
      const rule = rulesById.get(ruleId);
      assert.ok(rule, `${ruleId} should exist for demo: ${sample.name}`);
      assert.ok(
        rule.paths.some((glob) => pathMatches(glob, sample.file)),
        `${ruleId} should cover ${sample.file} for demo: ${sample.name}`,
      );
    }
  }
});
