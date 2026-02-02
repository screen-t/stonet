export const authApi = {
  googleOAuth: () => fetch("/auth/oauth/google").then(r => r.json()),
  githubOAuth: () => fetch("/auth/oauth/github").then(r => r.json()),
  linkedinOAuth: () => fetch("/auth/oauth/linkedin").then(r => r.json()),
}
