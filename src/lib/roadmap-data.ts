// Java Backend Developer Roadmap (roadmap.sh — Spring Boot track)
// Each item can be: "not_started" | "in_progress" | "done"

export type RoadmapStatus = "not_started" | "in_progress" | "done"

export interface RoadmapItem {
  id: string
  title: string
  description: string
  resources?: string[]
  status: RoadmapStatus
}

export interface RoadmapSection {
  id: string
  title: string
  icon: string
  color: string
  items: RoadmapItem[]
}

export const ROADMAP: RoadmapSection[] = [
  {
    id: "java-core",
    title: "Core Java",
    icon: "☕",
    color: "hsl(25 95% 60%)",
    items: [
      { id: "j1", title: "OOP Principles", description: "Classes, Objects, Inheritance, Polymorphism, Encapsulation, Abstraction", status: "not_started" },
      { id: "j2", title: "Collections Framework", description: "List, Set, Map, Queue, Iterator, Generics", status: "not_started" },
      { id: "j3", title: "Concurrency & Multithreading", description: "Threads, ExecutorService, synchronized, volatile, CompletableFuture", status: "not_started" },
      { id: "j4", title: "Java 8+ Features", description: "Streams, Lambda, Optional, Functional interfaces, Date/Time API", status: "not_started" },
      { id: "j5", title: "Exception Handling", description: "Checked/unchecked exceptions, Custom exceptions, try-with-resources", status: "not_started" },
      { id: "j6", title: "I/O & NIO", description: "File I/O, BufferedReader, NIO, Serialization", status: "not_started" },
      { id: "j7", title: "JVM Internals", description: "Memory model, GC, ClassLoader, JIT compilation", status: "not_started" },
      { id: "j8", title: "Design Patterns", description: "Singleton, Factory, Builder, Observer, Strategy, Decorator", status: "not_started" },
    ],
  },
  {
    id: "build-tools",
    title: "Build & Version Control",
    icon: "🔧",
    color: "hsl(200 80% 55%)",
    items: [
      { id: "b1", title: "Maven", description: "POM.xml, Dependencies, Plugins, Build lifecycle, Maven repositories", status: "not_started" },
      { id: "b2", title: "Gradle", description: "build.gradle, tasks, dependency management", status: "not_started" },
      { id: "b3", title: "Git Advanced", description: "Branching, Rebase, Cherry-pick, Git Flow, PR workflow", status: "not_started" },
    ],
  },
  {
    id: "spring-core",
    title: "Spring Core",
    icon: "🌱",
    color: "hsl(130 60% 50%)",
    items: [
      { id: "sc1", title: "Spring IoC & DI", description: "ApplicationContext, BeanFactory, @Component, @Autowired, @Bean", status: "not_started" },
      { id: "sc2", title: "Spring AOP", description: "Aspect, JoinPoint, Advice types, @Aspect, Proxy pattern", status: "not_started" },
      { id: "sc3", title: "Spring Configuration", description: "@Configuration, @PropertySource, Environment, Profiles (@Profile)", status: "not_started" },
      { id: "sc4", title: "Spring Events", description: "ApplicationEvent, @EventListener, async events", status: "not_started" },
    ],
  },
  {
    id: "spring-boot",
    title: "Spring Boot",
    icon: "🚀",
    color: "hsl(142 71% 45%)",
    items: [
      { id: "sb1", title: "Spring Boot Basics", description: "@SpringBootApplication, Auto-configuration, Starter dependencies, application.yml", status: "not_started" },
      { id: "sb2", title: "REST APIs", description: "@RestController, @RequestMapping, @PathVariable, @RequestBody, ResponseEntity", status: "not_started" },
      { id: "sb3", title: "Spring Data JPA", description: "JpaRepository, JPQL, @Entity, @Query, Pagination, Specifications", status: "not_started" },
      { id: "sb4", title: "Spring Security", description: "Authentication, Authorization, JWT, OAuth2, CORS, CSRF", status: "not_started" },
      { id: "sb5", title: "Spring Validation", description: "@Valid, @NotNull, @Size, Custom validators, ConstraintValidator", status: "not_started" },
      { id: "sb6", title: "Spring Cache", description: "@Cacheable, @CacheEvict, Redis cache integration", status: "not_started" },
      { id: "sb7", title: "Actuator & Monitoring", description: "Health endpoints, Metrics, Prometheus, Micrometer, Grafana", status: "not_started" },
      { id: "sb8", title: "Spring Testing", description: "@SpringBootTest, MockMvc, @WebMvcTest, Testcontainers, Mockito", status: "not_started" },
      { id: "sb9", title: "Exception Handling", description: "@ControllerAdvice, @ExceptionHandler, ProblemDetail (RFC 7807)", status: "not_started" },
      { id: "sb10", title: "Spring Batch", description: "Job, Step, ItemReader/Processor/Writer, Scheduling", status: "not_started" },
    ],
  },
  {
    id: "databases",
    title: "Databases",
    icon: "🗄️",
    color: "hsl(260 60% 65%)",
    items: [
      { id: "db1", title: "SQL Fundamentals", description: "DDL/DML, Joins, Indexes, Views, Stored Procedures, Transactions", status: "not_started" },
      { id: "db2", title: "PostgreSQL", description: "psql, JSONB, Full-text search, Partitioning, EXPLAIN ANALYZE", status: "not_started" },
      { id: "db3", title: "MySQL", description: "InnoDB, Query optimization, Replication basics", status: "not_started" },
      { id: "db4", title: "Redis", description: "Data types, TTL, Pub/Sub, Lua scripts, Redis as cache/session", status: "not_started" },
      { id: "db5", title: "MongoDB", description: "Documents, Aggregation pipeline, Indexes, Spring Data MongoDB", status: "not_started" },
      { id: "db6", title: "Database Design", description: "Normalization, ERD, ACID, CAP theorem, Sharding vs Replication", status: "not_started" },
      { id: "db7", title: "Query Optimization", description: "EXPLAIN, Query hints, Index strategies, N+1 problem, connection pooling (HikariCP)", status: "not_started" },
    ],
  },
  {
    id: "messaging",
    title: "Messaging & Events",
    icon: "📨",
    color: "hsl(45 93% 55%)",
    items: [
      { id: "mq1", title: "Apache Kafka", description: "Topics, Partitions, Consumer Groups, Producers, Offset management, Spring Kafka", status: "not_started" },
      { id: "mq2", title: "RabbitMQ", description: "Exchanges, Queues, Bindings, Dead letter queues, Spring AMQP", status: "not_started" },
      { id: "mq3", title: "Event-Driven Architecture", description: "Event sourcing, CQRS, Saga pattern, Transactional outbox", status: "not_started" },
    ],
  },
  {
    id: "apis",
    title: "APIs & Integration",
    icon: "🔗",
    color: "hsl(190 80% 50%)",
    items: [
      { id: "api1", title: "REST API Design", description: "REST principles, Versioning, HATEOAS, OpenAPI/Swagger, Rate limiting", status: "not_started" },
      { id: "api2", title: "GraphQL", description: "Schema, Resolvers, Queries/Mutations, Spring for GraphQL", status: "not_started" },
      { id: "api3", title: "gRPC", description: "Protobuf, Service definitions, Spring gRPC, Streaming", status: "not_started" },
      { id: "api4", title: "WebSockets", description: "STOMP protocol, Spring WebSocket, SockJS, Real-time push", status: "not_started" },
      { id: "api5", title: "OpenFeign / RestClient", description: "Declarative HTTP clients, Circuit breakers, Resilience4j", status: "not_started" },
    ],
  },
  {
    id: "microservices",
    title: "Microservices",
    icon: "🏗️",
    color: "hsl(0 70% 60%)",
    items: [
      { id: "ms1", title: "Microservices Architecture", description: "Service decomposition, Domain-driven design, Bounded contexts", status: "not_started" },
      { id: "ms2", title: "Spring Cloud", description: "Eureka, Gateway, Config Server, LoadBalancer, Sleuth/Zipkin", status: "not_started" },
      { id: "ms3", title: "API Gateway", description: "Spring Cloud Gateway, Routing, Filters, Rate limiting, Auth delegation", status: "not_started" },
      { id: "ms4", title: "Service Mesh", description: "Istio basics, Sidecar pattern, mTLS, Observability", status: "not_started" },
      { id: "ms5", title: "Distributed Transactions", description: "2PC, Saga pattern (Choreography vs Orchestration)", status: "not_started" },
    ],
  },
  {
    id: "devops",
    title: "DevOps & Deployment",
    icon: "⚙️",
    color: "hsl(215 80% 60%)",
    items: [
      { id: "do1", title: "Docker", description: "Dockerfile, docker-compose, Multi-stage builds, .dockerignore", status: "not_started" },
      { id: "do2", title: "Kubernetes", description: "Pods, Deployments, Services, ConfigMaps, Secrets, Ingress, Helm", status: "not_started" },
      { id: "do3", title: "CI/CD", description: "GitHub Actions, Jenkins pipelines, SonarQube, Automated testing gates", status: "not_started" },
      { id: "do4", title: "Cloud (AWS/GCP)", description: "EC2/GCE, RDS, S3, SQS, Lambda, EKS/GKE basics", status: "not_started" },
      { id: "do5", title: "Logging & Observability", description: "ELK Stack, Loki, Prometheus+Grafana, Distributed tracing", status: "not_started" },
    ],
  },
  {
    id: "system-design",
    title: "System Design",
    icon: "🏛️",
    color: "hsl(320 60% 60%)",
    items: [
      { id: "sd1", title: "System Design Fundamentals", description: "Scalability, Availability, Consistency, Latency vs Throughput", status: "not_started" },
      { id: "sd2", title: "Load Balancing", description: "Round-robin, Least connections, Consistent hashing, L4 vs L7", status: "not_started" },
      { id: "sd3", title: "Caching Strategies", description: "Cache-aside, Write-through, Read-through, TTL, Cache invalidation", status: "not_started" },
      { id: "sd4", title: "URL Shortener / TinyURL", description: "Classic system design problem — hashing, redirection, analytics", status: "not_started" },
      { id: "sd5", title: "Design Twitter/Instagram Feed", description: "Fan-out, timeline generation, notifications", status: "not_started" },
      { id: "sd6", title: "Design a Chat System", description: "WebSocket, message queues, read receipts, presence", status: "not_started" },
      { id: "sd7", title: "Design Netflix", description: "CDN, video encoding, adaptive bitrate, recommendation", status: "not_started" },
    ],
  },
  {
    id: "cs-fundamentals",
    title: "CS Fundamentals",
    icon: "📚",
    color: "hsl(170 60% 45%)",
    items: [
      { id: "cs1", title: "Operating Systems", description: "Processes/Threads, Scheduling, Deadlocks, Memory management, Paging", status: "not_started" },
      { id: "cs2", title: "Computer Networks", description: "TCP/IP, HTTP/HTTPS, DNS, TLS, REST vs RPC, TCP vs UDP", status: "not_started" },
      { id: "cs3", title: "DBMS", description: "Transactions, Indexing, Normalization, Concurrency control, WAL", status: "not_started" },
      { id: "cs4", title: "Computer Architecture", description: "CPU, Cache levels, Memory hierarchy, Instruction pipelining", status: "not_started" },
      { id: "cs5", title: "Compiler Design", description: "Lexing, Parsing, AST, Semantic analysis (basics for interviews)", status: "not_started" },
    ],
  },
]

export const ROADMAP_STORAGE_KEY = "sde_roadmap_v1"

export function loadRoadmap(): RoadmapSection[] {
  if (typeof window === "undefined") return ROADMAP
  try {
    const stored = localStorage.getItem(ROADMAP_STORAGE_KEY)
    if (!stored) return ROADMAP
    const statuses: Record<string, RoadmapStatus> = JSON.parse(stored)
    return ROADMAP.map(section => ({
      ...section,
      items: section.items.map(item => ({
        ...item,
        status: statuses[item.id] ?? item.status,
      })),
    }))
  } catch {
    return ROADMAP
  }
}

export function saveRoadmapStatus(itemId: string, status: RoadmapStatus) {
  if (typeof window === "undefined") return
  try {
    const stored = localStorage.getItem(ROADMAP_STORAGE_KEY)
    const statuses: Record<string, RoadmapStatus> = stored ? JSON.parse(stored) : {}
    statuses[itemId] = status
    localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(statuses))
  } catch { /* ignore */ }
}

export function getRoadmapProgress(sections: RoadmapSection[]) {
  const all = sections.flatMap(s => s.items)
  const done = all.filter(i => i.status === "done").length
  const inProgress = all.filter(i => i.status === "in_progress").length
  return { total: all.length, done, inProgress, pct: Math.round((done / all.length) * 100) }
}
