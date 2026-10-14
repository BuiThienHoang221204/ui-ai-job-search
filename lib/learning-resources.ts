export interface LearningResource {
  title: string;
  url: string;
}

const DOCS: Record<string, LearningResource[]> = {
  docker: [{ title: "Docker — Get started", url: "https://docs.docker.com/get-started/" }],
  kubernetes: [{ title: "Kubernetes Basics", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/" }],
  sql: [
    { title: "SQLBolt — bài tập tương tác", url: "https://sqlbolt.com/" },
    { title: "PostgreSQL Tutorial", url: "https://www.postgresql.org/docs/current/tutorial.html" },
  ],
  postgresql: [{ title: "PostgreSQL Tutorial", url: "https://www.postgresql.org/docs/current/tutorial.html" }],
  mysql: [{ title: "MySQL Tutorial", url: "https://dev.mysql.com/doc/refman/8.4/en/tutorial.html" }],
  java: [{ title: "Learn Java (dev.java)", url: "https://dev.java/learn/" }],
  "spring boot": [{ title: "Spring Guides", url: "https://spring.io/guides" }],
  python: [{ title: "The Python Tutorial", url: "https://docs.python.org/3/tutorial/" }],
  git: [{ title: "Pro Git (sách miễn phí)", url: "https://git-scm.com/book/en/v2" }],
  aws: [{ title: "AWS Skill Builder", url: "https://skillbuilder.aws/" }],
  redis: [{ title: "Redis docs", url: "https://redis.io/docs/latest/" }],
  kafka: [{ title: "Apache Kafka Quickstart", url: "https://kafka.apache.org/quickstart" }],
  "ci/cd": [{ title: "GitHub Actions docs", url: "https://docs.github.com/en/actions" }],
  javascript: [{ title: "MDN — JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" }],
  typescript: [{ title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html" }],
  react: [{ title: "React — Learn", url: "https://react.dev/learn" }],
  "node.js": [{ title: "Node.js — Learn", url: "https://nodejs.org/en/learn" }],
  graphql: [{ title: "Learn GraphQL", url: "https://graphql.org/learn/" }],
  go: [{ title: "A Tour of Go", url: "https://go.dev/tour/" }],
  ".net": [{ title: "Learn .NET", url: "https://dotnet.microsoft.com/en-us/learn" }],
  "rest apis": [{ title: "MDN — HTTP", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP" }],
  microservices: [{ title: "microservices.io — Patterns", url: "https://microservices.io/patterns/" }],
  excel: [{ title: "Microsoft — Excel help & learning", url: "https://support.microsoft.com/en-us/excel" }],
};

const ALIASES: Record<string, string> = {
  golang: "go",
  "c#": ".net",
  "asp.net": ".net",
  "asp.net core": ".net",
  postgres: "postgresql",
  nodejs: "node.js",
  reactjs: "react",
  "rest api": "rest apis",
  restful: "rest apis",
  k8s: "kubernetes",
  "amazon web services": "aws",
  "cicd": "ci/cd",
};

/** Tài liệu chính thức có sẵn cho kỹ năng; không có thì link tìm kiếm — KHÔNG để model bịa tên khoá học. */
export function resourcesFor(skill: string): { docs: LearningResource[]; searchUrl: string } {
  const key = skill.trim().toLowerCase();
  const docs = DOCS[ALIASES[key] ?? key] ?? [];
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${skill} tài liệu học chính thức`)}`;
  return { docs, searchUrl };
}

/** Tên miền ngắn để hiện cạnh link, cho người dùng thấy trước mình sẽ tới trang nào. */
export const hostOf = (url: string) => new URL(url).hostname.replace(/^www\./, "");
