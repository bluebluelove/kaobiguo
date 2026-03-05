<template>
  <div class="forgot-view">
    <div class="forgot-card">
      <h1 class="forgot-title">Forgot password?</h1>
      <p class="forgot-text">This feature is coming soon. Please contact support or try signing in.</p>
      <router-link to="/login" class="forgot-link">Back to Sign In</router-link>
    </div>
  </div>
</template>

<script setup>
// Placeholder for forgot password flow
</script>

<style scoped>
.forgot-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
}
.forgot-card {
  max-width: 400px;
  padding: 2rem;
  text-align: center;
}
.forgot-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}
.forgot-text {
  color: #6b7280;
  margin-bottom: 1rem;
}
.forgot-link {
  color: #2563eb;
  text-decoration: none;
}
.forgot-link:hover {
  text-decoration: underline;
}
</style>
