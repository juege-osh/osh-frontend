<template>
    <div class="app-layout">
        <NavBar/>
        <main class="main-content">
            <div class="content-wrapper">
                <slot/>
            </div>
        </main>
        <PageFooter/>
    </div>
</template>

<style scoped>
/* Leantime-inspired Layout */
.app-layout {
    min-width: 1000px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f8fafc;
}

.main-content {
    flex: 1;
    width: 100%;
    padding: 0;
}

.content-wrapper {
    width: 100%;
    margin: 0;
    padding: 0;
}

/* Responsive */
@media (max-width: 1200px) {
    .content-wrapper {
        max-width: 100%;
        padding: 0 var(--space-md);
    }
}

@media (max-width: 768px) {
    .app-layout {
        min-width: auto;
    }
    
    .main-content {
        padding: var(--space-lg) 0;
    }
}
</style>