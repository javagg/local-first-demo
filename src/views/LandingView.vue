<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">电磁仿真云 SaaS</h1>
        <p class="hero-subtitle">企业级电磁场仿真计算平台</p>
        <p class="hero-description">
          基于云端 OPFS 本地存储和高性能计算引擎，为您提供快速、可靠的电磁仿真解决方案
        </p>
        <button class="btn btn-primary" @click="emit('start')">开始体验</button>
      </div>
      <div class="hero-illustration">
        <div class="wave"></div>
        <div class="wave"></div>
        <div class="wave"></div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <h2>核心功能</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>本地优先存储</h3>
          <p>利用浏览器 OPFS 技术，数据存储在本地，隐私更安全</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🚀</div>
          <h3>高性能计算</h3>
          <p>WebAssembly 加速，本地离线计算，毫秒级响应</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">☁️</div>
          <h3>云端同步</h3>
          <p>支持与云端无缝同步，实现多设备协作</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>智能分析</h3>
          <p>完整的仿真结果可视化及数据分析工具</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔒</div>
          <h3>安全可靠</h3>
          <p>企业级加密，数据备份，99.9% 可用性保证</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🛠️</div>
          <h3>开发友好</h3>
          <p>RESTful API，丰富的 SDK，快速集成</p>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="benefits">
      <h2>为什么选择我们</h2>
      <div class="benefits-list">
        <div class="benefit-item">
          <h4>⏱️ 更快的原型设计</h4>
          <p>本地计算无网络延迟，加速您的设计迭代周期</p>
        </div>
        <div class="benefit-item">
          <h4>💰 降低计算成本</h4>
          <p>充分利用本地计算资源，减少服务器成本</p>
        </div>
        <div class="benefit-item">
          <h4>🌐 离线工作能力</h4>
          <p>无网络时也能继续工作，数据自动同步</p>
        </div>
        <div class="benefit-item">
          <h4>📈 可扩展架构</h4>
          <p>从个人研发扩展到企业级生产环境</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <h2>立即开始使用电磁仿真云</h2>
      <p>免费试用，无需信用卡</p>
      <button class="btn btn-primary" @click="emit('start')">免费开始</button>
    </section>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  start: [];
}>();
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
  overflow-x: hidden;
}

/* Hero Section */
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 100vh;
  padding: 80px 40px;
  gap: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-content {
  flex: 1;
  z-index: 2;
  animation: slideInLeft 0.8s ease-out;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  margin: 0 0 20px 0;
  line-height: 1.1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 1.5rem;
  margin: 0 0 20px 0;
  opacity: 0.95;
  font-weight: 600;
}

.hero-description {
  font-size: 1.1rem;
  margin: 0 0 40px 0;
  opacity: 0.9;
  line-height: 1.6;
  max-width: 500px;
}

.hero-illustration {
  flex: 1;
  position: relative;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wave {
  position: absolute;
  width: 300px;
  height: 300px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  animation: wave 4s ease-in-out infinite;
}

.wave:nth-child(2) {
  width: 400px;
  height: 400px;
  animation-delay: 0.5s;
}

.wave:nth-child(3) {
  width: 500px;
  height: 500px;
  animation-delay: 1s;
}

@keyframes wave {
  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1);
    opacity: 0.3;
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Features Section */
.features {
  padding: 120px 40px;
  background: #f8f9fa;
}

.features h2,
.benefits h2,
.cta h2 {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 60px;
  color: #667eea;
  font-weight: 800;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.2);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.feature-card h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.3rem;
}

.feature-card p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

/* Benefits Section */
.benefits {
  padding: 120px 40px;
  background: white;
}

.benefits-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.benefit-item {
  padding: 30px;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-left: 4px solid #667eea;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.benefit-item:hover {
  border-left-color: #764ba2;
  background: linear-gradient(135deg, #667eea25 0%, #764ba225 100%);
}

.benefit-item h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.2rem;
}

.benefit-item p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

/* CTA Section */
.cta {
  padding: 120px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.cta h2 {
  color: white;
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.cta p {
  font-size: 1.2rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

/* Button Styles */
.btn {
  padding: 14px 40px;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  text-transform: none;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    padding: 40px 20px;
    min-height: auto;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .features h2,
  .benefits h2,
  .cta h2 {
    font-size: 2rem;
  }

  .features,
  .benefits,
  .cta {
    padding: 60px 20px;
  }

  .hero-illustration {
    height: 250px;
  }

  .wave {
    width: 150px;
    height: 150px;
  }

  .wave:nth-child(2) {
    width: 200px;
    height: 200px;
  }

  .wave:nth-child(3) {
    width: 250px;
    height: 250px;
  }
}
</style>
