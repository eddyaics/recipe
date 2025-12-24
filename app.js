// ========================================
// Recipe Website Application
// ========================================

class RecipeApp {
  constructor() {
    this.recipes = recipes;
    this.activeFilters = {
      taste: [],
      meal: [],
      time: [],
      ingredient: []
    };
    this.searchQuery = '';
    this.currentRecipeId = null;

    this.init();
  }

  init() {
    this.renderRecipeList();
    this.bindEvents();
  }

  // ========================================
  // 渲染食譜列表
  // ========================================
  renderRecipeList() {
    const listContainer = document.getElementById('recipeList');
    const filteredRecipes = this.getFilteredRecipes();

    if (filteredRecipes.length === 0) {
      listContainer.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <p>沒有找到符合條件的食譜</p>
                </div>
            `;
      return;
    }

    listContainer.innerHTML = filteredRecipes.map(recipe => `
            <div class="recipe-item ${this.currentRecipeId === recipe.id ? 'active' : ''}" 
                 data-id="${recipe.id}">
                <span class="recipe-item-icon">${recipe.icon}</span>
                <span class="recipe-item-name">${recipe.name}</span>
            </div>
        `).join('');
  }

  // ========================================
  // 過濾食譜
  // 同類別使用 OR，不同類別使用 AND
  // 同時包含搜尋字串過濾 (名稱 or 標籤)
  // ========================================
  getFilteredRecipes() {
    const query = this.searchQuery.toLowerCase().trim();

    return this.recipes.filter(recipe => {
      // 1. 搜尋字串過濾 (名稱 或 標籤)
      if (query) {
        const matchesName = recipe.name.toLowerCase().includes(query);
        const matchesTags = Object.values(recipe.tags).some(tagValue =>
          tagValue && tagValue.toLowerCase().includes(query)
        );

        if (!matchesName && !matchesTags) {
          return false;
        }
      }

      // 2. 標籤過濾 (AND 關係)
      for (const [category, selectedTags] of Object.entries(this.activeFilters)) {
        if (selectedTags.length === 0) continue;

        const recipeTag = recipe.tags[category];

        if (recipeTag === null || recipeTag === undefined) {
          return false;
        }

        const matchesAny = selectedTags.some(tag => recipeTag === tag);
        if (!matchesAny) {
          return false;
        }
      }
      return true;
    });
  }

  // ========================================
  // 顯示食譜詳情
  // ========================================
  showRecipeDetail(recipeId) {
    const recipe = this.recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    this.currentRecipeId = recipeId;
    this.renderRecipeList(); // 更新列表選中狀態

    const detailContainer = document.getElementById('recipeDetail');

    // 構建標籤 HTML
    const tagsHtml = this.buildTagsHtml(recipe.tags);

    detailContainer.innerHTML = `
            <div class="recipe-content">
                <header class="recipe-header">
                    <h1 class="recipe-name">${recipe.icon} ${recipe.name}</h1>
                    <div class="recipe-tags">
                        ${tagsHtml}
                    </div>
                </header>
                
                <section class="recipe-instructions">
                    <h2 class="instructions-title">烹飪方法</h2>
                    <div class="instructions-content">
                        ${this.formatInstructions(recipe.instructions)}
                    </div>
                </section>
                
                <section class="recipe-image-section">
                    <h2 class="image-title">成品照片</h2>
                    <div class="recipe-image-container">
                        <img src="${recipe.image}" 
                             alt="${recipe.name}" 
                             class="recipe-image"
                             loading="lazy">
                    </div>
                </section>
            </div>
        `;

    // 每次選擇新食譜時，將頁面捲動回頂部
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // ========================================
  // 構建標籤 HTML
  // ========================================
  buildTagsHtml(tags) {
    const tagConfigs = {
      taste: {
        '甜食': { icon: '🍰', class: 'taste-sweet' },
        '鹹食': { icon: '🍖', class: 'taste-savory' }
      },
      meal: {
        '早餐': { icon: '☀️', class: '' },
        '午晚餐': { icon: '🌙', class: '' }
      },
      time: {
        '<30m': { icon: '⚡', class: 'time-quick' },
        '30m-1h': { icon: '⏰', class: '' },
        '>1h': { icon: '⏳', class: '' }
      },
      ingredient: {
        '豬肉': { icon: '🐷', class: '' },
        '雞肉': { icon: '🐔', class: '' },
        '禽肉': { icon: '🍗', class: '' },
        '魚肉': { icon: '🐟', class: '' },
        '牛肉': { icon: '🐄', class: '' },
        '海鮮': { icon: '🍤', class: '' },
        '蔬食': { icon: '🥬', class: '' },
        '其他': { icon: '🍢', class: '' }
      }
    };

    let html = '';

    for (const [category, value] of Object.entries(tags)) {
      if (value === null) continue;

      const config = tagConfigs[category]?.[value];
      if (config) {
        html += `<span class="recipe-tag ${config.class}">${config.icon} ${value}</span>`;
      }
    }

    return html;
  }

  // ========================================
  // 格式化烹飪說明
  // ========================================
  formatInstructions(instructions) {
    return instructions
      .replace(/【(.+?)】/g, '<strong style="color: var(--text-primary); font-size: 1.1rem;">【$1】</strong>')
      .replace(/(\d+)\./g, '<br><strong>$1.</strong>')
      .replace(/•/g, '<span style="color: #667eea;">•</span>');
  }

  // ========================================
  // 切換過濾標籤
  // ========================================
  toggleFilter(category, tag) {
    const index = this.activeFilters[category].indexOf(tag);

    if (index === -1) {
      this.activeFilters[category].push(tag);
    } else {
      this.activeFilters[category].splice(index, 1);
    }

    this.renderRecipeList();
  }

  // ========================================
  // 清除所有過濾
  // ========================================
  clearFilters() {
    this.activeFilters = {
      taste: [],
      meal: [],
      time: [],
      ingredient: []
    };
    this.searchQuery = '';

    // 重置搜尋框
    const searchInput = document.getElementById('recipeSearch');
    if (searchInput) searchInput.value = '';

    // 移除所有 active 類別
    document.querySelectorAll('.filter-tag.active').forEach(tag => {
      tag.classList.remove('active');
    });

    this.renderRecipeList();
  }

  // ========================================
  // 綁定事件
  // ========================================
  bindEvents() {
    // 搜尋功能
    const searchInput = document.getElementById('recipeSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderRecipeList();
      });
    }

    // 側邊欄切換 (手機版)
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    const toggleSidebar = () => {
      sidebar.classList.toggle('active');
      overlay.classList.toggle('active');
      document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    };

    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', toggleSidebar);
    }

    if (overlay) {
      overlay.addEventListener('click', toggleSidebar);
    }

    // 側邊欄區塊折疊/展開
    document.querySelectorAll('.section-header').forEach(header => {
      header.addEventListener('click', () => {
        const section = header.closest('.sidebar-section');
        section.classList.toggle('collapsed');
      });
    });

    // 食譜列表點擊事件
    document.getElementById('recipeList').addEventListener('click', (e) => {
      const recipeItem = e.target.closest('.recipe-item');
      if (recipeItem) {
        const recipeId = parseInt(recipeItem.dataset.id);
        this.showRecipeDetail(recipeId);

        // 手機版選中後自動收起
        if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
          toggleSidebar();
        }
      }
    });

    // 過濾標籤點擊事件
    document.querySelectorAll('.filter-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const category = tag.closest('.filter-tags').dataset.category;
        const tagValue = tag.dataset.tag;

        tag.classList.toggle('active');
        this.toggleFilter(category, tagValue);
      });
    });

    // 清除過濾按鈕
    document.getElementById('clearFilters').addEventListener('click', () => {
      this.clearFilters();
    });
  }
}

// 初始化應用
document.addEventListener('DOMContentLoaded', () => {
  window.recipeApp = new RecipeApp();
});
